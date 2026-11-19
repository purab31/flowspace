import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export default function ChatPage() {
  const { tasks, users, comments, addComment, currentUser, uploadFile, editComment, deleteComment, presenceState, setTyping, updateReadReceipt } = useAppStore();
  const [newComment, setNewComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const fileInputRef = useRef(null);
  const feedEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of feed on new comments
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark global chat as read
    const latest = comments[comments.length - 1];
    if (latest && currentUser) {
      updateReadReceipt('global', latest.id);
      useAppStore.getState().markThreadRead('global', latest.id);
    }
  }, [comments, currentUser, updateReadReceipt]);

  const handleInputChange = (e) => {
    setNewComment(e.target.value);
    
    // Typing indicator logic
    setTyping('global', true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping('global', false);
    }, 2000);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(null, newComment);
    setNewComment("");
    setTyping('global', false);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    const result = await uploadFile(selectedFile, null);
    setIsUploading(false);
    
    if (result?.data) {
      addComment(null, `Uploaded a file: ${result.data.name}\n${result.data.url}`);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 w-full overflow-hidden relative">
      {/* General Chat Header */}
      <div className="h-20 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl">forum</span>
          </div>
          <div>
            <h3 className="text-xl font-headline font-bold text-slate-900 dark:text-slate-100 leading-tight">Team Sync</h3>
            <p className="font-label text-[12px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 mt-0.5">
              General Discussion & Task References
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 style-scroll">
         {comments.length === 0 && (
           <div className="m-auto text-center flex flex-col items-center justify-center opacity-70">
             <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">group</span>
             </div>
             <h3 className="text-lg font-headline font-bold text-slate-700 dark:text-slate-300 mb-1">Welcome to Team Sync</h3>
             <p className="text-slate-500 dark:text-slate-400 font-body max-w-sm text-sm">
               This is your central hub. Discuss assignments and make plans!
             </p>
           </div>
         )}

         {comments.map(comment => {
            const author = comment.users || users.find(u => u.id === comment.user_id);
            const isMe = author?.id === currentUser?.id;
            const refTask = comment.task_id ? tasks.find(t => t.id === comment.task_id) : null;
            
            return (
              <div key={comment.id} className={`flex flex-col max-w-[80%] md:max-w-[60%] ${isMe ? 'self-end items-end' : 'self-start items-start'} group hover:opacity-100`}>
                <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="font-label font-bold text-xs text-slate-400 dark:text-slate-500">{author?.name || 'Unknown User'}</span>
                </div>
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Visual Reference Block for explicitly associated Tasks */}
                  {refTask && (
                    <div className={`relative px-4 py-2 mb-1 text-xs font-semibold rounded-lg shadow-sm border ${isMe ? 'bg-primary/20 border-primary/30 text-primary-dim text-right' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-left'}`}>
                      <span className="opacity-70 text-[10px] uppercase tracking-wider block mb-0.5">Task Reference:</span>
                      {refTask.title}
                    </div>
                  )}
                  
                  {/* Message Bubble */}
                  {editingCommentId === comment.id ? (
                    <div className="flex flex-col gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl w-full max-w-sm shadow-sm mt-1">
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
                    <div className={`px-5 py-3.5 rounded-2xl font-body text-[15px] shadow-sm relative group-hover:shadow-md transition-shadow ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                      {comment.content.includes('\n(edited)') ? (
                        <>
                          {comment.content.replace('\n(edited)', '')}
                          <span className="text-[10px] opacity-60 italic ml-2">(edited)</span>
                        </>
                      ) : comment.content.includes('Uploaded a file:') ? (
                         <div className="flex flex-col gap-1.5">
                           <span className="font-bold text-xs uppercase tracking-wider opacity-80">Shared File:</span>
                           <a href={comment.content.split('\n')[1]} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors w-fit border ${isMe ? 'bg-white/20 hover:bg-white/30 border-white/20 text-white' : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200'}`}>
                             <span className="material-symbols-outlined text-[18px]">insert_drive_file</span>
                             {comment.content.split('\n')[0].replace('Uploaded a file: ', '').replace('(edited)', '')}
                           </a>
                         </div>
                      ) : (
                        comment.content
                      )}
                      
                      {/* Three Dots Menu for Author */}
                      {isMe && (
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative">
                            <button 
                              onClick={() => setActiveDropdownId(activeDropdownId === comment.id ? null : comment.id)} 
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                            
                            {activeDropdownId === comment.id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setActiveDropdownId(null)}></div>
                                <div className="absolute left-0 mt-1 w-28 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-40 animate-in fade-in zoom-in-95 duration-150">
                                  <button 
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditContent(comment.content.replace('\n(edited)', ''));
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setDeletingCommentId(comment.id);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-label mt-1 px-1">
                    {comment.created_at ? new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
         })}
         <div ref={feedEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative">
         {/* Live typing indicator pill */}
         {(() => {
           const typers = Object.values(presenceState || {})
             .map(p => p[0])
             .filter(p => p && p.user_id !== currentUser?.id && p.typing && p.typing_task === 'global')
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
             className="w-14 h-14 flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all disabled:opacity-50"
             title="Upload File to Root"
           >
             {isUploading ? (
               <span className="material-symbols-outlined text-[24px] animate-spin">refresh</span>
             ) : (
               <span className="material-symbols-outlined text-[24px]">attach_file</span>
             )}
           </button>
           <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
           <textarea 
             rows="1"
             placeholder="Message the entire team..."
             className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 text-[15px] font-body text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all shadow-inner"
             value={newComment}
             onChange={handleInputChange}
             onKeyDown={e => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleAddComment();
               }
             }}
           />
           <button 
             onClick={handleAddComment} 
             disabled={!newComment.trim()} 
             className="w-14 h-14 flex-shrink-0 bg-primary text-white rounded-xl hover:bg-green-600 flex items-center justify-center shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
           >
             <span className="material-symbols-outlined text-2xl ml-1">send</span>
           </button>
         </div>
      </div>
    </div>
  );
}
