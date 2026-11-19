import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function ProjectsPage() {
  const { projects, tasks, users } = useAppStore();
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="p-8 lg:p-12 h-screen flex flex-col relative w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="mb-8 flex justify-between items-center w-full">
        <div>
          <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-slate-100 tracking-tight">Active Projects</h2>
          <p className="text-slate-500 dark:text-slate-400 font-body mt-2 text-base">
            Overview of all ongoing company projects and their associated tasks.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined text-6xl mb-4 text-slate-300 dark:text-slate-600">folder_open</span>
          <p className="text-lg font-headline font-medium text-slate-700 dark:text-slate-300">No projects found</p>
          <p className="text-sm">Create a new Project using the New Entry button in the sidebar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20 style-scroll">
          {projects.map((project) => {
            const projectTasks = tasks.filter(t => t.project_id === project.id);
            const doneTasks = projectTasks.filter(t => t.status === 'done').length;
            const progress = projectTasks.length === 0 ? 0 : Math.round((doneTasks / projectTasks.length) * 100);

            return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {project.status || 'Active'}
                  </span>
                </div>
                
                <h3 className="text-xl font-headline font-bold text-slate-900 dark:text-slate-100 mb-2">{project.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-body mb-6 line-clamp-3 flex-1">
                  {project.description || "No specific brief or description provided for this project."}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                    <span className="text-sm font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-label text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">checklist</span>
                      {doneTasks}/{projectTasks.length} check-ins
                    </div>
                    {/* Display avatars of involved members */}
                    <div className="flex -space-x-2">
                       {Array.from(new Set(projectTasks.flatMap(t => t.assignees || []).filter(id => id))).slice(0, 3).map((assigneeId) => {
                         const u = users.find(user => user.id === assigneeId);
                         if (!u) return null;
                         return (
                           <div key={u.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden" title={u.name}>
                             {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt={u.name} /> : <div className="flex items-center justify-center h-full w-full text-xs font-bold text-slate-600 dark:text-slate-300">{u.name[0]}</div>}
                           </div>
                         );
                       })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Extended Output Project Modal */}
      {selectedProject && (() => {
        const projectTasks = tasks.filter(t => t.project_id === selectedProject.id);
        const todoTasks = projectTasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
        const doneTasks = projectTasks.filter(t => t.status === 'done').length;
        const progress = projectTasks.length === 0 ? 0 : Math.round((doneTasks / projectTasks.length) * 100);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProject(null)}></div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col z-10 mx-4 overflow-hidden relative border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
              
              {/* Header */}
              <div className="flex items-start justify-between p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl">grid_view</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-headline font-bold text-slate-900 dark:text-slate-100 leading-tight">{selectedProject.title}</h3>
                    <div className="flex items-center gap-3 mt-3 font-label text-xs">
                      <span className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wide ${selectedProject.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {selectedProject.status || 'Active'}
                      </span>
                      {selectedProject.reference_link && (
                        <a href={selectedProject.reference_link} target="_blank" rel="noreferrer" className="text-primary flex items-center gap-1 hover:underline ml-2">
                           <span className="material-symbols-outlined text-[14px]">link</span>
                           External Brief
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedProject(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900/60 overflow-y-auto flex flex-col gap-8 style-scroll">
                {/* Description */}
                {selectedProject.description && (
                  <div>
                    <h4 className="font-headline font-semibold text-slate-800 dark:text-slate-200 mb-2">Project Description</h4>
                    <p className="text-slate-600 dark:text-slate-400 font-body text-sm leading-relaxed max-w-2xl">{selectedProject.description}</p>
                  </div>
                )}
                
                {/* Progress Overview */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                    <span className="font-headline font-bold text-slate-900 dark:text-slate-100">Overall Progress</span>
                    <span className="text-xl font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-6 overflow-hidden">
                    <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="flex flex-col gap-1 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                       <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Do</span>
                       <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{todoTasks}</span>
                     </div>
                     <div className="flex flex-col gap-1 p-4 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20">
                       <span className="text-xs font-bold text-primary dark:text-primary-dim uppercase tracking-wider">In Progress</span>
                       <span className="text-2xl font-black text-primary dark:text-primary-dim">{inProgressTasks}</span>
                     </div>
                     <div className="flex flex-col gap-1 p-4 bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-200/60 dark:border-green-800/40">
                       <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Completed</span>
                       <span className="text-2xl font-black text-green-700 dark:text-green-300">{doneTasks}</span>
                     </div>
                  </div>
                </div>

                {/* Task List */}
                <div>
                   <h4 className="font-headline font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[20px] text-primary">checklist</span>
                     Associated Tasks
                   </h4>
                   {projectTasks.length === 0 ? (
                      <div className="text-center p-8 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                         <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">task</span>
                         <p className="text-slate-500 dark:text-slate-400 font-body text-sm">No tasks assigned to this project yet.</p>
                      </div>
                   ) : (
                      <div className="flex flex-col gap-3">
                         {projectTasks.map(t => {
                            const taskAssignees = users.filter(u => t.assignees?.includes(u.id));
                            return (
                              <div key={t.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between hover:border-primary dark:hover:border-primary transition-colors hover:shadow-sm">
                                 <div>
                                    <h5 className="font-headline font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1.5">{t.title}</h5>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                          t.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' :
                                          t.status === 'in_progress' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-dim' :
                                          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                          {t.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                 </div>
                                 <div className="flex -space-x-1.5">
                                    {taskAssignees.map(u => (
                                       <div key={u.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-sm relative z-10" title={u.name}>
                                         {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt={u.name} /> : <div className="flex items-center justify-center h-full w-full text-xs font-bold text-slate-600 dark:text-slate-300">{u.name[0]}</div>}
                                       </div>
                                    ))}
                                    {taskAssignees.length === 0 && (
                                       <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 relative z-10" title="Unassigned">
                                         <span className="material-symbols-outlined text-[14px]">person</span>
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
          </div>
        );
      })()}
    </div>
  );
}
