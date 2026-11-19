import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login, isDarkMode, toggleTheme } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Invalid credentials. Please use complete dummy emails (e.g., sarah@flowspace.com)');
    }
  };

  const fillDemo = (userEmail) => {
    setEmail(userEmail);
    setPassword('password123');
    setError('');
    const success = login(userEmail, 'password123');
    if (!success) {
      setError('Invalid credentials. Please use complete dummy emails (e.g., sarah@flowspace.com)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button */}
      <div className="fixed top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDarkMode ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
            <Logo className="scale-100" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 font-body mt-2">Enter your flowspace credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-label font-semibold text-center border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
              placeholder="name@flowspace.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-green-600 text-white rounded-xl py-3.5 font-headline font-semibold text-base shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-xs font-label text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider font-bold">Fast-Fill Demo Accounts</p>
          <div className="flex justify-center gap-2.5">
            <button onClick={() => fillDemo('sarah@flowspace.com')} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-semibold rounded-lg transition-colors">Sarah (Admin)</button>
            <button onClick={() => fillDemo('marcus@flowspace.com')} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-semibold rounded-lg transition-colors">Marcus</button>
            <button onClick={() => fillDemo('elena@flowspace.com')} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-semibold rounded-lg transition-colors">Elena</button>
          </div>
        </div>
      </div>
    </div>
  );
}
