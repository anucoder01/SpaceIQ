import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Link as LinkIcon, Database, AlertCircle, Edit, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  // Form states for Venue Management
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [venueFeatures, setVenueFeatures] = useState('');
  const [venueStatus, setVenueStatus] = useState('');

  // Form states for Fee Management
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feeType, setFeeType] = useState('Late');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeReason, setFeeReason] = useState('');

  const fetchData = () => {
    if (!token) return;
    
    // Fetch Logs
    fetch('http://localhost:5000/api/audit-logs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => setError(err.message));

    // Fetch Venues
    fetch('http://localhost:5000/api/venues')
      .then(res => res.json())
      .then(data => setVenues(data))
      .catch(err => console.error(err));

    // Fetch Bookings (simplified for admin fee assignment)
    fetch('http://localhost:5000/api/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;

    const featuresArray = venueFeatures.split(',').map(f => f.trim()).filter(f => f);
    
    try {
      const res = await fetch(`http://localhost:5000/api/venues/${selectedVenue._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          features: featuresArray,
          status: venueStatus
        })
      });
      if (res.ok) {
        alert('Venue updated successfully');
        setSelectedVenue(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update venue');
    }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${selectedBooking._id}/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: feeType,
          amount: Number(feeAmount),
          reason: feeReason
        })
      });
      if (res.ok) {
        alert('Fee added successfully');
        setSelectedBooking(null);
        setFeeAmount('');
        setFeeReason('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add fee');
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-primary" size={32} />
        <h1 className="text-3xl font-bold tracking-tight">Admin System</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Venue Management */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 shadow-sm border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Edit className="text-accent" />
            <h2 className="text-xl font-semibold">Venue Management</h2>
          </div>
          
          <form onSubmit={handleUpdateVenue} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Venue</label>
              <select 
                className="w-full bg-input border border-border rounded-md px-3 py-2"
                onChange={(e) => {
                  const v = venues.find(venue => venue._id === e.target.value);
                  setSelectedVenue(v);
                  if (v) {
                    setVenueFeatures(v.features ? v.features.join(', ') : '');
                    setVenueStatus(v.status || 'Available');
                  }
                }}
                value={selectedVenue ? selectedVenue._id : ''}
              >
                <option value="">-- Select a venue --</option>
                {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>

            {selectedVenue && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    className="w-full bg-input border border-border rounded-md px-3 py-2"
                    value={venueStatus}
                    onChange={(e) => setVenueStatus(e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Under Renovation">Under Renovation</option>
                    <option value="Getting Cleaned">Getting Cleaned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Features (comma-separated)</label>
                  <input 
                    type="text" 
                    className="w-full bg-input border border-border rounded-md px-3 py-2"
                    value={venueFeatures}
                    onChange={(e) => setVenueFeatures(e.target.value)}
                    placeholder="Projector, Whiteboard..."
                  />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90">
                  Update Venue
                </button>
              </>
            )}
          </form>
        </motion.div>

        {/* Fee Management */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 shadow-sm border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-accent" />
            <h2 className="text-xl font-semibold">Fee Management</h2>
          </div>

          <form onSubmit={handleAddFee} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Booking (User - Venue)</label>
              <select 
                className="w-full bg-input border border-border rounded-md px-3 py-2"
                onChange={(e) => setSelectedBooking(bookings.find(b => b._id === e.target.value))}
                value={selectedBooking ? selectedBooking._id : ''}
              >
                <option value="">-- Select a booking --</option>
                {bookings.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.user?.name || 'Unknown'} - {b.venue?.name || 'Unknown'} ({new Date(b.startTime).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedBooking && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fee Type</label>
                    <select 
                      className="w-full bg-input border border-border rounded-md px-3 py-2"
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value)}
                    >
                      <option value="Late">Late Fee</option>
                      <option value="Damage">Damage Fee</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount ($)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      className="w-full bg-input border border-border rounded-md px-3 py-2"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-input border border-border rounded-md px-3 py-2"
                    value={feeReason}
                    onChange={(e) => setFeeReason(e.target.value)}
                    placeholder="Left projector on, stained carpet..."
                  />
                </div>
                <button type="submit" className="w-full bg-destructive text-destructive-foreground py-2 rounded-md hover:opacity-90">
                  Assign Fee
                </button>
              </>
            )}
          </form>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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
