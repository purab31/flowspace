import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function SettingsModal({ isOpen, onClose }) {
  const { currentUser, updateProfile, isDarkMode, toggleTheme } = useAppStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (updateProfile) {
      updateProfile({ name: name.trim(), avatar: avatar.trim() });
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-headline font-bold text-slate-900 dark:text-slate-100">Account Settings</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <form id="settings-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-2xl shadow-sm border-2 border-slate-200 dark:border-slate-700">
                      {name ? name.charAt(0) : '?'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Avatar URL</label>
                <input 
                  type="text" 
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Interface Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { if (isDarkMode) toggleTheme(); }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      !isDarkMode
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">light_mode</span>
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (!isDarkMode) toggleTheme(); }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      isDarkMode
                        ? 'border-primary bg-primary/20 text-primary font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                    Dark
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={`${currentUser?.id || 'guest'}@flowspace.com`}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-body text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">Email cannot be changed.</p>
              </div>
            </form>
          </div>
          
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
            <button 
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-sm font-label font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="settings-form"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-green-600 text-white text-sm font-label font-semibold shadow-md shadow-primary/20 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
