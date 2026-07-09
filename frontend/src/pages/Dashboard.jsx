import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Map, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import FloorPlanMap from '../components/FloorPlanMap';

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const mockEvents = [
  {
    title: 'Design Review in Conf A',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
  },
  {
    title: 'Team Standup in Studio',
    start: new Date(new Date().setHours(14, 30, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
  }
];

export default function Dashboard() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [events, setEvents] = useState(mockEvents);
  const [viewMode, setViewMode] = useState('calendar');
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/recommendations')
      .then(res => res.json())
      .then(data => setSuggestion(data.suggestedVenue))
      .catch(() => setSuggestion({
        name: 'Conf A',
        reason: 'Based on your frequent bookings for 5 people.',
        timeSlot: '10:00 AM - 11:00 AM'
      }));
  }, []);

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Real-Time Dashboard</h1>
        <div className="flex gap-4 items-center">
          <div className="flex bg-black/5 dark:bg-white/5 rounded-lg p-1 border border-border">
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 flex items-center gap-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <CalendarIcon size={16} /> Schedule
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 flex items-center gap-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Map size={16} /> Floor Plan
            </button>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBookingForm(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            New Booking
          </motion.button>
        </div>
      </div>

      {suggestion && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Smart Suggestion: {suggestion.name}</h3>
              <p className="text-sm text-muted-foreground">{suggestion.reason} Available today at {suggestion.timeSlot}.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowBookingForm(true)}
            className="text-primary font-medium hover:underline"
          >
            Book Now
          </button>
        </motion.div>
      )}

      <motion.div 
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="glass rounded-xl p-6 shadow-sm hover:shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">Venue {viewMode === 'calendar' ? 'Schedule' : 'Floor Plan'}</h2>
        <div className="h-[500px]">
          {viewMode === 'calendar' ? (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              className="bg-card text-card-foreground rounded-lg p-2"
            />
          ) : (
            <FloorPlanMap onRoomClick={() => setShowBookingForm(true)} />
          )}
        </div>
      </motion.div>

      {showBookingForm && (
        <BookingForm onClose={() => setShowBookingForm(false)} />
      )}
    </div>
  );
}
