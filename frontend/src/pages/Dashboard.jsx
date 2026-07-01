import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BookingForm from '../components/BookingForm';

export default function Dashboard() {
  const [showBookingForm, setShowBookingForm] = useState(false);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Real-Time Dashboard</h1>
        <button 
          onClick={() => setShowBookingForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          New Booking
        </button>
      </div>

      <div className="glass rounded-xl p-6 min-h-[400px]">
        <h2 className="text-xl font-semibold mb-4">Venue Timeline (Gantt View)</h2>
        <div className="text-muted-foreground text-sm flex items-center justify-center h-[300px] border border-border border-dashed rounded-lg">
          [ Timeline UI component placeholder - Intended for a complex Gantt rendering showing venues on Y axis and time on X axis ]
        </div>
      </div>

      {showBookingForm && (
        <BookingForm onClose={() => setShowBookingForm(false)} />
      )}
    </div>
  );
}
