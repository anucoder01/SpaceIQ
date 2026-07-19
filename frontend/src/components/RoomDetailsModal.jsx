import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function GlowingHalo({ color = '#3b82f6' }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} />
      <Edges
        linewidth={2}
        threshold={15}
        color={color}
      />
    </mesh>
  );
}

export default function RoomDetailsModal({ venue, onClose, onProceed }) {
  if (!venue) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden glass grid grid-cols-1 md:grid-cols-2"
        >
          {/* 3D Viewer Section */}
          <div className="bg-black/5 dark:bg-black/40 h-64 md:h-full relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 z-10 bg-background/50 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-border shadow-sm">
              Interactive 3D View
            </div>
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <GlowingHalo color={venue.status === 'Available' ? '#3b82f6' : '#f59e0b'} />
              <OrbitControls enableZoom={true} enablePan={false} autoRotate={true} autoRotateSpeed={1} />
            </Canvas>
          </div>

          {/* Details Section */}
          <div className="p-8 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{venue.name}</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      {venue.status || 'Available'}
                    </span>
                    <span className="text-muted-foreground">Building: {venue.building}</span>
                    <span className="text-muted-foreground">Capacity: {venue.capacity}</span>
                  </div>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground bg-secondary/50 p-2 rounded-full transition-colors">
                  &times;
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 border-b border-border pb-2">Room Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {venue.features && venue.features.length > 0 ? (
                    venue.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 size={16} className="text-green-500" />
                        {feature}
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Standard room setup. No special features listed.</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 border-b border-border pb-2">Pricing & Charges</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-bold text-primary">${venue.charges || 0}</span>
                  <span className="text-muted-foreground pb-1">/ hour</span>
                </div>
                
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-destructive shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-destructive/90">
                      <p className="font-semibold mb-1">Important Disclaimers</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Late Fees:</strong> A late checkout fee of $20 per 15 minutes applies if the room is not vacated on time.</li>
                        <li><strong>Damage Fees:</strong> You are responsible for any damages. Fees will be assessed based on repair costs and billed to your account.</li>
                        <li>Please leave the room in the condition you found it.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex gap-4">
              <button 
                onClick={onClose} 
                className="flex-1 py-3 px-4 rounded-xl border border-border hover:bg-muted text-foreground font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onProceed(venue)} 
                disabled={venue.status !== 'Available'}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {venue.status === 'Available' ? 'Proceed to Book' : 'Not Available'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
