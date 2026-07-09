import React, { useState } from 'react';

const rooms = [
  { id: 'conf-a', name: 'Conf A', x: 50, y: 50, width: 200, height: 150, status: 'available' },
  { id: 'conf-b', name: 'Conf B', x: 270, y: 50, width: 200, height: 150, status: 'booked' },
  { id: 'studio', name: 'Studio', x: 50, y: 220, width: 150, height: 200, status: 'available' },
  { id: 'desk-1', name: 'Desk 1', x: 250, y: 220, width: 80, height: 80, status: 'available' },
  { id: 'desk-2', name: 'Desk 2', x: 350, y: 220, width: 80, height: 80, status: 'booked' },
];

export default function FloorPlanMap({ onRoomClick }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-lg border border-border overflow-hidden">
      <svg width="600" height="500" viewBox="0 0 600 500" className="w-full h-full max-h-[500px]">
        <rect width="100%" height="100%" fill="transparent" />
        
        {rooms.map((room) => {
          const isHovered = hovered === room.id;
          const isAvailable = room.status === 'available';
          const fillClass = isAvailable ? 'fill-primary/20' : 'fill-destructive/20';
          const strokeClass = isAvailable ? 'stroke-primary' : 'stroke-destructive';
          
          return (
            <g 
              key={room.id}
              onMouseEnter={() => setHovered(room.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onRoomClick && onRoomClick(room)}
              className="cursor-pointer transition-all duration-300"
            >
              <rect 
                x={room.x} 
                y={room.y} 
                width={room.width} 
                height={room.height} 
                rx="8"
                className={`${fillClass} ${strokeClass} ${isHovered ? 'opacity-80' : 'opacity-100'}`}
                strokeWidth={isHovered ? "4" : "2"}
              />
              <text 
                x={room.x + room.width / 2} 
                y={room.y + room.height / 2} 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className="fill-foreground font-semibold text-sm"
              >
                {room.name}
              </text>
              <text 
                x={room.x + room.width / 2} 
                y={room.y + room.height / 2 + 20} 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className={`text-xs ${isAvailable ? 'fill-primary' : 'fill-destructive'}`}
              >
                {room.status.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
