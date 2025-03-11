import React from 'react';
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

// Components
import Header from './components/Header.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';

// Context
import { AuthProvider } from './context/AuthContext.tsx';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
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
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 