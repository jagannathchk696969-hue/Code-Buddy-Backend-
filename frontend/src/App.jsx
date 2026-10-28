import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import Workspace from './pages/Workspace.jsx';
import Explainer from './pages/Explainer.jsx';
import Debugger from './pages/Debugger.jsx';
import Practice from './pages/Practice.jsx';
import ChatTutor from './pages/ChatTutor.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-dark-900 text-slate-100 font-sans selection:bg-brand-indigo/30 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/explainer" element={<Explainer />} />
                <Route path="/debugger" element={<Debugger />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/chat" element={<ChatTutor />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

