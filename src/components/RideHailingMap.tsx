import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Car, User, Navigation, X, ShieldCheck, MapPin, Flag, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

// Custom icons using Lucide
const createIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="color: ${color}; filter: drop-shadow(0 0 5px ${color});"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>`,
    className: 'custom-map-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const userIcon = L.divIcon({
  html: `<div class="bg-primary text-slate-900 rounded-full p-1 border-2 border-white shadow-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`,
  className: 'user-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pickupIcon = L.divIcon({
  html: `<div class="bg-blue-500 text-white rounded-full p-1.5 border-2 border-white shadow-lg animate-pulse"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  className: 'pickup-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destinationIcon = L.divIcon({
  html: `<div class="bg-rose-500 text-white rounded-full p-1.5 border-2 border-white shadow-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg></div>`,
  className: 'destination-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const hubIcon = L.divIcon({
  html: `<div class="bg-amber-500 text-slate-900 rounded-full p-1.5 border-2 border-white shadow-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18"></path><path d="M15 3v18"></path><path d="M3 9h18"></path><path d="M3 15h18"></path></svg></div>`,
  className: 'hub-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const getCarIcon = (status: MockCar['status'], rotation: number) => {
  const colorClass = 
    status === 'BOOKED' ? 'bg-primary' : 
    status === 'BUSY' ? 'bg-amber-500' : 
    'bg-emerald-500';

  const animationClass = 
    status === 'BOOKED' ? 'animate-tactical-pulse' : 
    status === 'OPERATIONAL' ? 'animate-status-shimmer' : 
    '';

  // Using a data attribute for rotation to keep the inner HTML stable and allow CSS transitions
  return L.divIcon({
    html: `<div class="${colorClass} ${animationClass} text-slate-900 rounded-full p-1 border-2 border-white shadow-lg transition-all duration-1000 ease-linear car-icon-inner" style="--car-rotation: ${rotation}deg; transform: rotate(var(--car-rotation));">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
           </div>`,
    className: 'car-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to recenter map
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

interface MockCar {
  id: string;
  position: [number, number];
  rotation: number;
  label: string;
  status: 'OPERATIONAL' | 'BOOKED' | 'TRANSIT' | 'BUSY';
  eta?: string;
  model: string;
  driver: string;
  speed: number;
  rating: number;
  avatar: string;
  bio: string;
}

interface MapLocation {
  id: string;
  type: 'PICKUP' | 'DESTINATION' | 'HUB';
  position: [number, number];
  label: string;
  description: string;
}

export const RideHailingMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5505, -46.6333]); // Default: São Paulo
  const [cars, setCars] = useState<MockCar[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<MockCar | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'confirming' | 'requesting' | 'confirmed'>('idle');
  const [selectedDriver, setSelectedDriver] = useState<MockCar | null>(null);
  const [roleMode, setRoleMode] = useState<'cliente' | 'lavoratore'>('cliente');
  const [driverStatus, setDriverStatus] = useState<string>('Disponibile in Turno');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  // Helpers
  const getETA = (pos1: [number, number], pos2: [number, number]) => {
    const dist = Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
    const mins = Math.max(1, Math.round(dist * 2000));
    const secs = Math.floor(Math.random() * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const carModels = ['Tesla Model S', 'Lucid Air', 'Rivian R1S', 'Porsche Taycan', 'Polestar 3'];
  const drivers = ['Alex J.', 'Morgan S.', 'Casey L.', 'Robin K.', 'Jordan P.'];
  const bios = [
    'Specialist in high-velocity transit and urban shortcut interpolation.',
    'System veteran with 10+ years of autonomous fleet management experience.',
    'Cybernetic logistics expert specializing in low-latency delivery protocols.',
    'Former security consultant turned tactical transit operator.',
    'Master of the grid. Known for 99.9% reliability in extreme conditions.'
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          generateCars([latitude, longitude]);
          setLoading(false);
        },
        () => {
          generateCars(userLocation);
          setLoading(false);
        }
      );
    } else {
      generateCars(userLocation);
      setLoading(false);
    }
  }, []);

  const generateCars = (center: [number, number]) => {
    const newCars: MockCar[] = [];
    for (let i = 0; i < 5; i++) {
      newCars.push({
        id: `car-${i}`,
        position: [
          center[0] + (Math.random() - 0.5) * 0.01,
          center[1] + (Math.random() - 0.5) * 0.01,
        ],
        rotation: Math.random() * 360,
        label: `UNIT_0x${Math.floor(Math.random() * 9999).toString(16).toUpperCase()}`,
        status: 'OPERATIONAL',
        model: carModels[i % carModels.length],
        driver: drivers[i % drivers.length],
        speed: Math.floor(Math.random() * 40 + 20),
        rating: 4.5 + Math.random() * 0.5,
        avatar: `https://i.pravatar.cc/150?u=${i}`,
        bio: bios[i % bios.length],
      });
    }
    setCars(newCars);

    // Generate static locations
    const newLocations: MapLocation[] = [
      {
        id: 'loc-1',
        type: 'PICKUP',
        position: [center[0] + 0.002, center[1] + 0.002],
        label: 'PICKUP_POINT_A',
        description: 'Primary deployment zone for urban sector 01.'
      },
      {
        id: 'loc-2',
        type: 'DESTINATION',
        position: [center[0] - 0.003, center[1] - 0.004],
        label: 'TARGET_ZONE_X',
        description: 'Critical destination node for bio-metric transfers.'
      },
      {
        id: 'loc-3',
        type: 'HUB',
        position: [center[0] + 0.005, center[1] - 0.002],
        label: 'SUPPLY_HUB_ALPHA',
        description: 'Main maintenance and logistics enclave.'
      }
    ];
    setLocations(newLocations);
  };

  const handleBooking = (car: MockCar) => {
    setActiveBooking(car);
    setBookingStatus('confirming');
  };

  const confirmBooking = () => {
    if (!activeBooking) return;
    setBookingStatus('requesting');
    
    // Simulate network handshake
    setTimeout(() => {
      setBookingStatus('confirmed');
      setCars(prev => prev.map(c => 
        c.id === activeBooking.id ? { ...c, status: 'BOOKED', eta: getETA(c.position, userLocation) } : c
      ));
    }, 2000);
  };

  // Simulate car movement and update ETA/Speed
  useEffect(() => {
    if (cars.length === 0) return;
    
    // Track target positions for operational cars to create "routes"
    const interval = setInterval(() => {
      setCars(prev => prev.map(car => {
        // Update speed slightly
        let newSpeed = car.speed + (Math.random() - 0.5) * 5;
        newSpeed = Math.max(10, Math.min(80, newSpeed));

        // If car is booked, it should move towards the user
        if (car.status === 'BOOKED') {
          const latDiff = userLocation[0] - car.position[0];
          const lngDiff = userLocation[1] - car.position[1];
          
          // Smoother, persistent movement towards target
          const newPos: [number, number] = [
            car.position[0] + latDiff * 0.15, 
            car.position[1] + lngDiff * 0.15,
          ];
          
          return {
            ...car,
            position: newPos,
            rotation: Math.atan2(lngDiff, latDiff) * (180 / Math.PI),
            eta: getETA(newPos, userLocation),
            speed: newSpeed
          };
        }
        
        // Operational cars: move in a consistent direction for a while
        // For simplicity, we just add a small random vector that persists slightly better
        const drift = 0.0001;
        return {
          ...car,
          position: [
            car.position[0] + (Math.random() - 0.5) * drift,
            car.position[1] + (Math.random() - 0.5) * drift,
          ],
          rotation: car.rotation + (Math.random() - 0.5) * 5,
          speed: newSpeed
        };
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [cars.length, userLocation]);

  // Simulation of background activity: Randomly set cars to BUSY or back to OPERATIONAL
  useEffect(() => {
    const interval = setInterval(() => {
      setCars(prev => prev.map(car => {
        // Don't interfere with user's active booking
        if (car.status === 'BOOKED' || (activeBooking && car.id === activeBooking.id)) {
          return car;
        }

        // 10% chance to flip status
        if (Math.random() < 0.1) {
          return {
            ...car,
            status: car.status === 'OPERATIONAL' ? 'BUSY' : 'OPERATIONAL'
          };
        }
        return car;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBooking]);

  const bookedCar = cars.find(c => c.status === 'BOOKED');

  return (
    <div className="fixed inset-0 z-[100] bg-slate-200/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl h-full flex flex-col bg-white border border-slate-100 relative shadow-2xl rounded-xl overflow-hidden">
        {/* Booking Overlay Modal */}
        <AnimatePresence>
          {bookingStatus !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 z-[2000] bg-slate-100/60 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8
                }}
                className="geometric-card max-w-md w-full bg-white border-primary/30 p-10 text-center relative shadow-2xl"
              >
                <div className="corner-accent" />
                
                {bookingStatus === 'confirming' && (
                  <>
                    <div className="w-16 h-16 bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto mb-6 rounded-lg">
                      <Navigation className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground mb-2 uppercase tracking-widest">CONFIRM_DISPATCH</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose mb-8 text-center px-4 font-bold">
                      Authorize unit {activeBooking?.label} to prioritize your coordinates. <br/> 
                      Model: {activeBooking?.model} | Rating: {activeBooking?.rating?.toFixed(2)}
                    </p>
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => {
                          setBookingStatus('idle');
                          setActiveBooking(null);
                        }}
                        variant="outline"
                        className="flex-1 border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary uppercase tracking-widest font-bold h-12"
                      >
                        Abort
                      </Button>
                      <Button 
                        onClick={confirmBooking}
                        className="flex-1 bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest shadow-lg shadow-primary/20 h-12"
                      >
                        Execute
                      </Button>
                    </div>
                  </>
                )}

                {bookingStatus === 'requesting' && (
                  <>
                    <div className="w-16 h-16 border-2 border-primary border-t-transparent animate-spin mx-auto mb-6 rounded-full" />
                    <h3 className="text-xl font-heading font-bold text-foreground mb-2 uppercase tracking-widest">HANDSHAKE_IN_PROGRESS</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose font-bold">Establishing secure connection with {activeBooking?.label}...</p>
                  </>
                )}
                
                {bookingStatus === 'confirmed' && (
                  <>
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 rounded-lg">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground mb-2 uppercase tracking-widest">UNIT_DISPATCHED</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-loose mb-8 font-bold">
                      Handshake complete. {activeBooking?.label} is rerouting to your coordinates. 
                      Estimated intercept in {activeBooking && cars.find(c => c.id === activeBooking.id)?.eta || '04:22'}.
                    </p>
                    <Button 
                      onClick={() => {
                        setBookingStatus('idle');
                        setActiveBooking(null);
                      }}
                      className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest h-12 shadow-lg shadow-primary/20"
                    >
                      Acknowledge
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Driver Profile Modal */}
        <AnimatePresence>
          {selectedDriver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 z-[3000] bg-slate-200/60 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8
                }}
                className="geometric-card max-w-sm w-full bg-white border-primary/30 p-8 text-center relative shadow-2xl"
              >
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-primary transition-colors"
                >
                  <X className="w-5 h-5 font-bold" />
                </button>
                <div className="corner-accent" />
                
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border border-primary/20 scale-110 animate-pulse rounded-full" />
                  <img 
                    src={selectedDriver.avatar} 
                    alt={selectedDriver.driver} 
                    className="w-full h-full object-cover border border-slate-100 grayscale hover:grayscale-0 transition-all duration-500 rounded-lg shadow-md"
                  />
                </div>

                <h3 className="text-xl font-heading font-bold text-foreground mb-1 uppercase tracking-widest">{selectedDriver.driver}</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4 font-bold">System Operator_Class_A</p>
                
                <p className="text-[11px] text-slate-500 italic mb-6 px-4 leading-relaxed line-clamp-2">
                  "{selectedDriver.bio}"
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg shadow-sm">
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Reliability_Rating</p>
                    <p className="text-lg font-mono text-primary font-bold">{selectedDriver.rating.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg shadow-sm">
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Active_Service</p>
                    <p className="text-lg font-mono text-foreground font-bold">4.2h</p>
                  </div>
                </div>

                <div className="space-y-2 text-left mb-8">
                   <div className="flex justify-between text-[10px] font-mono border-b border-slate-50 pb-2">
                      <span className="text-slate-400 font-bold">UNIT_ASSIGNED</span>
                      <span className="text-foreground font-bold">{selectedDriver.label}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-mono border-b border-slate-50 pb-2">
                      <span className="text-slate-400 font-bold">LICENSE_ID</span>
                      <span className="text-foreground font-bold">AG-OP-004{selectedDriver.id.split('-')[1]}</span>
                   </div>
                </div>

                <Button 
                  onClick={() => setSelectedDriver(null)}
                  className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest h-12 shadow-lg shadow-primary/20"
                >
                  Close_Dossier
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
              <Navigation className="w-5 h-5 text-primary" />
              Deployment_Matrix
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Real-time Node_Topology for Ride_Hailing</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:text-primary transition-colors rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container split into Left Sidebar and Right Map */}
        <div className="flex-1 relative overflow-hidden bg-white flex flex-col md:flex-row">
          {/* Left Console Sidebar */}
          <div className="w-full md:w-[380px] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col z-20 space-y-5 bg-white shrink-0 p-6 overflow-y-auto">
            {/* Due Tasti di Ruolo: Cliente e Conducente / Autista */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setRoleMode('cliente')}
                className={`py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  roleMode === 'cliente'
                    ? 'bg-primary text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Clienti
              </button>
              <button
                onClick={() => setRoleMode('lavoratore')}
                className={`py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  roleMode === 'lavoratore'
                    ? 'bg-primary text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Autisti / Conducenti
              </button>
            </div>

            {roleMode === 'lavoratore' ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="p-4 bg-slate-900 text-white border border-primary/30 rounded-xl space-y-3 relative overflow-hidden">
                  <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <h4 className="text-[10px] font-mono tracking-widest text-primary/80 uppercase font-bold">TERMINALE CO-PILOTA AUTISTA</h4>
                  <p className="text-xs font-bold font-mono">STATO OPERATIVO: <span className="text-emerald-450 uppercase">{driverStatus}</span></p>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                    Effettua corse per i passeggeri del Piemonte. Il 90% di ogni tariffa viene accreditato istantaneamente sul tuo conto, mentre la piattaforma trattiene il 10% di royalty della rete.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        setDriverStatus('In Servizio attivo');
                        setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] DRIVER_ON_ROAD: GPS trasmesso. Pronti alle prenotazioni.`, ...prev]);
                      }}
                      className="h-8 text-[8.5px] bg-primary text-white hover:bg-primary/90 uppercase tracking-wider font-extrabold flex-1 cursor-pointer"
                    >
                      Avvia Servizio
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDriverStatus('Disponibile in Turno');
                        setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] COMPLIANT: Autista idoneo in stato pronto.`, ...prev]);
                      }}
                      className="h-8 text-[8.5px] border-white/20 text-slate-350 hover:bg-white/10 hover:text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer"
                    >
                      Dichiara Pronto
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-slate-150 rounded-xl bg-slate-50 space-y-3">
                  <h4 className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold font-bold">CONTO ADYEN SPLIT</h4>
                  <div className="divide-y divide-slate-150 font-mono text-[10px]">
                    <div className="flex py-2 justify-between items-center text-slate-600">
                      <span className="font-bold">Sub-Account ID:</span>
                      <span className="text-slate-800 font-bold">SUB_ADY_1802_TAXI</span>
                    </div>
                    <div className="flex py-2 justify-between items-center text-slate-650">
                      <span className="font-bold font-bold">Split Autista:</span>
                      <span className="text-emerald-600 font-bold font-bold">90%</span>
                    </div>
                    <div className="flex py-2 justify-between items-center text-slate-650">
                      <span className="font-bold">Stato Profilo:</span>
                      <span className="text-emerald-600 font-bold font-mono">STANDBY_OK</span>
                    </div>
                  </div>
                </div>

                {telemetryLogs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold font-bold">LOGS MOBILITÀ AUTISTA</h4>
                    <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 h-32 overflow-y-auto space-y-1 overflow-x-hidden">
                      {telemetryLogs.map((log, index) => (
                        <p key={index} className="text-[8.5px] font-mono text-slate-600 truncate uppercase">{log}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-mono text-primary uppercase tracking-widest font-extrabold text-center">ELENCO UNITÀ VICINE</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
                    Seleziona un'unità operativa direttamente sulla mappa geopolitica interattiva o clicca su un marker per invocare un passaggio.
                  </p>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {cars.map((car) => (
                    <div 
                      key={car.id} 
                      onClick={() => handleBooking(car)}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-lg cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <p className="text-[11px] font-bold font-mono text-foreground">{car.label}</p>
                        </div>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{car.model} | {car.driver}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all">
                          Richiedi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Map */}
          <div className="flex-1 relative h-full min-h-[300px]">
            {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent animate-spin mb-4 rounded-full" />
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.5em] font-bold">Establishing Handshake...</p>
             </div>
          ) : (
            <MapContainer 
              center={userLocation} 
              zoom={15} 
              className="h-full w-full"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <ChangeView center={userLocation} />
              
              {/* User Marker */}
              <Marker position={userLocation} icon={userIcon}>
                <Popup className="custom-popup">
                  <div className="p-2 font-mono text-[10px] uppercase">
                    <p className="text-primary font-bold">CLIENT_ORIGIN</p>
                    <p className="text-slate-400 mt-1">LOC: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Location Markers (Pickups, Targets, Hubs) */}
              {locations.map(loc => (
                <Marker 
                  key={loc.id} 
                  position={loc.position} 
                  icon={
                    loc.type === 'PICKUP' ? pickupIcon : 
                    loc.type === 'DESTINATION' ? destinationIcon : 
                    hubIcon
                  }
                >
                  <Popup className="custom-popup">
                    <div className="p-4 font-mono text-[10px] uppercase min-w-[180px] bg-white text-foreground">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          loc.type === 'PICKUP' ? 'bg-blue-500' : 
                          loc.type === 'DESTINATION' ? 'bg-rose-500' : 
                          'bg-amber-500'
                        }`} />
                        <h4 className="font-bold text-foreground tracking-widest">{loc.label}</h4>
                      </div>
                      <p className="text-slate-500 mb-3 lowercase italic leading-relaxed font-bold">
                        {loc.description}
                      </p>
                      <div className="flex justify-between items-center text-[8px] text-slate-300 border-t border-slate-50 pt-2 font-bold">
                        <span>NODE_TYPE: {loc.type}</span>
                        <span>0x{loc.id.split('-')[1]}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Car Markers */}
              {cars.map(car => (
                <Marker key={car.id} position={car.position} icon={getCarIcon(car.status, car.rotation)}>
                  <Popup className="custom-popup">
                    <div className="p-4 font-mono text-[10px] uppercase min-w-[200px] bg-white text-foreground">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-3">
                        <div>
                          <p className={`font-bold text-xs ${
                            car.status === 'BOOKED' ? 'text-primary' : 
                            car.status === 'BUSY' ? 'text-amber-500' : 
                            'text-emerald-500'
                          }`}>{car.label}</p>
                          <p className="text-slate-400 tracking-tighter font-bold">{car.model}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 font-bold">SPD</p>
                          <p className="text-foreground font-bold">{car.speed.toFixed(0)} <span className="text-slate-300">KM/H</span></p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">OPERATOR</span>
                          <button 
                            onClick={() => setSelectedDriver(car)}
                            className="text-primary hover:underline transition-all cursor-pointer font-bold"
                          >
                            {car.driver}
                          </button>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">STATUS</span>
                          <span className={`${
                            car.status === 'BOOKED' ? 'text-primary' : 
                            car.status === 'BUSY' ? 'text-amber-500' :
                            'text-emerald-500'
                          } font-bold`}>{car.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">RATING</span>
                          <button 
                            onClick={() => setSelectedDriver(car)}
                            className="text-primary hover:text-primary transition-colors flex items-center gap-1 group/rating font-bold"
                          >
                            <span className="group-hover/rating:scale-110 transition-transform">★</span>
                            {car.rating.toFixed(2)}
                          </button>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold">DIST_REL</span>
                          <span className="text-slate-500 font-bold">{(Math.sqrt(Math.pow(car.position[0] - userLocation[0], 2) + Math.pow(car.position[1] - userLocation[1], 2)) * 111).toFixed(2)}KM</span>
                        </div>
                      </div>

                      {car.status === 'BUSY' && (
                        <div className="py-2 text-center border border-amber-500/20 text-amber-500 bg-amber-50 rounded-lg">
                          <p className="font-bold tracking-widest">SESSION_ACTIVE</p>
                          <p className="text-[8px] mt-1 opacity-60 italic">Reserved by External Client</p>
                        </div>
                      )}
                      
                      {car.status === 'OPERATIONAL' && (
                        <button 
                          onClick={() => handleBooking(car)}
                          className="w-full py-2 bg-primary text-white font-bold tracking-widest hover:bg-primary/90 transition-all rounded-lg shadow-lg shadow-primary/20"
                        >
                          INVOKE_PICKUP
                        </button>
                      )}
                      {car.status === 'BOOKED' && (
                        <div className="py-2 text-center border border-primary/20 text-primary bg-primary/5 rounded-lg">
                          <p className="font-bold tracking-widest underline decoration-primary/20 underline-offset-4">IN_TRANSIT</p>
                          <p className="text-[14px] mt-1 font-bold animate-pulse">ETA {car.eta}</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Map Overlay Controls */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 z-[1000] flex flex-col gap-3">
             <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-4 w-full sm:min-w-[200px] shadow-2xl rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">Service Statistics</p>
                <div className="space-y-2">
                   {bookedCar ? (
                     <>
                       <div className="flex justify-between items-center text-[11px] font-mono border-b border-primary/10 pb-2 mb-2">
                         <span className="text-primary font-bold">ACTIVE_NODE</span>
                         <span className="text-primary font-bold">{bookedCar.label}</span>
                       </div>
                       <div className="flex justify-between items-center text-[11px] font-mono">
                         <span className="text-slate-400 font-bold">Arrival_Estimate</span>
                         <span className="text-foreground font-bold animate-pulse">{bookedCar.eta}</span>
                       </div>
                     </>
                   ) : (
                     <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-slate-400 font-bold">Available_Units</span>
                        <span className="text-emerald-500 font-bold">{cars.filter(c => c.status === 'OPERATIONAL').length}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-400 font-bold">Eta_Shortest</span>
                      <span className="text-foreground font-bold">04:22m</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-mono border-t border-slate-50 pt-2 mt-2">
                      <span className="text-slate-400 font-bold">Global_Base_Fee</span>
                      <span className="text-primary font-bold">0.0012 ETH</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="absolute top-6 right-6 z-[1000]">
             <div className="flex flex-col gap-2">
                <button 
                   onClick={() => L.map('map-container').zoomIn()} 
                   className="w-10 h-10 bg-white/90 backdrop-blur-md border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-primary rounded-lg shadow-lg font-bold"
                >+</button>
                <button 
                   onClick={() => L.map('map-container').zoomOut()}
                   className="w-10 h-10 bg-white/90 backdrop-blur-md border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-primary rounded-lg shadow-lg font-bold"
                >-</button>
             </div>
          </div>
        </div>
      </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[9px] font-mono uppercase tracking-[0.2em] text-slate-300 font-bold">
           <div className="flex gap-6">
              <span>LAT_REF: {userLocation[0].toFixed(6)}</span>
              <span>LNG_REF: {userLocation[1].toFixed(6)}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Network_Synchronized</span>
           </div>
        </div>
      </div>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: #ffffff;
          color: #0f172a;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          padding: 0;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: #ffffff;
        }
        .leaflet-container {
          background: #f8fafc !important;
        }
        .leaflet-marker-icon {
          transition: transform 1s linear !important;
          will-change: transform;
        }
        .car-icon-inner {
          will-change: transform;
        }
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        @keyframes tacticalPulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 163, 255, 0.6); transform: scale(1) rotate(var(--car-rotation)); }
          50% { box-shadow: 0 0 0 20px rgba(0, 163, 255, 0); transform: scale(1.1) rotate(var(--car-rotation)); }
          100% { box-shadow: 0 0 0 0 rgba(0, 163, 255, 0); transform: scale(1) rotate(var(--car-rotation)); }
        }
        @keyframes statusShimmer {
          0% { filter: brightness(1) contrast(1); }
          50% { filter: brightness(1.4) contrast(1.1) drop-shadow(0 0 10px rgba(16, 185, 129, 0.4)); }
          100% { filter: brightness(1) contrast(1); }
        }
        .animate-tactical-pulse {
          animation: tacticalPulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-status-shimmer {
          animation: statusShimmer 4s ease-in-out infinite;
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
