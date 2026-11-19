import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function NewEntrySlideOver() {
  const { isNewEntryOpen, closeNewEntry, addTask, addProject, users, projects } = useAppStore();
  const [entryType, setEntryType] = useState('task');
  const [title, setTitle] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [referenceLink, setReferenceLink] = useState('');

  if (!isNewEntryOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return alert('Title is required');
    const newEntry = {
      title: title.trim(),
      assignees: selectedAssignees,
      status: 'todo',
      reference_link: referenceLink.trim() || null
    };
    if (entryType === 'task') {
      newEntry.project_id = selectedProject || null;
      addTask(newEntry);
    } else {
      addProject(newEntry);
    }
    closeNewEntry();
    setTitle('');
    setReferenceLink('');
    setSelectedProject('');
    setSelectedAssignees([]);
  };

  const toggleAssignee = (id) => {
    if (selectedAssignees.includes(id)) {
      setSelectedAssignees(prev => prev.filter(a => a !== id));
    } else {
      setSelectedAssignees(prev => [...prev, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeNewEntry}
      ></div>
      
      {/* Slide-over Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 flex flex-col ml-auto border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-headline font-bold text-slate-900 dark:text-slate-100">Create New Entry</h2>
          <button 
            onClick={closeNewEntry} 
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 style-scroll">
          
          {/* Type Selection */}
          <div>
            <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Entry Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEntryType('project')}
                className={`p-3 text-center rounded-xl border text-sm font-headline font-semibold transition-all ${
                  entryType === 'project'
                    ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary dark:text-primary shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Project
              </button>
              <button
                type="button"
                onClick={() => setEntryType('task')}
                className={`p-3 text-center rounded-xl border text-sm font-headline font-semibold transition-all ${
                  entryType === 'task'
                    ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary dark:text-primary shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Task
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Title
            </label>
            <input 
              type="text" 
              placeholder="E.g., Website Redesign Q3" 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Assignees
            </label>
            <div className="flex flex-wrap gap-2">
              {users.map(u => {
                const isSelected = selectedAssignees.includes(u.id);
                return (
                  <button 
                    key={u.id}
                    type="button"
                    onClick={() => toggleAssignee(u.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full cursor-pointer border text-xs font-label font-semibold transition-all select-none ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {u.avatar ? (
                      <img src={u.avatar} className="w-5 h-5 rounded-full shadow-sm object-cover" alt={u.name} />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-200">
                        {u.name[0]}
                      </div>
                    )}
                    <span>{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Dropdown for Tasks */}
          {entryType === 'task' && (
            <div>
              <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Project
              </label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-body text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer shadow-inner pr-10"
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                >
                  <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Independent Task</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {p.title}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          )}

          {/* Attachments & Link */}
          <div>
            <label className="block text-xs font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Attachments & Briefs
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary dark:hover:border-primary bg-slate-50/50 dark:bg-slate-800/40 transition-colors cursor-pointer group mb-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-300 group-hover:text-primary">upload_file</span>
              </div>
              <p className="text-sm font-headline font-semibold text-slate-800 dark:text-slate-200 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs font-label text-slate-400 dark:text-slate-500">SVG, PNG, JPG or PDF (max. 10MB)</p>
            </div>
            
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-slate-400">link</span>
              <input 
                type="url" 
                placeholder="Or paste a link to brief (Figma, Notion...)" 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                value={referenceLink}
                onChange={e => setReferenceLink(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button 
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-green-600 text-white rounded-xl px-4 py-3.5 font-semibold font-label text-sm transition-all shadow-lg shadow-primary/25 active:scale-[0.99]"
          >
            Create Entry
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
