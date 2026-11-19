import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function FilesPage() {
  const { tasks, files, users, uploadFile, deleteFile, currentUser } = useAppStore();
  const [activeFolderId, setActiveFolderId] = useState(null); // null = root
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const fileInputRef = useRef(null);

  // Grouping
  const rootFiles = files.filter(f => !f.task_id);
  const activeFolderFiles = activeFolderId ? files.filter(f => f.task_id === activeFolderId) : [];
  const currentFiles = activeFolderId ? activeFolderFiles : rootFiles;
  
  const activeTask = activeFolderId ? tasks.find(t => t.id === activeFolderId) : null;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    await uploadFile(selectedFile, activeFolderId);
    setIsUploading(false);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="h-20 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">folder</span>
          </div>
          <div>
            <h3 className="text-xl font-headline font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {activeFolderId ? activeTask?.title || 'Task Folder' : 'File Repository'}
            </h3>
            <p className="font-label text-[12px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 mt-0.5">
              {activeFolderId ? 'Task Attachments' : 'Workspace Files & Task Folders'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {activeFolderId && (
            <button 
              onClick={() => setActiveFolderId(null)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-label font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Root
            </button>
          )}
          
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md shadow-primary/20 hover:bg-green-600 transition-all text-sm font-label font-bold disabled:opacity-50"
          >
            {isUploading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">upload</span>
            )}
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 style-scroll">
        
        {/* Folders Section (Only in Root) */}
        {!activeFolderId && (
          <div className="mb-8">
            <h4 className="text-sm font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Task Folders</h4>
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 font-body italic">No tasks created yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tasks.map(task => {
                  const taskFileCount = files.filter(f => f.task_id === task.id).length;
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setActiveFolderId(task.id)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-primary/50 group flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
                        <span className="material-symbols-outlined">folder</span>
                      </div>
                      <div className="overflow-hidden flex-1">
                        <h5 className="font-headline font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{task.title}</h5>
                        <p className="font-body text-xs text-slate-500 dark:text-slate-400 mt-0.5">{taskFileCount} file{taskFileCount !== 1 && 's'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Files Section */}
        <div>
          <h4 className="text-sm font-label font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            {activeFolderId ? 'Files in Folder' : 'Root Files'}
          </h4>
          
          {currentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/40">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">description</span>
              <p className="text-slate-500 dark:text-slate-400 font-body text-sm">No files uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentFiles.map(file => {
                const uploader = users.find(u => u.id === file.uploaded_by);
                const isOwner = file.uploaded_by === currentUser?.id || currentUser?.role === 'Admin';
                
                return (
                  <div key={file.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm group relative flex flex-col hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">insert_drive_file</span>
                        </div>
                        <div className="overflow-hidden flex-1">
                          <h5 className="font-headline font-bold text-slate-800 dark:text-slate-100 text-sm truncate" title={file.name}>{file.name}</h5>
                          <p className="font-body text-xs text-slate-400 dark:text-slate-500 mt-0.5 uppercase">{formatSize(file.size)} • {file.type.split('/')[1] || 'FILE'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-1.5">
                        {uploader?.avatar ? (
                          <img src={uploader.avatar} alt="uploader" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">
                            {uploader?.name ? uploader.name[0] : '?'}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate max-w-[80px]">
                          {uploader?.name || 'Unknown'}
                        </span>
                      </div>
                      
                      {deletingFileId === file.id ? (
                        <div className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl p-4 text-center">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-3">Delete this file?</p>
                          <div className="flex gap-2">
                            <button onClick={() => setDeletingFileId(null)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                            <button onClick={() => { deleteFile(file.id); setDeletingFileId(null); }} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">Delete</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Download / View"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                          </a>
                          {isOwner && (
                            <button 
                              onClick={() => setDeletingFileId(file.id)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                              title="Delete File"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
