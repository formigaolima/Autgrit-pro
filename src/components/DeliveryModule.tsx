import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, Package, Navigation, X, ShieldCheck, Zap, User } from 'lucide-react';
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

// Component to recenter map
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export const DeliveryModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [center, setCenter] = useState<[number, number]>([-23.5505, -46.6333]); // Default São Paulo
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<LogisticsUnit[]>([]);
  const [roleMode, setRoleMode] = useState<'cliente' | 'lavoratore'>('cliente');
  const [cargoName, setCargoName] = useState<string>('');
  const [deliveryStatus, setDeliveryStatus] = useState<string>('In Attesa di Assegnamento');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleGeo = (position: any) => {
      const { latitude, longitude } = position.coords;
      const userPos: [number, number] = [latitude, longitude];
      setCenter(userPos);
      setUnits([
        { id: 'TRK-01', position: [latitude + 0.002, longitude + 0.002], rotation: 90, label: 'UNIT_OMEGA_DELIVERY', load: 'HIGH_PRIORITY_CARGO', eta: '12m' },
        { id: 'TRK-02', position: [latitude - 0.003, longitude + 0.005], rotation: 180, label: 'PARCEL_NODE_B', load: 'PHARMACEUTICALS', eta: '4m' },
        { id: 'TRK-03', position: [latitude + 0.004, longitude - 0.003], rotation: 45, label: 'HEAVY_RELAY_04', load: 'URBAN_SUPPLY', eta: '22m' },
      ]);
      setLoading(false);
    };

    const handleErr = () => {
      const defaultCenter: [number, number] = [-23.5505, -46.6333];
      setCenter(defaultCenter);
      setUnits([
        { id: 'TRK-01', position: [defaultCenter[0] + 0.002, defaultCenter[1] + 0.002], rotation: 90, label: 'UNIT_OMEGA_DELIVERY', load: 'HIGH_PRIORITY_CARGO', eta: '12m' },
        { id: 'TRK-02', position: [defaultCenter[0] - 0.003, defaultCenter[1] + 0.005], rotation: 180, label: 'PARCEL_NODE_B', load: 'PHARMACEUTICALS', eta: '4m' },
        { id: 'TRK-03', position: [defaultCenter[0] + 0.004, defaultCenter[1] - 0.003], rotation: 45, label: 'HEAVY_RELAY_04', load: 'URBAN_SUPPLY', eta: '22m' },
      ]);
      setLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleGeo, handleErr, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } else {
      handleErr();
    }
  }, []);

  useEffect(() => {
    if (units.length === 0) return;
    const interval = setInterval(() => {
      setUnits(prev => prev.map(u => ({
        ...u,
        position: [u.position[0] + (Math.random() - 0.5) * 0.0005, u.position[1] + (Math.random() - 0.5) * 0.0005],
        rotation: u.rotation + (Math.random() - 0.5) * 10
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [units.length]);

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

      <div className="flex-1 relative bg-white flex flex-col md:flex-row overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 z-[2000] bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin rounded-full mb-3" />
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Querying Logistics Node GPS...</p>
          </div>
        ) : null}

        {/* Left Control Panel Sidebar */}
        <div className="w-full md:w-[380px] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col z-20 space-y-5 bg-white shrink-0 p-6 overflow-y-auto">
          {/* Due Tasti di Ruolo: Cliente e Conducente / Corriere */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setRoleMode('cliente');
              }}
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
              Conducenti / Corrieri
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
                <h4 className="text-[10px] font-mono tracking-widest text-primary/80 uppercase font-bold">CRUSCOTTO TRASPORTATORE</h4>
                <p className="text-xs font-bold font-mono">STATO OPERATIVO: <span className="text-emerald-400 uppercase">{deliveryStatus}</span></p>
                <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                  Accetta commissioni di trasporto merci lungo le rotte strategiche piemontesi. Trattieni direttamente il 90% lordo tramite il routing Adyen automatico.
                </p>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      setDeliveryStatus('In Consegna attiva');
                      setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] TRANSIT: Stato spedizione aggiornato ad 'IN_MARCIA'. GPS sincronizzato.`, ...prev]);
                    }}
                    className="h-8 text-[8.5px] bg-primary text-white hover:bg-primary/90 uppercase tracking-wider font-extrabold flex-1 cursor-pointer"
                  >
                    Avvia Consegna
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDeliveryStatus('Pronto per Carico');
                      setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] DEPOT: Carico completato e approvato digitalmente.`, ...prev]);
                    }}
                    className="h-8 text-[8.5px] border-white/20 text-slate-350 hover:bg-white/10 hover:text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer"
                  >
                    Conferma Carico
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50 space-y-3">
                <h4 className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">RIPARTIZIONE ADYEN COMMISSIVITY</h4>
                <div className="divide-y divide-slate-150 font-mono text-[10px]">
                  <div className="flex py-2 justify-between items-center text-slate-600">
                    <span className="font-bold uppercase">Codice SubAccount:</span>
                    <span className="text-slate-800 font-bold">ADY_CARGO_921_ALPHA</span>
                  </div>
                  <div className="flex py-2 justify-between items-center text-slate-650">
                    <span className="font-bold uppercase">Split quota conducente:</span>
                    <span className="text-emerald-600 font-bold font-bold">90%</span>
                  </div>
                  <div className="flex py-2 justify-between items-center text-slate-650">
                    <span className="font-bold uppercase">Accertamento Legale:</span>
                    <span className="text-emerald-600 font-bold font-mono">VERIFIED</span>
                  </div>
                </div>
              </div>

              {telemetryLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold font-bold">LOGS LOGISTICA CARGO</h4>
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 h-32 overflow-y-auto space-y-1">
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
              className="space-y-5"
            >
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                <h4 className="text-[9.5px] font-mono text-primary uppercase tracking-widest font-bold">PRENOTA SPEDIZIONE SEC_CARGO</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
                  Inserisci la merce o il container da spedire per calcolare il preventivo e tracciare la consegna terrestre tramite flotta blindata AutGrit.
                </p>

                <div className="space-y-2.5">
                  <label className="block text-[8.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">NOME CARICO / MANIFESTO</label>
                  <input
                    type="text"
                    value={cargoName}
                    onChange={(e) => setCargoName(e.target.value)}
                    placeholder="es. Farmaci Salvavita Sec_X"
                    className="w-full p-2 text-xs font-mono border border-slate-200 rounded-lg bg-white"
                  />
                  <Button
                    onClick={() => {
                      if (!cargoName.trim()) return;
                      const newId = `TRK-${Math.floor(Math.random() * 90) + 10}`;
                      setUnits(prev => [
                        { id: newId, position: [center[0] + 0.001, center[1] - 0.002], rotation: 120, label: 'NUOVA_ROTA_CARGO', load: cargoName.toUpperCase(), eta: '9m' },
                        ...prev
                      ]);
                      setCargoName('');
                    }}
                    className="w-full bg-primary text-white font-bold uppercase tracking-widest h-9 shadow-lg shadow-primary/20 text-xs text-center"
                  >
                    Traccia Spedizione Cargo
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50 space-y-3">
                <h4 className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">TARIFFE INTERPOLATION GRID</h4>
                <div className="divide-y divide-slate-150 font-mono text-[9.5px] text-slate-600 uppercase">
                  <div className="flex py-2 justify-between">
                    <span>Costo base per Km:</span>
                    <span className="font-bold text-foreground">0.05 EUR</span>
                  </div>
                  <div className="flex py-2 justify-between">
                    <span>Fattore Sicurezza:</span>
                    <span className="font-bold text-foreground">LIVELLO 3 (BLINDATO)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Map Container */}
        <div className="flex-1 relative h-full min-h-[300px]">
          <MapContainer center={center} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
            <ChangeView center={center} />
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
        </div>

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
