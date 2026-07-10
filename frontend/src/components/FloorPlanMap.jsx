import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function FloorPlanMap({ venues = [], todayBookings = [], highlightedVenueId, onRoomClick }) {
  const [hovered, setHovered] = useState(null);

  // We rely on the venues passed from the backend
  return (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-lg border border-border overflow-hidden">
      <svg width="600" height="500" viewBox="0 0 600 500" className="w-full h-full max-h-[500px]">
        <rect width="100%" height="100%" fill="transparent" />
        
        {venues.map((venue) => {
          const isHovered = hovered === venue._id;
          
          // Determine if it's booked today
          const now = new Date();
          const isBookedNow = todayBookings.some(b => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return b.venue._id === venue._id && now >= start && now <= end && b.status === 'Approved';
          });
          
          // Or just check overall status logic
          const isAvailable = venue.status === 'Available' && !isBookedNow;
          const fillClass = isAvailable ? 'fill-primary/20' : 'fill-destructive/20';
          const strokeClass = isAvailable ? 'stroke-primary' : 'stroke-destructive';
          
          const isHighlighted = highlightedVenueId === venue._id;

          return (
            <g 
              key={venue._id}
              onMouseEnter={() => setHovered(venue._id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onRoomClick && onRoomClick(venue)}
              className="cursor-pointer transition-all duration-300"
            >
              <motion.rect 
                x={venue.x} 
                y={venue.y} 
                width={venue.width} 
                height={venue.height} 
                rx="8"
                className={`${fillClass} ${strokeClass} ${isHovered ? 'opacity-80' : 'opacity-100'}`}
                strokeWidth={isHovered ? "4" : "2"}
                animate={isHighlighted ? {
                  strokeWidth: [2, 6, 2],
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.05, 1],
                } : {}}
                transition={isHighlighted ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
                style={{ originX: (venue.x + venue.width/2)/600, originY: (venue.y + venue.height/2)/500 }}
              />
              <text 
                x={venue.x + venue.width / 2} 
                y={venue.y + venue.height / 2} 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className="fill-foreground font-semibold text-sm"
              >
                {venue.name}
              </text>
              <text 
                x={venue.x + venue.width / 2} 
                y={venue.y + venue.height / 2 + 20} 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className={`text-xs ${isAvailable ? 'fill-primary' : 'fill-destructive'}`}
              >
                {isAvailable ? 'AVAILABLE' : 'BOOKED'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
