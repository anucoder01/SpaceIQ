import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function EmployeeSearch({ onSelect }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Failed to search users', err);
      }
    };
    
    const timeoutId = setTimeout(fetchUsers, 300); // debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-64">
      <div className="relative">
        <input
          type="text"
          className="w-full bg-input border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Search employees..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <Search className="absolute left-2.5 top-2.5 text-muted-foreground" size={16} />
      </div>
      
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50 glass"
          >
            {results.map(user => (
              <button
                key={user._id}
                onClick={() => {
                  onSelect(user);
                  setIsOpen(false);
                  setQuery(user.name);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors border-b border-border/50 last:border-b-0"
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
