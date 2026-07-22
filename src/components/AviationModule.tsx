import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane, Navigation, X, ShieldCheck, Zap, User, Compass, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getPlaneIcon = (rotation: number) => {
  return L.divIcon({
    html: `<div class="bg-sky-500 text-white rounded-lg p-2 border-2 border-white shadow-xl transition-all duration-1000 ease-linear flex items-center justify-center" style="transform: rotate(${rotation}deg); filter: drop-shadow(0 0 6px rgba(14,165,233,0.7));">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.9.1-2.4.9l-.5.7c-.2.3-.2.8.1 1.1l7 4-5.5 5.5-2-.5c-.4-.1-.8.1-1 .4l-.5.5c-.3.3-.2.8.1 1.1l2.5 1.5 1.5 2.5c.3.3.8.4 1.1.1l.5-.5c.3-.2.4-.6.4-1l-.5-2 5.5-5.5 4 7c.3.3.8.3 1.1.1l.7-.5c.8-.5 1.1-1.5.9-2.4z"></path></svg>
           </div>`,
    className: 'plane-map-icon',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

interface AviationUnit {
  id: string;
  position: [number, number];
  rotation: number;
  label: string;
  type: 'eVTOL Helicopter' | 'Jet Interceptor' | 'Light Aircraft';
  pilot: string;
  altitude: string;
  speed: string;
  eta: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export const AviationModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [center, setCenter] = useState<[number, number]>([-23.5505, -46.6333]); // Default São Paulo
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<AviationUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<AviationUnit | null>(null);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'requesting' | 'comms_link' | 'confirmed'>('idle');
  const [roleMode, setRoleMode] = useState<'cliente' | 'lavoratore'>('cliente');
  const [pilotStatus, setPilotStatus] = useState<string>('Disponibile per Turno');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleGeo = (position: any) => {
      const { latitude, longitude } = position.coords;
      const userPos: [number, number] = [latitude, longitude];
      setCenter(userPos);
      setUnits([
        { id: 'EVTOL-01', position: [latitude + 0.003, longitude + 0.003], rotation: 120, label: 'E-HELICOPTER ALPHA', type: 'eVTOL Helicopter', pilot: 'Sarah Jenkins (ATPL certified)', altitude: '1,400 ft', speed: '180 km/h', eta: '5m' },
        { id: 'JET-02', position: [latitude - 0.004, longitude + 0.006], rotation: 240, label: 'LUCID URBAN COUPE', type: 'Light Aircraft', pilot: 'Roberto Da Silva (Commercial Pilot)', altitude: '2,800 ft', speed: '320 km/h', eta: '11m' },
        { id: 'EVTOL-03', position: [latitude + 0.005, longitude - 0.004], rotation: 45, label: 'ENCLAVE JETSTREAM', type: 'eVTOL Helicopter', pilot: 'Lucas B. (Emergency Transport)', altitude: '950 ft', speed: '195 km/h', eta: '8m' },
      ]);
      setLoading(false);
    };

    const handleErr = () => {
      const defaultCenter: [number, number] = [-23.5505, -46.6333];
      setCenter(defaultCenter);
      setUnits([
        { id: 'EVTOL-01', position: [defaultCenter[0] + 0.003, defaultCenter[1] + 0.003], rotation: 120, label: 'E-HELICOPTER ALPHA', type: 'eVTOL Helicopter', pilot: 'Sarah Jenkins (ATPL certified)', altitude: '1,400 ft', speed: '180 km/h', eta: '5m' },
        { id: 'JET-02', position: [defaultCenter[0] - 0.004, defaultCenter[1] + 0.006], rotation: 240, label: 'LUCID URBAN COUPE', type: 'Light Aircraft', pilot: 'Roberto Da Silva (Commercial Pilot)', altitude: '2,800 ft', speed: '320 km/h', eta: '11m' },
        { id: 'EVTOL-03', position: [defaultCenter[0] + 0.005, defaultCenter[1] - 0.004], rotation: 45, label: 'ENCLAVE JETSTREAM', type: 'eVTOL Helicopter', pilot: 'Lucas B. (Emergency Transport)', altitude: '950 ft', speed: '195 km/h', eta: '8m' },
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
        position: [u.position[0] + (Math.random() - 0.5) * 0.0004, u.position[1] + (Math.random() - 0.5) * 0.0004],
        rotation: u.rotation + (Math.random() - 0.5) * 8
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [units.length]);

  const handleBookService = (unit: AviationUnit) => {
    setSelectedUnit(unit);
    setRequestStatus('requesting');
    setTimeout(() => {
      setRequestStatus('comms_link');
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
      {/* Sidebar with bookings, pilots, helicopters detailed info */}
      <div className="w-full md:w-[450px] bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col z-20">
        <div className="p-6 border-b border-secondary/10 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 bg-sky-550/10 border border-sky-200 text-sky-600 flex items-center justify-center rounded">
                <Plane className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm md:text-base font-heading font-bold uppercase tracking-[0.2em] text-foreground">
                  AERO_DEPLOYER & eVTOL
                </h2>
                <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                  Helicotteri ed Aerei di Sicurezza AutGrit
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-50 border border-slate-100 rounded transition-colors text-slate-400 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Due Tasti di Ruolo: Cliente e Conducente / Pilota */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setRoleMode('cliente');
                setRequestStatus('idle');
              }}
              className={`py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                roleMode === 'cliente'
                  ? 'bg-sky-500 text-white shadow-sm font-extrabold'
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
                  ? 'bg-sky-500 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 bg-transparent'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Conducenti / Piloti
            </button>
          </div>

          {roleMode === 'lavoratore' ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="p-4 bg-slate-900 text-white border border-sky-500/30 rounded-xl space-y-3 relative overflow-hidden">
                <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h4 className="text-[10px] font-mono tracking-widest text-sky-450 uppercase font-bold">TERMINALE PILOTA eVTOL</h4>
                <p className="text-xs font-bold font-mono">STATO OPERATIVO: <span className="text-emerald-450 uppercase">{pilotStatus}</span></p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-relaxed">
                  Collega il tuo velivolo alla duna centrale dei dividendi Adyen Split. Il 90% di ogni volo prenotato dai clienti verrà liquidato direttamente nel tuo wallet di prestatore d'opera.
                </p>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => {
                      setPilotStatus('In Volo / Attivo');
                      setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] PING_RADAR: Segnale GPS trasmesso con successo.`, ...prev]);
                    }}
                    className="h-8 text-[8.5px] bg-sky-500 text-white hover:bg-sky-600 uppercase tracking-wider font-extrabold flex-1 cursor-pointer"
                  >
                    Trasmetti GPS
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPilotStatus('Disponibile per Turno');
                      setTelemetryLogs(prev => [`[${new Date().toLocaleTimeString()}] SYSTEM_OK: Stato pronto ripristinato.`, ...prev]);
                    }}
                    className="h-8 text-[8.5px] border-white/20 text-slate-350 hover:bg-white/10 hover:text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer"
                  >
                    Pronto a Volare
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-slate-150 rounded-xl bg-slate-50 space-y-3">
                <h4 className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">CONTO ADYEN SPLIT REGISTRY</h4>
                <div className="divide-y divide-slate-150 font-mono text-[10px]">
                  <div className="flex py-2 justify-between items-center text-slate-600">
                    <span className="font-bold uppercase">Sub-ID:</span>
                    <span className="text-slate-800 font-bold">SUB_ADY_8291_PASS</span>
                  </div>
                  <div className="flex py-2 justify-between items-center text-slate-650">
                    <span className="font-bold uppercase">Split quota conduttore:</span>
                    <span className="text-emerald-600 font-bold">90%</span>
                  </div>
                  <div className="flex py-2 justify-between items-center text-slate-650">
                    <span className="font-bold uppercase">Procedura Compliance:</span>
                    <span className="text-emerald-600 font-bold font-mono">CONCORDE_L0_COMPLIANT</span>
                  </div>
                </div>
              </div>

              {telemetryLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-extrabold font-bold">LOGS ATTIVITÀ PILOTA</h4>
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 h-28 overflow-y-auto space-y-1">
                    {telemetryLogs.map((log, index) => (
                      <p key={index} className="text-[8.5px] font-mono text-slate-600 truncate uppercase">{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : requestStatus === 'idle' ? (
            <>
              <div className="p-4 bg-sky-50 border border-sky-100 flex items-start gap-3 rounded-lg">
                <Wind className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-800">NAVIGAZIONE AEREA TATTICA</h4>
                  <p className="text-[10.5px] text-sky-700 leading-relaxed mt-1 font-medium">
                    Servizi premium di voli in elicottero elettrico eVTOL e jet privati con piloti certificati ATPL. Handshake automatico di sicurezza.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">VEICOLI NELLE VICINANZE</h3>
                <div className="space-y-3">
                  {units.map((unit) => (
                    <div 
                      key={unit.id}
                      className="p-4 border border-slate-150 hover:border-sky-300 rounded-xl bg-white hover:bg-sky-50/10 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-heading font-extrabold uppercase text-foreground group-hover:text-sky-600 transition-colors">
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
                          <span className="text-slate-400 block uppercase">Quota Vola</span>
                          <span className="text-slate-700 font-bold">{unit.altitude}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase">Velocità</span>
                          <span className="text-slate-700 font-bold">{unit.speed}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 mt-3 border-t border-slate-100 pt-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <User className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-slate-450 uppercase tracking-wide">Pilota Assegnato</p>
                          <p className="text-[10px] text-slate-700 font-bold font-mono truncate">{unit.pilot}</p>
                        </div>
                        <Button 
                          onClick={() => handleBookService(unit)}
                          className="h-8 bg-sky-500 hover:bg-sky-600 text-white uppercase text-[8px] font-mono font-bold px-3 shrink-0 shadow-sm"
                        >
                          Seleziona Flight
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
              <div className="geometric-card bg-slate-900 border-sky-500/30 p-6 text-white text-center relative overflow-hidden">
                <div className="corner-accent border-sky-450" />
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:12px_12px]" />

                {requestStatus === 'requesting' && (
                  <>
                    <div className="w-14 h-14 border-2 border-sky-500 border-t-transparent animate-spin rounded-full mx-auto mb-6" />
                    <h4 className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">TELEMETRIA_AIR_SYNCH</h4>
                    <h3 className="text-base font-heading font-semibold mt-1">Sincronizzazione della rotta eVTOL e piloti...</h3>
                    <p className="text-[9px] text-slate-400 font-mono mt-3 uppercase tracking-wider">
                      Generazione traccia radar 3D. Controllo radar in corso per {selectedUnit?.label}.
                    </p>
                  </>
                )}

                {requestStatus === 'comms_link' && (
                  <>
                    <div className="w-14 h-14 bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center mx-auto mb-6 rounded-full">
                      <Zap className="w-8 h-8 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-mono font-bold tracking-widest text-primary uppercase">SECURITY_SECURE_LINK</h4>
                    <h3 className="text-base font-heading font-semibold mt-1">Uplink di volo protetto stabilito!</h3>
                    <p className="text-[9px] text-slate-400 font-mono mt-3 uppercase tracking-wider">
                      Stabilizzazione certificato crittografico L0. Autorizzazione ATC completata.
                    </p>
                  </>
                )}

                {requestStatus === 'confirmed' && (
                  <>
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 rounded-lg">
                      <ShieldCheck className="w-8 h-8 fill-current" />
                    </div>
                    <h4 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">FLIGHT_AUTHORIZED_OK</h4>
                    <h3 className="text-base font-heading font-semibold mt-1">Pilota e Volo Convocati!</h3>
                    <p className="text-[9px] text-emerald-300 font-mono mt-3 uppercase tracking-wider">
                      {selectedUnit?.pilot} sta riscaldando i rotori dell'eVTOL. Decollo stimato tra 3m. ID: {selectedUnit?.id}.
                    </p>
                  </>
                )}
              </div>

              {selectedUnit && (
                <div className="border border-slate-150 rounded-xl overflow-hidden text-xs">
                  <div className="p-3 bg-slate-50 border-b border-slate-150 font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                    RIEPILOGO DECOLLO
                  </div>
                  <div className="divide-y divide-slate-150 font-mono text-[10px] uppercase">
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Unità Volativa:</span>
                      <span className="text-slate-800 font-bold">{selectedUnit.label}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Classificazione:</span>
                      <span className="text-sky-600 font-medium">{selectedUnit.type}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Pilota in Comando:</span>
                      <span className="text-slate-700 font-bold">{selectedUnit.pilot}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Quota Operativa:</span>
                      <span className="text-slate-800 font-bold">{selectedUnit.altitude}</span>
                    </div>
                    <div className="flex p-3 justify-between items-center bg-white">
                      <span className="text-slate-400 font-bold">Airspeed:</span>
                      <span className="text-slate-800 font-bold">{selectedUnit.speed}</span>
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
          CONNETTIVITÀ ATC: <span className="text-primary">F_ACTIVE_L0</span>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-1 relative bg-slate-50 min-h-[300px] md:min-h-0 w-full">
        {loading ? (
          <div className="absolute inset-0 z-[2000] bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent animate-spin rounded-full mb-3" />
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Querying Aviation GPS Coordinate Stream...</p>
          </div>
        ) : null}

        <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 z-[2000] w-11 h-11 bg-white border border-slate-200 shadow-lg items-center justify-center hover:bg-slate-50 transition-colors rounded-lg">
          <X className="w-5 h-5 text-slate-400 font-bold" />
        </button>

        <MapContainer center={center} zoom={14} className="h-full w-full" zoomControl={false} attributionControl={false}>
          <ChangeView center={center} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          {units.map((unit) => (
            <Marker key={unit.id} position={unit.position} icon={getPlaneIcon(unit.rotation)}>
              <Popup>
                <div className="p-3 font-mono text-[10px] uppercase min-w-[200px] bg-white">
                  <p className="font-bold text-xs text-sky-600">{unit.label}</p>
                  <p className="text-slate-400 mt-0.5">{unit.type}</p>
                  <div className="mt-2.5 border-t border-slate-100 pt-2 space-y-1">
                    <p className="text-slate-500 text-[9px]">ALTITUDINE: {unit.altitude}</p>
                    <p className="text-slate-500 text-[9px]">PILOTA: {unit.pilot}</p>
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
