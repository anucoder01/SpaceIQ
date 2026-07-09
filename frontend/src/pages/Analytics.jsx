import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const utilizationData = [
  { name: 'Conf A', usage: 85, capacity: 100 },
  { name: 'Conf B', usage: 60, capacity: 100 },
  { name: 'Desk 1', usage: 95, capacity: 100 },
  { name: 'Desk 2', usage: 40, capacity: 100 },
  { name: 'Studio', usage: 75, capacity: 100 },
];

const peakHoursData = [
  { time: '08:00', bookings: 10 },
  { time: '10:00', bookings: 45 },
  { time: '12:00', bookings: 30 },
  { time: '14:00', bookings: 55 },
  { time: '16:00', bookings: 25 },
  { time: '18:00', bookings: 5 },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState('Last 7 Days');

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Utilization Analytics</h1>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-transparent border border-border text-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="glass p-6 rounded-xl shadow-sm hover:shadow-md h-[400px] flex flex-col"
        >
          <h2 className="text-lg font-medium mb-4">Highest Utilized Rooms ({dateRange})</h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{fill: 'rgba(128,128,128,0.1)'}}
                />
                <Legend />
                <Bar dataKey="usage" name="Usage (%)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="glass p-6 rounded-xl shadow-sm hover:shadow-md h-[400px] flex flex-col"
        >
          <h2 className="text-lg font-medium mb-4">Peak Booking Hours ({dateRange})</h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHoursData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                <XAxis dataKey="time" stroke="currentColor" className="text-muted-foreground text-xs" />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
