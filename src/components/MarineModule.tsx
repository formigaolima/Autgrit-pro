import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ship, Navigation, X, ShieldCheck, Zap, User, Compass, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getShipIcon = (rotation: number) => {
  return L.divIcon({
    html: `<div class="bg-cyan-500 text-white rounded-lg p-2 border-2 border-white shadow-xl transition-all duration-1000 ease-linear flex items-center justify-center" style="transform: rotate(${rotation}deg); filter: drop-shadow(0 0 6px rgba(6,182,212,0.7));">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21h20"></path><path d="M19.3 14.8C21.1 13.5 22 11.7 22 10c0-3.5-3-6-7-6F10.3 5.3 9 7.5 9 10c0 1.7.9 3.5 2.7 4.8L2 19h20l-2.7-4.2z"></path><path d="M14 4v3"></path></svg>
           </div>`,
    className: 'ship-map-icon',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

interface MarineUnit {
  id: string;
  position: [number, number];
  rotation: number;
  label: string;
  type: 'Executive Luxury Yacht' | 'Sailing Vessel' | 'Interceptor Speedboat';
  captain: string;
  depth: string;
  speedKnots: string;
  eta: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export const MarineModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [center, setCenter] = useState<[number, number]>([-23.5505, -46.6333]); // Default São Paulo
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<MarineUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<MarineUnit | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'requesting' | 'handshake' | 'confirmed'>('idle');

  useEffect(() => {
    const handleGeo = (position: any) => {
      const { latitude, longitude } = position.coords;
      const userPos: [number, number] = [latitude, longitude];
      setCenter(userPos);
      setUnits([
        { id: 'SHIP-01', position: [latitude + 0.002, longitude - 0.004], rotation: 90, label: 'AZIMUT 60 LUXURY', type: 'Executive Luxury Yacht', captain: 'Mateo Salvadore (Oceanic Master)', depth: '18m', speedKnots: '22 kts', eta: '6m' },
        { id: 'SHIP-02', position: [latitude - 0.003, longitude + 0.004], rotation: 180, label: 'BENETEAU OCEANIS', type: 'Sailing Vessel', captain: 'Captain Clara Smith (Dual Nav-Master)', depth: '8m', speedKnots: '9 kts', eta: '14m' },
        { id: 'SHIP-03', position: [latitude + 0.004, longitude + 0.003], rotation: 270, label: 'COUGAR HIGH-SPEED', type: 'Interceptor Speedboat', captain: 'Lucas Barbosa (All-vessel certified)', depth: '3m', speedKnots: '45 kts', eta: '4m' },
      ]);
      setLoading(false);
    };

    const handleErr = () => {
      const defaultCenter: [number, number] = [-23.5505, -46.6333];
      setCenter(defaultCenter);
      setUnits([
        { id: 'SHIP-01', position: [defaultCenter[0] + 0.002, defaultCenter[1] - 0.004], rotation: 90, label: 'AZIMUT 60 LUXURY', type: 'Executive Luxury Yacht', captain: 'Mateo Salvadore (Oceanic Master)', depth: '18m', speedKnots: '22 kts', eta: '6m' },
        { id: 'SHIP-02', position: [defaultCenter[0] - 0.003, defaultCenter[1] + 0.004], rotation: 180, label: 'BENETEAU OCEANIS', type: 'Sailing Vessel', captain: 'Captain Clara Smith (Dual Nav-Master)', depth: '8m', speedKnots: '9 kts', eta: '14m' },
        { id: 'SHIP-03', position: [defaultCenter[0] + 0.004, defaultCenter[1] + 0.003], rotation: 270, label: 'COUGAR HIGH-SPEED', type: 'Interceptor Speedboat', captain: 'Lucas Barbosa (All-vessel certified)', depth: '3m', speedKnots: '45 kts', eta: '4m' },
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
        position: [u.position[0] + (Math.random() - 0.5) * 0.0003, u.position[1] + (Math.random() - 0.5) * 0.0003],
        rotation: u.rotation + (Math.random() - 0.5) * 6
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [units.length]);

  const handleBookService = (unit: MarineUnit) => {
    setSelectedUnit(unit);
    setRequestStatus('requesting');
    setTimeout(() => {
      setRequestStatus('handshake');
      setTimeout(() => {
        setRequestStatus('confirmed');
      }, 2000);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-white flex flex-col md:flex-row text-slate-800"
    >
      {/* Sidebar with boat types, fleet, captains detailed info */}
      <div className="w-full md:w-[450px] bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col z-20">
        <div className="p-6 border-b border-secondary/10 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 bg-cyan-550/10 border border-cyan-200 text-cyan-600 flex items-center justify-center rounded">
                <Ship className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm md:text-base font-heading font-bold uppercase tracking-[0.2em] text-foreground">
                  NAUTICAL_GRID & HUBER
                </h2>
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                  Barche e Marinai Certificati AutGrit
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-50 border border-slate-100 rounded transition-colors text-slate-400 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {requestStatus === 'idle' ? (
            <>
              <div className="p-4 bg-cyan-50 border border-cyan-100 flex items-start gap-3 rounded-lg">
                <Anchor className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-800">NAVIGAZIONE MARITTIMA INTEGRATA</h4>
                  <p className="text-[10.5px] text-cyan-700 leading-relaxed mt-1 font-medium">
                    Piattaforma protetta per prenotare imbarcazioni di ogni classe con capitani abilitati e marinai professionisti pronti per qualsiasi imbarcazione.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 font-extrabold">IMBARCAZIONI DISPONIBILI</h3>
                <div className="space-y-3">
                  {units.map((unit) => (
                    <div 
                      key={unit.id}
                      className="p-4 border border-slate-150 hover:border-cyan-300 rounded-xl bg-white hover:bg-cyan-50/10 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-heading font-extrabold uppercase text-foreground group-hover:text-cyan-600 transition-colors">
                            {unit.label}
                          </p>
                          <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                            ID: {unit.id} • {unit.type}
                          </p>
                        </div>
                        <span className="text-[9.5px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                          {unit.eta} ETA
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-slate-50 rounded-lg text-[9px] font-mono">
                        <div>
                          <span className="text-slate-400 block uppercase">Pescaggio</span>
                          <span className="text-slate-700 font-bold">{unit.depth}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase">Nodi Velocità</span>
                          <span className="text-slate-700 font-bold">{unit.speedKnots}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 mt-3 border-t border-slate-100 pt-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <User className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-slate-450 uppercase tracking-wide">Capitano / Marinaio</p>
                          <p className="text-[10px] text-slate-700 font-bold font-mono truncate">{unit.captain}</p>
                        </div>
                        <Button 
                          onClick={() => handleBookService(unit)}
                          className="h-8 bg-cyan-500 hover:bg-cyan-600 text-white uppercase text-[8px] font-mono font-bold px-3 shrink-0 shadow-sm"
                        >
                          Assegna Marinaio
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="geometric-card bg-slate-900 border-cyan-500/30 p-6 text-white text-center relative overflow-hidden">
                <div className="corner-accent border-cyan-450" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:12px_12px]" />

                {requestStatus === 'requesting' && (
                  <>
                    <div className="w-14 h-14 border-2 border-cyan-500 border-t-transparent animate-spin rounded-full mx-auto mb-6" />
                    <h4 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">SYS_MARINE_COORDINATE</h4>
                    <h3 className="text-base font-heading font-semibold mt-1">Sincronizzazione della rotta nautica...</h3>
                    <p className="text-[9px] text-slate-400 font-mono mt-3 uppercase tracking-wider">
                      Generazione coordinate idrografiche. Controllo canale in corso per {selectedUnit?.label}.
                    </p>
                  </>
                )}

                {requestStatus === 'handshake' && (
                  <>
                    <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center mx-auto mb-6 rounded-full">
                      <Zap className="w-8 h-8 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-mono font-bold tracking-widest text-primary uppercase">SECURITY_SECURE_LINK</h4>
                    <h3 className="text-base font-heading font-semibold mt-1">Uplink marittimo stabilito!</h3>
                    <p className="text-[9px] text-slate-400 font-mono mt-3 uppercase tracking-wider">
                      Handshake della licenza di capitaneria di porto L0. Rotte oceanografiche calcolate.
                    </p>
                  </>
                )}

                {requestStatus === 'confirmed' && (
                  <>
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 rounded-lg">
                      <ShieldCheck className="w-8 h-8 fill-current" />
                    </div>
                    <h4 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">SHIP_AUTHORIZED_OK</h4>
                    <h3 className="text-base font-heading font-semibold mt-1">Capitano e Barca Assegnati!</h3>
                    <p className="text-[9px] text-emerald-300 font-mono mt-3 uppercase tracking-wider">
                      Il marinaio {selectedUnit?.captain} è a bordo. Pronto a salpare su qualsiasi categoria di scafo con equipaggio.
                    </p>
                  </>
                )}
              </div>

              {selectedUnit && (
                <div className="border border-slate-150 rounded-xl overflow-hidden text-xs">
                  <div className="p-3 bg-slate-50 border-b border-slate-150 font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                    DETTAGLI IMBARCAZIONE
                  </div>
                  <div className="divide-y divide-slate-150 font-mono text-[10px] uppercase">
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Scafo / Barca:</span>
                      <span className="text-slate-800 font-bold">{selectedUnit.label}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Categoria:</span>
                      <span className="text-cyan-600 font-medium">{selectedUnit.type}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Capitano Abilitato:</span>
                      <span className="text-slate-700 font-bold">{selectedUnit.captain}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Canale Pescaggio:</span>
                      <span className="text-slate-800 font-bold">{selectedUnit.depth}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Andatura crociera:</span>
                      <span className="text-slate-800 font-bold">{selectedUnit.speedKnots}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline"
                  onClick={() => setRequestStatus('idle')}
                  className="flex-1 h-11 uppercase font-mono tracking-wider text-[9px] border-slate-200 text-slate-400 font-bold"
                >
                  Indietro
                </Button>
                {requestStatus === 'confirmed' && (
                  <Button
                    onClick={onClose}
                    className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white uppercase font-mono tracking-wider text-[9px]"
                  >
                    Mappa Principale
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 hidden md:block text-[9.5px] font-mono tracking-wide text-slate-400 font-bold">
          CONNETTIVITÀ PORTUALE: <span className="text-primary">M_ACTIVE_L0</span>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-1 relative bg-slate-50 min-h-[300px] md:min-h-0 w-full">
        {loading ? (
          <div className="absolute inset-0 z-[2000] bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin rounded-full mb-3" />
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Querying Marine GPS Stream...</p>
          </div>
        ) : null}

        <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 z-[2000] w-11 h-11 bg-white border border-slate-200 shadow-lg items-center justify-center hover:bg-slate-50 transition-colors rounded-lg">
          <X className="w-5 h-5 text-slate-400 font-bold" />
        </button>

        <MapContainer center={center} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <ChangeView center={center} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {units.map((unit) => (
            <Marker key={unit.id} position={unit.position} icon={getShipIcon(unit.rotation)}>
              <Popup>
                <div className="p-3 font-mono text-[10px] uppercase min-w-[200px] bg-white">
                  <p className="font-bold text-xs text-cyan-600">{unit.label}</p>
                  <p className="text-slate-400 mt-0.5">{unit.type}</p>
                  <div className="mt-2.5 border-t border-slate-100 pt-2 space-y-1">
                    <p className="text-slate-500 text-[9px]">PESCAGGIO: {unit.depth}</p>
                    <p className="text-slate-500 text-[9px]">VELOCITÀ: {unit.speedKnots}</p>
                    <p className="text-slate-500 text-[9px]">CAPITANO: {unit.captain}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
};
