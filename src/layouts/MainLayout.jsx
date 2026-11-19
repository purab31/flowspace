import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import NewEntrySlideOver from "../components/NewEntrySlideOver";
import OnboardingModal from "../components/OnboardingModal";
import SettingsModal from "../components/SettingsModal";
import Logo from "../components/Logo";

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { openOnboarding, tasks, currentUser, logout, comments, readReceipts, toggleTheme, isDarkMode } = useAppStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const unreadTasks = tasks.filter(t => t.status === 'todo' && (t.assignees?.includes(currentUser?.id) || t.assignee === currentUser?.id) && !readReceipts[t.id]);
  const unreadTaskCount = unreadTasks.length;

  const lastComment = comments[comments.length - 1];
  const unreadChatsCount = (lastComment && lastComment.user_id !== currentUser?.id && readReceipts['global'] !== lastComment.id) ? 1 : 0;

  const navItems = [
    { name: "Projects", path: "/projects", icon: "grid_view" },
    { name: "Tasks", path: "/tasks", icon: "check_circle" },
    { name: "Chat", path: "/chat", icon: "chat_bubble", badge: unreadChatsCount },
    { name: "Notes", path: "/notes", icon: "edit_note" },
    { name: "Email", path: "/email", icon: "mail" },
    { name: "Files", path: "/files", icon: "folder" },
    { name: "Admin", path: "/admin", icon: "settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-body overflow-hidden">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 w-64 bg-white dark:bg-slate-900 z-20 md:flex hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-headline tracking-tight lowercase leading-none">
                flowspace
              </h1>
            </div>
          </div>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all scale-98 transition-transform duration-200 font-manrope text-sm font-medium ${isActive
                    ? "text-primary bg-primary/10 dark:bg-primary/20 dark:text-primary font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/80"
                  }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* CTA */}
        <button
          onClick={useAppStore.getState().openNewEntry}
          className="mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-green-600 text-white rounded-xl px-4 py-3.5 font-semibold font-label text-sm transition-all shadow-md shadow-primary/25 active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Entry
        </button>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col md:ml-64 relative z-10 overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-8 h-18 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-manrope text-sm font-medium sticky top-0 shrink-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          {/* Left: Search */}
          <div className="flex-1 flex items-center max-w-md">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl w-full max-w-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-lg mr-2">
                search
              </span>
              <input
                className="bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 w-full text-sm font-body placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 p-0"
                placeholder="Search workspace..."
                type="text"
              />
            </div>
          </div>
          {/* Right: Trailing Icon Actions */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors pointer flex items-center justify-center cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle light or dark theme"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>

            <button
              onClick={openOnboarding}
              className="p-2.5 rounded-full text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors pointer flex items-center justify-center group"
              title="Help & Tutorial"
            >
              <span className="material-symbols-outlined group-hover:hidden">help</span>
              <span className="material-symbols-outlined hidden group-hover:block" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2.5 rounded-full transition-colors pointer flex items-center justify-center ${isNotificationsOpen ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <span className="material-symbols-outlined">notifications</span>
                {(unreadTaskCount > 0 || unreadChatsCount > 0) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse shadow-sm"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-[340px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
                      <h4 className="font-headline font-bold text-slate-800 dark:text-slate-100">Notifications</h4>
                      <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {unreadTaskCount + unreadChatsCount} New
                      </span>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto style-scroll">
                      {unreadChatsCount > 0 && (
                        <div
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            useAppStore.getState().markThreadRead('global', lastComment?.id);
                            navigate('/chat');
                          }}
                          className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex gap-3.5 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                          </div>
                          <div>
                            <p className="text-sm font-headline font-semibold text-slate-800 dark:text-slate-100 leading-tight mb-1">New activity in Team Sync</p>
                            <p className="text-[13px] font-body text-slate-500 dark:text-slate-400">You have unread team messages waiting for you in the general chat channel.</p>
                          </div>
                        </div>
                      )}

                      {unreadTasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => {
                            useAppStore.getState().markThreadRead(task.id, 'acknowledged');
                            setIsNotificationsOpen(false);
                            navigate('/tasks');
                          }}
                          className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex gap-3.5 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">assignment</span>
                          </div>
                          <div>
                            <p className="text-sm font-headline font-semibold text-slate-800 dark:text-slate-100 leading-tight mb-1">Task Assignment</p>
                            <p className="text-[13px] font-body text-slate-500 dark:text-slate-400 line-clamp-2">You were assigned to: <span className="font-semibold text-slate-700 dark:text-slate-200">{task.title}</span></p>
                          </div>
                        </div>
                      ))}

                      {unreadTaskCount === 0 && unreadChatsCount === 0 && (
                        <div className="px-6 py-8 text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-500">notifications_paused</span>
                          </div>
                          <p className="text-sm font-headline font-semibold text-slate-800 dark:text-slate-100 mb-1">You're all caught up!</p>
                          <p className="text-[13px] font-body text-slate-400 dark:text-slate-500">No new tasks or messages to review.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="ml-3 pl-4 border-l border-slate-200 dark:border-slate-700 relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {currentUser?.avatar ? (
                  <img
                    alt="User Avatar"
                    className="w-9 h-9 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800 ring-2 ring-transparent hover:ring-primary/30 transition-all cursor-pointer"
                    src={currentUser.avatar}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shadow-sm ring-2 ring-transparent hover:ring-primary/30 transition-all cursor-pointer">
                    {currentUser?.name ? currentUser.name.charAt(0) : '?'}
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <p className="text-sm font-headline font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser?.name}</p>
                      <p className="text-xs font-body text-slate-500 dark:text-slate-400 truncate">{currentUser?.id}@flowspace.com</p>
                      <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-md">
                        {currentUser?.role || 'Guest'}
                      </span>
                    </div>

                    <button
                      onClick={() => { setIsProfileOpen(false); setIsSettingsOpen(true); }}
                      className="w-full text-left px-5 py-2.5 text-sm font-label font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Account Settings
                    </button>
                    <button
                      onClick={() => { setIsProfileOpen(false); toggleTheme(); }}
                      className="w-full text-left px-5 py-2.5 text-sm font-label font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                      {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-5 py-2.5 text-sm font-label font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto w-full">
          {children}
        </div>
      </main>

      {/* Global Modals/SlideOvers */}
      <NewEntrySlideOver />
      <OnboardingModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
