import React from 'react';

export default function Analytics() {
  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Utilization Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-medium mb-4">Highest Utilized Rooms</h2>
          <div className="h-64 flex items-center justify-center text-muted-foreground border border-border border-dashed rounded-lg">
            [ Bar Chart Placeholder ]
          </div>
        </div>
        
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-medium mb-4">Peak Booking Hours</h2>
          <div className="h-64 flex items-center justify-center text-muted-foreground border border-border border-dashed rounded-lg">
            [ Line Chart Placeholder ]
          </div>
        </div>
      </div>
    </div>
  );
}
