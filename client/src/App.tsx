import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import TaskCalendar from './pages/TaskCalendar.tsx';
import TaskForm from './pages/TaskForm.tsx';
import NotFound from './pages/NotFound.tsx';
import TaskVisualization from './pages/TaskVisualization.tsx';
import KanbanBoard from './pages/KanbanBoard.tsx';

// Components
import Header from './components/Header.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';

// Context
import { AuthProvider } from './context/AuthContext.tsx';

const App: React.FC = () => {
  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <PrivateRoute>
                    <TaskCalendar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/tasks/new" 
                element={
                  <PrivateRoute>
                    <TaskForm />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/tasks/edit/:id" 
                element={
                  <PrivateRoute>
                    <TaskForm />
                  </PrivateRoute>
                } 
              />
              <Route
                path="/tasks/visualization"
                element={
                  <PrivateRoute>
                    <TaskVisualization />
                  </PrivateRoute>
                }
              />
              <Route
                path="/kanban"
                element={
                  <PrivateRoute>
                    <KanbanBoard />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ToastContainer 
            position="bottom-right" 
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 