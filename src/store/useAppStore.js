import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Helper for safe localStorage loading
const loadStorage = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

// Helper for safe localStorage saving
const saveStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

// Fail-fast timeout promise to prevent network calls from hanging indefinitely
const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), ms))
  ]);
};

// Default fallback mock data
const DEFAULT_USERS = [
  { id: 'sarah', name: 'Sarah Jenkins', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'marcus', name: 'Marcus Chen', role: 'Member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'elena', name: 'Elena Rostova', role: 'Member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
];

const DEFAULT_PROJECTS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Website Redesign',
    description: 'Overhaul the main site with modern design and fast responsive workflows.',
    status: 'active'
  }
];

const DEFAULT_TASKS = [
  {
    id: 't-1',
    title: 'Design new homepage mockup',
    description: 'Create figma designs for the new landing page',
    status: 'todo',
    assignee: 'marcus',
    project_id: '11111111-1111-1111-1111-111111111111',
    created_by: 'sarah'
  }
];

export const useAppStore = create((set, get) => ({
  // Initialization state - starts as false so app renders instantly without freezing
  isLoading: false,
  isRealtimeSetup: false,
  currentUser: loadStorage('flowspace_user', null),
  readReceipts: loadStorage('flowspace_receipts', {}),
  presenceState: {},
  presenceChannel: null,

  markThreadRead: (taskId, commentId) => {
    set(state => {
      const updated = { ...state.readReceipts, [taskId]: commentId };
      saveStorage('flowspace_receipts', updated);
      return { readReceipts: updated };
    });
  },

  login: (email) => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    const id = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;

    const currentUsers = get().users && get().users.length > 0 ? get().users : DEFAULT_USERS;
    let user = currentUsers.find(u => u.id.toLowerCase() === id || (u.email && u.email.toLowerCase() === cleanEmail));

    if (!user) {
      user = DEFAULT_USERS.find(u => u.id.toLowerCase() === id);
    }

    if (!user) {
      const name = id.charAt(0).toUpperCase() + id.slice(1);
      user = {
        id,
        name,
        role: (id === 'admin' || id === 'sarah') ? 'Admin' : 'Member',
        avatar: null
      };
    }

    if (user) {
      saveStorage('flowspace_user', user);
      set({ currentUser: user });
      const { presenceChannel } = get();
      if (presenceChannel) {
        try {
          presenceChannel.track({
            user_id: user.id,
            typing: false,
            typing_task: null,
            read_receipts: {}
          });
        } catch (err) {
          console.warn("Presence tracking error:", err);
        }
      }
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('flowspace_user');
    set({ currentUser: null, readReceipts: {} });
  },

  // Profile Settings
  updateProfile: async (updates) => {
    const current = get().currentUser;
    if (!current) return;

    const updatedUser = { ...current, ...updates };
    saveStorage('flowspace_user', updatedUser);
    set(state => {
      const updatedUsers = state.users.map(u => u.id === current.id ? updatedUser : u);
      saveStorage('flowspace_users', updatedUsers);
      return { currentUser: updatedUser, users: updatedUsers };
    });

    try {
      await withTimeout(supabase.from('users').update(updates).eq('id', current.id));
    } catch (e) {
      console.warn("Supabase profile update offline:", e.message);
    }
  },

  // Theme State
  isDarkMode: localStorage.getItem('flowspace_theme') === 'dark',
  toggleTheme: () => {
    const newTheme = !get().isDarkMode;
    localStorage.setItem('flowspace_theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDarkMode: newTheme });
  },
  setTheme: (theme) => {
    const isDark = theme === 'dark';
    localStorage.setItem('flowspace_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDarkMode: isDark });
  },

  // UI State
  isNewEntryOpen: false,
  openNewEntry: () => set({ isNewEntryOpen: true }),
  closeNewEntry: () => set({ isNewEntryOpen: false }),

  isOnboardingOpen: !localStorage.getItem('flowspace_onboarded'),
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => {
    localStorage.setItem('flowspace_onboarded', 'true');
    set({ isOnboardingOpen: false });
  },

  // Data State - Loaded from localStorage or fallback defaults
  projects: loadStorage('flowspace_projects', DEFAULT_PROJECTS),
  tasks: loadStorage('flowspace_tasks', DEFAULT_TASKS),
  users: loadStorage('flowspace_users', DEFAULT_USERS),
  comments: loadStorage('flowspace_comments', []),
  files: loadStorage('flowspace_files', []),

  // --- ASYNC ACTIONS WITH RESILIENT FALLBACKS --- //

  fetchAll: async () => {
    try {
      const [filesRes, usersRes, projectsRes, tasksRes, commentsRes] = await withTimeout(
        Promise.all([
          supabase.from('workspace_files').select('*'),
          supabase.from('users').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('tasks').select('*'),
          supabase.from('task_comments').select('*, users(*)')
        ]),
        2500
      );

      set(state => {
        const nextUsers = usersRes?.data?.length ? usersRes.data : state.users;
        const nextProjects = projectsRes?.data?.length ? projectsRes.data : state.projects;
        const nextTasks = tasksRes?.data?.length ? tasksRes.data : state.tasks;
        const nextComments = commentsRes?.data?.length ? commentsRes.data : state.comments;
        const nextFiles = filesRes?.data?.length ? filesRes.data : state.files;

        saveStorage('flowspace_users', nextUsers);
        saveStorage('flowspace_projects', nextProjects);
        saveStorage('flowspace_tasks', nextTasks);
        saveStorage('flowspace_comments', nextComments);
        saveStorage('flowspace_files', nextFiles);

        return {
          users: nextUsers,
          projects: nextProjects,
          tasks: nextTasks,
          comments: nextComments,
          files: nextFiles,
          isLoading: false
        };
      });
    } catch (e) {
      console.warn("Supabase fetch failed or timed out, running in local-first mode.", e.message);
      set({ isLoading: false });
    }
  },

  setupRealtime: () => {
    if (get().isRealtimeSetup) return;

    try {
      // Remove existing channels if present (avoids Vite HMR duplicates)
      const existingChannel = supabase.getChannels().find(c => c.topic === 'realtime:realtime_workspace');
      if (existingChannel) supabase.removeChannel(existingChannel);

      const existingPresence = supabase.getChannels().find(c => c.topic === 'realtime:room_presence');
      if (existingPresence) supabase.removeChannel(existingPresence);

      const channel = supabase.channel('realtime_workspace');

      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newComment = payload.new;
            const currentComments = get().comments;
            if (!currentComments.find(c => c.id === newComment.id)) {
              const userObj = get().users.find(u => u.id === newComment.user_id);
              set((state) => {
                const next = [...state.comments, { ...newComment, users: userObj }];
                saveStorage('flowspace_comments', next);
                return { comments: next };
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            set((state) => {
              const next = state.comments.filter(c => c.id !== deletedId);
              saveStorage('flowspace_comments', next);
              return { comments: next };
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedComment = payload.new;
            set((state) => {
              const next = state.comments.map(c => c.id === updatedComment.id ? { ...c, content: updatedComment.content } : c);
              saveStorage('flowspace_comments', next);
              return { comments: next };
            });
          }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workspace_files' }, (payload) => {
          const newFile = payload.new;
          const currentFiles = get().files;
          if (!currentFiles.find(f => f.id === newFile.id)) {
            set((state) => {
              const next = [...state.files, newFile];
              saveStorage('flowspace_files', next);
              return { files: next };
            });
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'workspace_files' }, (payload) => {
          const deletedId = payload.old.id;
          set((state) => {
            const next = state.files.filter(f => f.id !== deletedId);
            saveStorage('flowspace_files', next);
            return { files: next };
          });
        })
        .subscribe();

      // Presence channel
      const presenceChannel = supabase.channel('room_presence');
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          set({ presenceState: state });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const user = get().currentUser;
            if (user) {
              try {
                await presenceChannel.track({
                  user_id: user.id,
                  typing: false,
                  typing_task: null,
                  read_receipts: {}
                });
              } catch (e) {
                console.warn("Presence track warning:", e);
              }
            }
          }
        });

      set({ isRealtimeSetup: true, presenceChannel });
    } catch (err) {
      console.warn("Realtime setup failed (running in offline mode):", err);
      set({ isRealtimeSetup: true });
    }
  },

  // Presence Actions
  setTyping: async (taskId, isTyping) => {
    const { presenceChannel, currentUser, presenceState } = get();
    if (!presenceChannel || !currentUser) return;

    try {
      const myStateArr = Object.values(presenceState).find(arr => arr[0]?.user_id === currentUser.id);
      const myState = myStateArr ? myStateArr[0] : { read_receipts: {} };

      await presenceChannel.track({
        ...myState,
        user_id: currentUser.id,
        typing: isTyping,
        typing_task: isTyping ? taskId : null
      });
    } catch (e) {
      console.warn("Presence setTyping error:", e);
    }
  },

  updateReadReceipt: async (taskId, commentId) => {
    const { presenceChannel, currentUser, presenceState } = get();
    if (!presenceChannel || !currentUser) return;

    try {
      const myStateArr = Object.values(presenceState).find(arr => arr[0]?.user_id === currentUser.id);
      const myState = myStateArr ? myStateArr[0] : { typing: false, typing_task: null, read_receipts: {} };

      const currentReadId = myState.read_receipts[taskId || 'global'];
      if (currentReadId === commentId) return;

      const newReceipts = { ...myState.read_receipts, [taskId || 'global']: commentId };

      await presenceChannel.track({
        ...myState,
        user_id: currentUser.id,
        read_receipts: newReceipts
      });
    } catch (e) {
      console.warn("Presence updateReadReceipt error:", e);
    }
  },

  // Projects - Optimistic with fallback
  addProject: async (project) => {
    const newProject = {
      id: project.id || `proj_${Date.now()}`,
      status: 'active',
      ...project
    };

    set((state) => {
      const updated = [newProject, ...state.projects];
      saveStorage('flowspace_projects', updated);
      return { projects: updated };
    });

    try {
      await withTimeout(supabase.from('projects').insert([newProject]));
    } catch (e) {
      console.warn("Supabase project sync skipped (local-first):", e.message);
    }
  },

  // Tasks - Optimistic with fallback
  addTask: async (task) => {
    const newTask = {
      id: task.id || `task_${Date.now()}`,
      status: 'todo',
      created_by: get().currentUser?.id,
      ...task
    };

    set((state) => {
      const updated = [newTask, ...state.tasks];
      saveStorage('flowspace_tasks', updated);
      return { tasks: updated };
    });

    try {
      await withTimeout(supabase.from('tasks').insert([newTask]));
    } catch (e) {
      console.warn("Supabase task sync skipped (local-first):", e.message);
    }
  },

  updateTaskStatus: async (taskId, newStatus) => {
    set((state) => {
      const updated = state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      saveStorage('flowspace_tasks', updated);
      return { tasks: updated };
    });

    try {
      await withTimeout(supabase.from('tasks').update({ status: newStatus }).eq('id', taskId));
    } catch (e) {
      console.warn("Supabase task update skipped (local-first):", e.message);
    }
  },

  // Comments - Optimistic with fallback
  addComment: async (taskId, content) => {
    const currentUser = get().currentUser;
    const newComment = {
      id: `comm_${Date.now()}`,
      task_id: taskId,
      user_id: currentUser?.id,
      content,
      created_at: new Date().toISOString(),
      users: currentUser
    };

    set((state) => {
      const updated = [...state.comments, newComment];
      saveStorage('flowspace_comments', updated);
      return { comments: updated };
    });

    try {
      await withTimeout(supabase.from('task_comments').insert([{
        task_id: taskId,
        user_id: currentUser?.id,
        content
      }]));
    } catch (e) {
      console.warn("Supabase comment sync skipped (local-first):", e.message);
    }
  },

  deleteComment: async (commentId) => {
    set((state) => {
      const updated = state.comments.filter(c => c.id !== commentId);
      saveStorage('flowspace_comments', updated);
      return { comments: updated };
    });

    try {
      await withTimeout(supabase.from('task_comments').delete().eq('id', commentId));
    } catch (e) {
      console.warn("Supabase comment delete skipped (local-first):", e.message);
    }
  },

  editComment: async (commentId, newContent) => {
    const finalContent = newContent.includes('\n(edited)') ? newContent : newContent + '\n(edited)';

    set((state) => {
      const updated = state.comments.map(c => c.id === commentId ? { ...c, content: finalContent } : c);
      saveStorage('flowspace_comments', updated);
      return { comments: updated };
    });

    try {
      await withTimeout(supabase.from('task_comments').update({ content: finalContent }).eq('id', commentId));
    } catch (e) {
      console.warn("Supabase comment edit skipped (local-first):", e.message);
    }
  },

  // Files - Optimistic with fallback
  uploadFile: async (file, taskId) => {
    const localUrl = URL.createObjectURL(file);
    const newFileEntry = {
      id: `file_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: localUrl,
      task_id: taskId || null,
      uploaded_by: get().currentUser?.id,
      created_at: new Date().toISOString()
    };

    set((state) => {
      const updated = [newFileEntry, ...state.files];
      saveStorage('flowspace_files', updated);
      return { files: updated };
    });

    // Try remote upload asynchronously
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await withTimeout(
        supabase.storage.from('workspace').upload(fileName, file)
      );

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('workspace').getPublicUrl(fileName);
        if (urlData?.publicUrl) {
          newFileEntry.url = urlData.publicUrl;
          await withTimeout(supabase.from('workspace_files').insert([newFileEntry]));
        }
      }
    } catch (e) {
      console.warn("Supabase storage upload skipped (using local object URL):", e.message);
    }

    return { data: newFileEntry };
  },

  deleteFile: async (fileId) => {
    set((state) => {
      const updated = state.files.filter(f => f.id !== fileId);
      saveStorage('flowspace_files', updated);
      return { files: updated };
    });

    try {
      await withTimeout(supabase.from('workspace_files').delete().eq('id', fileId));
    } catch (e) {
      console.warn("Supabase file delete skipped (local-first):", e.message);
    }
  }
}));
