import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function BookingForm({ onClose, selectedVenue, venues = [] }) {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [conflictAlternatives, setConflictAlternatives] = useState(null);
  
  // Form State
  const [venueId, setVenueId] = useState(selectedVenue ? selectedVenue._id : (venues.length > 0 ? venues[0]._id : ''));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState(null);

  const submitBooking = async (joinWaitlist = false) => {
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venue: venueId,
          startTime,
          endTime,
          purpose,
          priority: 1,
          joinWaitlist
        })
      });

      if (res.status === 201) {
        // Success
        window.location.reload(); // Simple way to refresh data without global state
      } else if (res.status === 409) {
        // Conflict
        const data = await res.json();
        setConflictAlternatives(data.alternatives || []);
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || data.message || 'An error occurred.');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    submitBooking(false);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden glass"
        >
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-semibold">New Booking Request</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              &times;
            </button>
          </div>
          
          <div className="p-6">
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Select Venue</label>
                  <select 
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    required
                  >
                    {venues.map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purpose</label>
                  <input 
                    type="text" 
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground" 
                    placeholder="E.g., Team Sync"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>

                <div className="bg-destructive/5 text-xs text-destructive/80 p-3 rounded-md mt-4 border border-destructive/20">
                  <strong>Disclaimer:</strong> By confirming this booking, you agree to our policies. Late checkouts will incur a $20 fee per 15 minutes. Any damages to the room will be billed to your account.
                </div>

                <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity mt-4">
                  Confirm Booking
                </button>
              </form>
            ) : (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md">
                  <h3 className="font-semibold mb-1">Conflict Detected</h3>
                  <p className="text-sm mb-3">The selected venue is already booked for this time slot.</p>
                  <button 
                    onClick={() => submitBooking(true)}
                    className="w-full bg-destructive text-destructive-foreground py-2 rounded-md hover:opacity-90 transition-opacity"
                  >
                    Join Waitlist
                  </button>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Available Alternatives</h4>
                  <div className="space-y-2">
                    {conflictAlternatives?.map(alt => (
                      <div key={alt._id} className="flex justify-between items-center p-3 border border-border rounded-md hover:bg-white/5 cursor-pointer transition-colors">
                        <div>
                          <p className="font-medium">{alt.name}</p>
                          <p className="text-xs text-muted-foreground">Capacity: {alt.capacity}</p>
                        </div>
                        <button type="button" onClick={() => {
                          setVenueId(alt._id);
                          setStep(1);
                        }} className="text-sm text-primary hover:underline">Select</button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(1)} className="w-full text-muted-foreground py-2 hover:text-foreground">
                  Back to Form
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
