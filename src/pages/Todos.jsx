import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function TodosPage() {
  const { currentUser } = useAppStore();
  const storageKey = `flowspace_todos_${currentUser?.id || 'guest'}`;
  
  // State initialized from localStorage
  const [todos, setTodos] = useState(() => {
    try {
      const savedTodos = localStorage.getItem(storageKey + '_list');
      return savedTodos ? JSON.parse(savedTodos) : [];
    } catch {
      return [];
    }
  });
  const [inputText, setInputText] = useState('');
  const [notepadText, setNotepadText] = useState(() => {
    try {
      return localStorage.getItem(storageKey + '_pad') || '';
    } catch {
      return '';
    }
  });

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(storageKey + '_list', JSON.stringify(todos));
    localStorage.setItem(storageKey + '_pad', notepadText);
  }, [todos, notepadText, storageKey]);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setTodos([{ id: Date.now().toString(), text: inputText.trim(), completed: false }, ...todos]);
    setInputText('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="p-6 md:p-10 h-screen flex flex-col bg-slate-50 dark:bg-slate-900 w-full overflow-hidden">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">edit_note</span>
            Personal Scratchpad
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-body text-sm mt-1">Private workspace for your notes and rapid to-dos.</p>
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
          Local to device
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Advanced Todo List Panel */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden relative">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center shrink-0">
            <h3 className="font-headline font-bold text-slate-800 dark:text-slate-100">Action Items</h3>
            {completedCount > 0 && (
              <button 
                onClick={clearCompleted}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Clear completed ({completedCount})
              </button>
            )}
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto style-scroll">
            <form onSubmit={handleAddTodo} className="relative mb-6">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 text-[20px]">add_circle</span>
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="What needs to be done?" 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner font-medium"
              />
            </form>

            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center opacity-60 h-32">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">task</span>
                <p className="text-sm font-body font-medium text-slate-500 dark:text-slate-400">No tasks yet. Press enter to add one!</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {todos.map(todo => (
                  <li 
                    key={todo.id} 
                    className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      todo.completed 
                        ? 'bg-slate-50/50 dark:bg-slate-900/40 border-transparent opacity-60' 
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-md'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTodo(todo.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        todo.completed 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </button>
                    
                    <span className={`flex-1 text-sm font-body transition-all ${
                      todo.completed 
                        ? 'line-through text-slate-400 dark:text-slate-500' 
                        : 'text-slate-800 dark:text-slate-200 font-medium'
                    }`}>
                      {todo.text}
                    </span>
                    
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Freestanding Notepad Panel */}
        <div className="flex-1 bg-[#fffdf5] dark:bg-slate-800 rounded-2xl shadow-sm border border-amber-200/60 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-amber-100/60 dark:border-slate-700 flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-amber-500 text-[20px]">sticky_note_2</span>
            <h3 className="font-headline font-bold text-slate-800 dark:text-slate-100">Quick Notes</h3>
          </div>
          
          <div className="flex-1 relative p-6">
            <textarea
              className="w-full h-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-200 font-body text-[15px] leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Jot down meeting notes, ideas, or drafts here..."
              value={notepadText}
              onChange={e => setNotepadText(e.target.value)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
