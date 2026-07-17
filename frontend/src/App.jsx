import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'FacilityAdmin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageWrapper><Analytics /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function Navigation({ isDark, setIsDark }) {
  const { user, logout } = useAuth();
  
  return (
    <nav className="border-b border-border p-4 glass sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SpaceIQ
        </div>
        <div className="flex items-center gap-6">
          {user && (
            <div className="flex gap-4 items-center">
              <Link to="/dashboard" className="hover:text-primary transition-colors text-sm font-medium">Dashboard</Link>
              <Link to="/analytics" className="hover:text-primary transition-colors text-sm font-medium">Analytics</Link>
              {user.role === 'FacilityAdmin' && (
                <Link to="/admin" className="hover:text-primary transition-colors text-sm font-medium">Admin System</Link>
              )}
              <div className="h-4 w-px bg-border mx-2"></div>
              <span className="text-sm text-muted-foreground mr-2">Hi, {user.name}</span>
              <button onClick={logout} className="text-sm text-destructive hover:opacity-80 transition-opacity font-medium">Logout</button>
            </div>
          )}
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
          <Navigation isDark={isDark} setIsDark={setIsDark} />
          <main className="flex-1 p-6 relative">
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
