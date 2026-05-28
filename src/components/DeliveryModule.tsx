import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, Package, Navigation, X, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getTruckIcon = (rotation: number) => {
  return L.divIcon({
    html: `<div class="bg-primary text-white rounded-lg p-1.5 border-2 border-white shadow-xl transition-all duration-1000 ease-linear" style="transform: rotate(${rotation}deg);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v6h2"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>
           </div>`,
    className: 'truck-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface LogisticsUnit {
  id: string;
  position: [number, number];
  rotation: number;
  label: string;
  load: string;
  eta: string;
}

export const DeliveryModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [units, setUnits] = useState<LogisticsUnit[]>([
    { id: 'TRK-01', position: [-23.5505, -46.6333], rotation: 90, label: 'UNIT_OMEGA_DELIVERY', load: 'HIGH_PRIORITY_CARGO', eta: '12m' },
    { id: 'TRK-02', position: [-23.5555, -46.6383], rotation: 180, label: 'PARCEL_NODE_B', load: 'PHARMACEUTICALS', eta: '4m' },
    { id: 'TRK-03', position: [-23.5455, -46.6283], rotation: 45, label: 'HEAVY_RELAY_04', load: 'URBAN_SUPPLY', eta: '22m' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUnits(prev => prev.map(u => ({
        ...u,
        position: [u.position[0] + (Math.random() - 0.5) * 0.001, u.position[1] + (Math.random() - 0.5) * 0.001],
        rotation: u.rotation + (Math.random() - 0.5) * 10
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary" />
            Logistics_Deployment_Grid
          </h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Global cargo routing & unit monitoring</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors rounded-lg">
          <X className="w-5 h-5 text-slate-400 font-bold" />
        </button>
      </div>

      <div className="flex-1 relative bg-white">
        <MapContainer center={[-23.5505, -46.6333]} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {units.map(unit => (
            <Marker key={unit.id} position={unit.position} icon={getTruckIcon(unit.rotation)}>
              <Popup className="custom-popup">
                <div className="p-4 font-mono text-[10px] uppercase min-w-[200px] bg-white">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-3">
                    <div>
                      <p className="font-bold text-xs text-primary">{unit.label}</p>
                      <p className="text-slate-400 tracking-tighter font-bold">{unit.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 font-bold">ETA</p>
                      <p className="text-foreground font-bold">{unit.eta}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 border border-slate-100 flex items-center gap-3 rounded-lg">
                      <Package className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-[8px] text-slate-400 font-bold">MANIFEST_CONTENT</p>
                        <p className="text-foreground font-bold">{unit.load}</p>
                      </div>
                    </div>
                    <Button className="w-full bg-primary text-white uppercase tracking-widest font-bold h-10 shadow-lg shadow-primary/20">Intercept_Uplink</Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Global Stats Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:bottom-8 sm:left-8 z-[1000] space-y-4 pointer-events-none">
          <div className="geometric-card w-full sm:w-64 bg-white/90 backdrop-blur-md p-6 shadow-xl border-primary/20">
            <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">Grid_Efficiency</h4>
            <div className="space-y-2">
               <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                  <span className="text-slate-400">THROUGHPUT</span>
                  <span className="text-emerald-500">92.4%</span>
               </div>
               <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[92%]" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
