import React from "react";
import { useAppStore } from "../store/useAppStore";
import Logo from "../components/Logo";

export default function AdminPage() {
  const { users } = useAppStore();

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <div className="mb-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-slate-100 tracking-tight">Administration</h2>
        <p className="text-slate-500 dark:text-slate-400 font-body mt-2 text-base max-w-2xl">
          Manage team access, configure global workspace settings, and oversee integrated services.
        </p>
      </div>

      {/* Architectural Layout Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Column: User Management */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {/* Team Members Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-slate-100">Team Members</h3>
                <p className="text-sm font-label text-slate-500 dark:text-slate-400 mt-1">{users.length} Active members across workspace</p>
              </div>
              <button className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors px-4 py-2 rounded-xl font-label text-sm font-semibold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <span className="material-symbols-outlined text-sm">person_add</span>
                Invite
              </button>
            </div>

            {/* Table Area */}
            <div className="w-full">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-700">
                <div className="col-span-5">Member</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="flex flex-col gap-1.5">
                {users.map(user => (
                  <div key={user.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-slate-50/80 dark:bg-slate-700/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors group border border-slate-100/60 dark:border-slate-700/50">
                    <div className="col-span-5 flex items-center gap-3">
                      {user.avatar ? (
                        <img alt="Profile" className="w-9 h-9 rounded-full object-cover shadow-sm" src={user.avatar} />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-headline font-bold text-sm text-slate-600 dark:text-slate-300">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}
                        </div>
                      )}
                      <div className="flex flex-col truncate">
                        <span className="font-headline font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{user.name}</span>
                        <span className="font-label text-slate-400 dark:text-slate-500 text-xs truncate">{user.id}@workspace.inc</span>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-dim font-label text-xs font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${user.avatar ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                      <span className="font-label text-xs font-semibold text-slate-700 dark:text-slate-300">{user.avatar ? 'Active' : 'Offline'}</span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-sm">block</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Column: Workspace Settings */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-slate-100 mb-6">Workspace Identity</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Workspace Name</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner" 
                  type="text" 
                  defaultValue="flowspace" 
                />
              </div>
              <div>
                <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Brand Logo</label>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 relative overflow-hidden group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-headline font-bold text-xl shrink-0 shadow-md shadow-primary/20">
                    <Logo className="scale-75" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-headline font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">Upload new logo</span>
                    <span className="text-xs font-label text-slate-400 dark:text-slate-500 mt-0.5">PNG, JPG up to 2MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
