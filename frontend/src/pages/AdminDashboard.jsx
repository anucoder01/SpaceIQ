import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Link as LinkIcon, Database, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/audit-logs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        return res.json();
      })
      .then(data => setLogs(data))
      .catch(err => setError(err.message));
  }, [token]);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-primary" size={32} />
        <h1 className="text-3xl font-bold tracking-tight">Admin System</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 shadow-sm border border-border"
      >
        <div className="flex items-center gap-2 mb-6">
          <Database className="text-accent" />
          <h2 className="text-xl font-semibold">Immutable Audit Logs (Blockchain)</h2>
        </div>
        
        {error ? (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
            <AlertCircle />
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No audit logs found.</p>
            ) : (
              logs.map((log, index) => (
                <div key={log._id} className="bg-card border border-border rounded-lg p-4 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover:bg-primary transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-2 pl-3">
                    <div>
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold tracking-wider mb-2">
                        {log.action}
                      </span>
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{log.performedBy?.name || 'Unknown User'}</span> performed action on <span className="font-mono bg-muted px-1 rounded">{log.entityType}</span> {log.entityId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="pl-3 mt-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <LinkIcon size={14} className="text-muted-foreground mt-1" />
                      <div className="flex-1 overflow-x-auto">
                        <div className="text-xs text-muted-foreground mb-1">Previous Hash:</div>
                        <code className="text-xs block bg-muted p-1.5 rounded font-mono text-muted-foreground whitespace-pre-wrap break-all">
                          {log.previousHash}
                        </code>
                        <div className="text-xs text-primary mt-2 mb-1 font-semibold">Block Hash:</div>
                        <code className="text-xs block bg-primary/10 text-primary p-1.5 rounded font-mono whitespace-pre-wrap break-all">
                          {log.hash}
                        </code>
                        <div className="text-xs text-muted-foreground mt-2 mb-1">Details:</div>
                        <code className="text-xs block bg-muted p-1.5 rounded font-mono text-foreground whitespace-pre-wrap break-all">
                          {log.details}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
