import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export default function TasksPage() {
  const { tasks, users, projects, updateTaskStatus, addComment, comments, currentUser, uploadFile, editComment, deleteComment, presenceState, setTyping, updateReadReceipt } = useAppStore();
  
  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  
  // Task Detail & Chat Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Track read receipts when viewing a task's comments
  useEffect(() => {
    if (selectedTask && currentUser) {
      const taskComments = comments.filter(c => c.task_id === selectedTask.id);
      const latest = taskComments[taskComments.length - 1];
      if (latest) {
        updateReadReceipt(selectedTask.id, latest.id);
      }
    }
  }, [selectedTask, comments, currentUser, updateReadReceipt]);

  const handleInputChange = (e) => {
    setNewComment(e.target.value);
    
    // Typing indicator logic
    if (selectedTask) {
      setTyping(selectedTask.id, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(selectedTask.id, false);
      }, 2000);
    }
  };

  // Visibility Filter: Show user's tasks + created tasks + fully unassigned (group) tasks
  const displayTasks = tasks.filter(t => 
    t.assignees?.includes(currentUser?.id) || 
    t.assignee === currentUser?.id || 
    t.created_by === currentUser?.id ||
    (!t.assignees?.length && !t.assignee)
  );

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setNewComment("");
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(selectedTask.id, newComment);
    setNewComment("");
    setTyping(selectedTask.id, false);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedTask) return;

    setIsUploading(true);
    const result = await uploadFile(selectedFile, selectedTask.id);
    setIsUploading(false);
    
    // Automatically add a comment linking to the uploaded file
    if (result?.data) {
      addComment(selectedTask.id, `Uploaded a file: ${result.data.name}\n${result.data.url}`);
    }

    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-200', textColor: 'text-slate-600' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-primary-container', textColor: 'text-primary-dim' },
    { id: 'done', title: 'Done', color: 'bg-green-100', textColor: 'text-green-700' }
  ];

  return (
    <div className="p-8 lg:p-12 h-screen flex flex-col relative w-full overflow-hidden">
      <div className="mb-8 flex justify-between items-center w-full">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Tasks</h2>
          <p className="text-slate-500 dark:text-slate-400 font-body mt-2 text-base">
            Track your progress and collaborate with your team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden pb-10">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-4 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between px-2 shrink-0">
              <h3 className="font-headline font-bold text-slate-800 dark:text-slate-100">{col.title}</h3>
              <span className={`${col.color} ${col.textColor} text-xs py-1 px-2.5 rounded-full font-bold`}>
                {displayTasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-8 style-scroll">
              {displayTasks.filter(t => t.status === col.id).map(task => {
                const assignedUsers = users.filter(u => task.assignees?.includes(u.id));
                const taskComments = comments.filter(c => c.task_id === task.id);
                return (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => handleTaskClick(task)}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all cursor-pointer active:cursor-grabbing hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-3 pointer-events-none gap-2">
                      {task.project_id && projects.find(p => p.id === task.project_id) ? (
                        <span className="text-[10px] font-bold font-label text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-md truncate max-w-[140px]" title={projects.find(p => p.id === task.project_id).title}>
                          {projects.find(p => p.id === task.project_id).title}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold font-label text-primary bg-primary-container px-2 py-1 rounded-md">
                          Individual Task
                        </span>
                      )}
                      {taskComments.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                          <span className="text-[11px] font-bold">{taskComments.length}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-headline font-semibold text-slate-800 dark:text-slate-100 mb-2 pointer-events-none leading-snug">{task.title}</h4>
                    
                    <div className="flex items-center justify-between mt-4 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-300 text-[18px]">drag_indicator</span>
                      </div>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {assignedUsers.map(user => (
                           <div key={user.id} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-headline font-bold text-xs text-slate-600 overflow-hidden shadow-sm border-2 border-white relative z-10" title={user.name}>
                             {user.avatar ? <img src={user.avatar} className="object-cover w-full h-full" /> : user.name[0]}
                           </div>
                        ))}
                        {assignedUsers.length === 0 && (
                           <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 relative z-10" title="Unassigned">
                             <span className="material-symbols-outlined text-[14px]">person</span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {displayTasks.filter(t => t.status === col.id).length === 0 && (
                <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium mt-2">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Slack Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeTaskModal}></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col z-10 mx-4 overflow-hidden relative border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <h3 className="text-2xl font-headline font-bold text-slate-900 dark:text-slate-100">{selectedTask.title}</h3>
                <div className="flex items-center gap-3 mt-2 font-label text-xs">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">assignment_ind</span>
                    {selectedTask.assignees?.length > 0 
                      ? selectedTask.assignees.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ')
                      : (selectedTask.assignee ? users.find(u => u.id === selectedTask.assignee)?.name || 'Unassigned' : 'Unassigned')}
                  </span>
                  {selectedTask.reference_link && (
                    <a href={selectedTask.reference_link} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 hover:underline ml-2">
                       <span className="material-symbols-outlined text-[14px]">link</span>
                       Brief Link
                    </a>
                  )}
                </div>
              </div>
              <button onClick={closeTaskModal} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-900/60 overflow-y-auto flex flex-col gap-6 style-scroll">
               {/* Comments List */}
               {comments.filter(c => c.task_id === selectedTask.id).map(comment => {
                  const author = comment.users || users.find(u => u.id === comment.user_id);
                  const isMe = author?.id === currentUser?.id;
                    
                  return (
                    <div key={comment.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'} group hover:opacity-100`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="font-label font-bold text-xs text-slate-500 dark:text-slate-400">{author?.name || 'Unknown'}</span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl w-full shadow-sm mt-1">
                          <textarea
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            rows="2"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingCommentId(null)} className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1">Cancel</button>
                            <button onClick={() => {
                              if (editContent.trim()) {
                                editComment(comment.id, editContent);
                                setEditingCommentId(null);
                              }
                            }} className="text-xs font-semibold text-white bg-primary hover:bg-green-700 px-3 py-1 rounded-md">Save</button>
                          </div>
                        </div>
                      ) : deletingCommentId === comment.id ? (
                        <div className="flex flex-col gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 rounded-2xl w-full max-w-sm shadow-sm mt-1">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-300">Are you sure you want to delete this message?</p>
                          <div className="flex justify-end gap-2 mt-1">
                            <button onClick={() => setDeletingCommentId(null)} className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1">Cancel</button>
                            <button onClick={() => {
                              deleteComment(comment.id);
                              setDeletingCommentId(null);
                            }} className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md">Delete</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`px-4 py-3 rounded-2xl font-body text-sm shadow-sm relative group-hover:shadow-md transition-shadow ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                          {comment.content.includes('\n(edited)') ? (
                            <>
                              {comment.content.replace('\n(edited)', '')}
                              <span className="text-[10px] opacity-60 italic ml-2">(edited)</span>
                            </>
                          ) : comment.content.includes('Uploaded a file:') ? (
                             <div className="flex flex-col gap-1">
                               <span className="font-bold">Attached a file:</span>
                               <a href={comment.content.split('\n')[1]} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors w-fit border ${isMe ? 'bg-white/20 hover:bg-white/30 border-white/20' : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}>
                                 <span className="material-symbols-outlined text-[16px]">insert_drive_file</span>
                                 {comment.content.split('\n')[0].replace('Uploaded a file: ', '').replace('(edited)', '')}
                                </a>
                             </div>
                          ) : (
                            comment.content
                          )}
                          
                          {/* Three Dots Menu */}
                          {isMe && (
                            <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="relative">
                                <button 
                                  onClick={() => setActiveDropdownId(activeDropdownId === comment.id ? null : comment.id)} 
                                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                </button>
                                
                                {activeDropdownId === comment.id && (
                                  <div className="absolute right-full top-0 mr-2 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 flex flex-col">
                                    <button 
                                      onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); setActiveDropdownId(null); }} 
                                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                                    </button>
                                    <button 
                                      onClick={() => { setDeletingCommentId(comment.id); setActiveDropdownId(null); }} 
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
               })}
               {comments.filter(c => c.task_id === selectedTask.id).length === 0 && (
                 <div className="text-center flex flex-col items-center justify-center py-10 opacity-60">
                   <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">forum</span>
                   <p className="text-slate-500 font-medium">No activity yet. Start the conversation!</p>
                 </div>
               )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-20">
               {/* Live Typing Indicator */}
               {(() => {
                 const typers = Object.values(presenceState || {})
                   .map(p => p[0])
                   .filter(p => p && p.user_id !== currentUser?.id && p.typing && p.typing_task === selectedTask?.id)
                   .map(p => users.find(u => u.id === p.user_id)?.name)
                   .filter(Boolean);
                   
                 if (typers.length === 0) return null;
                 
                 return (
                   <div className="absolute -top-8 left-6 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-wide bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1 rounded-t-lg border border-b-0 border-slate-200 dark:border-slate-700 shadow-sm z-20">
                     <div className="flex gap-1 mr-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                     {typers.join(', ')} {typers.length > 1 ? 'are' : 'is'} typing...
                   </div>
                 );
               })()}

               <div className="flex items-end gap-3 w-full relative z-30">
                 <button 
                   onClick={handleFileUploadClick}
                   disabled={isUploading}
                   className="w-12 h-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all disabled:opacity-50"
                   title="Upload File"
                 >
                   {isUploading ? (
                     <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                   ) : (
                     <span className="material-symbols-outlined text-[20px]">attach_file</span>
                   )}
                 </button>
                 <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                 <textarea 
                   rows="1"
                   placeholder="Reply to task..." 
                   className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-inner"
                   value={newComment}
                   onChange={handleInputChange}
                   onKeyDown={e => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleAddComment();
                     }
                   }}
                 />
                 <button onClick={handleAddComment} disabled={!newComment.trim()} className="w-12 h-12 flex-shrink-0 bg-primary text-white rounded-xl hover:opacity-90 flex items-center justify-center shadow-md shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed">
                   <span className="material-symbols-outlined text-[20px] ml-1">send</span>
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
