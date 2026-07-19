import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Map, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import FloorPlanMap from '../components/FloorPlanMap';
import EmployeeSearch from '../components/EmployeeSearch';
import { useAuth } from '../context/AuthContext';

import RoomDetailsModal from '../components/RoomDetailsModal';

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
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null);
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('map');
  const [suggestion, setSuggestion] = useState(null);
  const [venues, setVenues] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [highlightedVenueId, setHighlightedVenueId] = useState(null);
  const [calendarRange, setCalendarRange] = useState({ start: null, end: null });
  const { token } = useAuth();

  useEffect(() => {
    fetch('http://localhost:5000/api/recommendations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSuggestion(data.suggestedVenue))
      .catch(() => setSuggestion({
        name: 'Conf A',
        reason: 'Based on your frequent bookings for 5 people.',
        timeSlot: '10:00 AM - 11:00 AM'
      }));

    const fetchData = async () => {
      try {
        const [venuesRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:5000/api/venues'),
          fetch('http://localhost:5000/api/bookings/today', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        const venuesData = await venuesRes.json();
        const bookingsData = await bookingsRes.json();
        setVenues(venuesData);
        setTodayBookings(bookingsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // If range is null, we could fetch default or just wait for Calendar to call onRangeChange
    // We'll also just fallback to fetching all if range is not set initially to have data on load
    const url = (calendarRange.start && calendarRange.end) 
      ? `http://localhost:5000/api/bookings?start=${calendarRange.start.toISOString()}&end=${calendarRange.end.toISOString()}`
      : 'http://localhost:5000/api/bookings';

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEvents(data.map(b => ({
          _id: b._id,
          title: `${b.purpose || 'Booking'} in ${b.venue?.name} ${b.status === 'Waitlisted' ? '(Waitlisted)' : ''}`,
          start: new Date(b.startTime),
          end: new Date(b.endTime),
          status: b.status
        })));
      })
      .catch(err => console.error('Failed to fetch calendar bookings', err));
  }, [calendarRange]);

  const handleEmployeeSelect = (user) => {
    const booking = todayBookings.find(b => b.user?._id === user._id || b.user?.name === user.name);
    if (booking && booking.venue) {
      setHighlightedVenueId(booking.venue._id);
      setViewMode('map');
      setTimeout(() => setHighlightedVenueId(null), 5000); // Clear highlight after 5s
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Real-Time Dashboard</h1>
          <div className="flex gap-4 items-center">
            <EmployeeSearch onSelect={handleEmployeeSelect} />
          </div>
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
            onClick={() => { setSelectedVenueForBooking(null); setShowBookingForm(true); }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            New Booking
          </motion.button>
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
              onRangeChange={(range) => {
                if (Array.isArray(range)) {
                  setCalendarRange({ start: range[0], end: range[range.length - 1] });
                } else {
                  setCalendarRange({ start: range.start, end: range.end });
                }
              }}
              onSelectEvent={async (event) => {
                if (window.confirm(`Do you want to cancel the booking: ${event.title}?`)) {
                  try {
                    const res = await fetch(`http://localhost:5000/api/bookings/${event._id}`, { 
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                      window.location.reload();
                    }
                  } catch (err) {
                    console.error('Failed to cancel booking', err);
                  }
                }
              }}
              eventPropGetter={(event) => {
                if (event.status === 'Waitlisted') {
                  return { style: { backgroundColor: '#f59e0b' } }; // amber
                }
                return {};
              }}
            />
          ) : (
            <FloorPlanMap 
              venues={venues} 
              todayBookings={todayBookings} 
              highlightedVenueId={highlightedVenueId}
              onRoomClick={(venue) => {
                setSelectedVenueForBooking(venue);
                setShowRoomDetails(true);
              }} 
            />
          )}
        </div>
      </motion.div>

      {showRoomDetails && (
        <RoomDetailsModal
          venue={selectedVenueForBooking}
          onClose={() => {
            setShowRoomDetails(false);
            setSelectedVenueForBooking(null);
          }}
          onProceed={(venue) => {
            setShowRoomDetails(false);
            setShowBookingForm(true);
          }}
        />
      )}

      {showBookingForm && (
        <BookingForm 
          selectedVenue={selectedVenueForBooking} 
          venues={venues}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedVenueForBooking(null);
          }} 
        />
      )}
    </div>
  );
}
