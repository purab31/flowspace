import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { useAppStore } from './store/useAppStore';

const AdminPage = lazy(() => import('./pages/Admin'));
const TasksPage = lazy(() => import('./pages/Tasks'));
const ProjectsPage = lazy(() => import('./pages/Projects'));
const ChatPage = lazy(() => import('./pages/Chat'));
const LoginPage = lazy(() => import('./pages/Login'));
const TodosPage = lazy(() => import('./pages/Todos'));
const FilesPage = lazy(() => import('./pages/Files'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-full w-full py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Placeholder Pages
const Placeholder = ({ title }) => (
  <div className="p-12 flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-3xl font-bold font-headline text-slate-800">{title}</h2>
      <p className="mt-4 text-slate-500 font-body">This module is under construction.</p>
    </div>
  </div>
);

function App() {
  const { fetchAll, setupRealtime, isLoading, currentUser, isDarkMode } = useAppStore();

  useEffect(() => {
    fetchAll();
    setupRealtime();
  }, [fetchAll, setupRealtime]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen w-screen bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notes" element={<TodosPage />} />
            <Route path="/email" element={<Placeholder title="Email Inbox" />} />
            <Route path="/files" element={<FilesPage />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App;
