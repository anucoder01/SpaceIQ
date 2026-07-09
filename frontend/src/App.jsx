import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
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
    <Router>
      <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
        <nav className="border-b border-border p-4 glass sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SpaceIQ
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
              </div>
              <button 
                onClick={() => setIsDark(!isDark)} 
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </nav>
        
        <main className="flex-1 p-6 relative">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
