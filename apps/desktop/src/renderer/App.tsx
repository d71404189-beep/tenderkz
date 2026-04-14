import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import TenderDetail from './pages/TenderDetail';
import Competitors from './pages/Competitors';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Login from './pages/Login';

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handler = () => setIsAuth(!!localStorage.getItem('token'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!isAuth) {
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return (
    <Routes>
      <Route element={<MainLayout onLogout={() => { localStorage.removeItem('token'); setIsAuth(false); }} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/tenders/:id" element={<TenderDetail />} />
        <Route path="/competitors" element={<Competitors />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/calendar" element={<Calendar />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
