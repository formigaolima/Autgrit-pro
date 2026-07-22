import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Send, 
  Download, 
  X, 
  Zap, 
  ShieldCheck, 
  History,
  ArrowRight,
  RefreshCw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  FileText,
  Hash,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  CircleDollarSign,
  Compass,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'dividend';
  amount: string;
  asset: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  address: string;
  hash: string;
  gasPrice: string;
  blockNumber: string;
  commissionDetail?: string;
}

// Global baseline history log which builds upon custom user splits
const BASE_HISTORY: Transaction[] = [
  { 
    id: 'tx1', 
    type: 'send', 
    amount: '0.045', 
    asset: 'ETH', 
    status: 'confirmed', 
    timestamp: '2026-06-12T14:22:00Z', 
    address: '0x71...F23A',
    hash: '0x8f2...e4a1',
    gasPrice: '24 Gwei',
    blockNumber: '19,456,221'
  },
  { 
    id: 'tx2', 
    type: 'receive', 
    amount: '120.00', 
    asset: 'EUR', 
    status: 'confirmed', 
    timestamp: '2026-06-11T09:12:00Z', 
    address: '0x22...E89B',
    hash: '0x3d4...b9c0',
    gasPrice: '18 Gwei',
    blockNumber: '19,451,004',
    commissionDetail: 'Platform fee split: 15% (€18.00) / Driver: 85% (€102.00)'
  },
  { 
    id: 'tx3', 
    type: 'send', 
    amount: '0.005', 
    asset: 'BTC', 
    status: 'pending', 
    timestamp: '2026-06-12T23:55:00Z', 
    address: 'bc1q...x9p2',
    hash: '0x1a2...f5d6',
    gasPrice: 'N/A',
    blockNumber: 'Pending'
  },
];

// Configurazione della Cerca Centrale (HQ)
const HQ_COORDINATES = {
  latitude: 44.5457,
  longitude: 7.7169,
  address: "Via Bordighera 5, 12045 Fossano (CN), Piemonte, Italy"
};

// CONFIGURAZIONE CONTO PIATTAFORMA (Ricezione Percentuali/Royalty)
const PLATFORM_WALLET_CONFIG = {
  accountId: "5229434580617780", // Il tuo conto per lo split delle transazioni
  defaultFeePercentage: 0.10,     // Esempio: 10% di commissione su ogni transazione
  supportedCurrencies: {
    fiat: ["EUR", "USD"],
    crypto: ["USDT", "ETH", "BTC"]
  }
};

/**
 * Formula di Haversine per misurare la distanza dal Fossano HQ
 */
function calculateHaversineDistance(
  coords1: { latitude: number; longitude: number }, 
  coords2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Raggio della terra in metri
  const phi1 = (coords1.latitude * Math.PI) / 180;
  const phi2 = (coords2.latitude * Math.PI) / 180;
  const deltaPhi = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
  const deltaLambda = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifica se un dispositivo è nel raggio geofencing di 50 km (50000 m)
 */
function verifyGeofenceStatus(
  deviceCoords: { latitude: number; longitude: number },
  maxRadiusMeters: number = 50000
) {
  const distance = calculateHaversineDistance(HQ_COORDINATES, deviceCoords);
  const isInside = distance <= maxRadiusMeters;
  return {
    distanceMeters: distance,
    status: (isInside ? "OPERATIVO" : "FUORI_MATRICE") as "OPERATIVO" | "FUORI_MATRICE"
  };
}

export const PaymentModule: React.FC<{ onClose: () => void; balance: { eth: string } }> = ({ onClose, balance }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'splits' | 'send' | 'receive' | 'history'>('overview');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  
  // Real-time parameters to link with legal Compliance Enclave state
  const [providerCompliance, setProviderCompliance] = useState<any | null>(null);
  const [receiverCompliance, setReceiverCompliance] = useState<any | null>(null);
  
  // Adyen Split & PAGO Commission Configurations
  const [commissionRate, setCommissionRate] = useState<number>(10); // Percentage split to platform, default 10% per PLATFORM_WALLET_CONFIG
  const [adyenApiKey, setAdyenApiKey] = useState<string>('AQEU518...ADYN_SBX_342_L0_SECURE');
  const [merchantAccountId, setMerchantAccountId] = useState<string>(PLATFORM_WALLET_CONFIG.accountId);
  
  // Simulation Inputs
  const [simServiceType, setSimServiceType] = useState<'ride' | 'delivery' | 'aviation' | 'marine'>('ride');
  const [simTxAmount, setSimTxAmount] = useState<string>('150.00');
  const [simCurrency, setSimCurrency] = useState<string>('EUR');
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [payoutLogs, setPayoutLogs] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(BASE_HISTORY);

  // GPS Coordinates Telemetry states
  const [deviceLat, setDeviceLat] = useState<string>('44.5457');
  const [deviceLng, setDeviceLng] = useState<string>('7.7169');
  const [geofenceReport, setGeofenceReport] = useState<{ distanceMeters: number; status: "OPERATIVO" | "FUORI_MATRICE" }>({
    distanceMeters: 0,
    status: 'OPERATIVO'
  });

  // Load existing records from database
  useEffect(() => {
    const fetchDbState = async () => {
      try {
        const res = await fetch('/api/database');
        if (res.ok) {
          const dbData = await res.json();
          if (dbData.providerCompliance) {
            setProviderCompliance(dbData.providerCompliance);
          }
          if (dbData.receiverCompliance) {
            setReceiverCompliance(dbData.receiverCompliance);
          }
          if (dbData.splitSettings) {
            setCommissionRate(dbData.splitSettings.commissionRate || 15);
            setMerchantAccountId(dbData.splitSettings.merchantAccountId || 'MC_94812_AUTGRIT_PRO');
          }
        }
      } catch (err) {
        console.error("Failed to sync compliance with payment setup:", err);
      }
    };
    fetchDbState();
  }, [activeTab]);

  // Helper to dynamically update GPS geofence calculations inside the enclave
  const handleCoordinateChange = (latStr: string, lngStr: string) => {
    setDeviceLat(latStr);
    setDeviceLng(lngStr);
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      const report = verifyGeofenceStatus({ latitude: lat, longitude: lng });
      setGeofenceReport(report);
    }
  };

  const getBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleCoordinateChange(lat.toString(), lng.toString());
        },
        (error) => {
          console.error("GPS telemetry error:", error);
          alert("Impossibile rilevare posizione reale. Utilizzare i preset manuali per testare la telemetria.");
        }
      );
    } else {
      alert("Geolocalizzazione non supportata.");
    }
  };

  /**
   * Calcola lo split del pagamento tra il fornitore del servizio e la piattaforma
   */
  const processPlatformSplitPayment = (totalAmount: number, currency: string) => {
    const ucCurrency = currency.toUpperCase();
    const isCrypto = PLATFORM_WALLET_CONFIG.supportedCurrencies.crypto.includes(ucCurrency);
    const isFiat = PLATFORM_WALLET_CONFIG.supportedCurrencies.fiat.includes(ucCurrency);

    if (!isCrypto && !isFiat) {
      return {
        status: "REJECTED",
        reason: "VALUTA_NON_SUPPORTATA"
      };
    }

    const currentFeePct = commissionRate / 100;
    const platformFee = totalAmount * currentFeePct;
    const providerPayout = totalAmount - platformFee;

    return {
      timestamp: new Date().toISOString(),
      gateway: isCrypto ? "LIQ_POOL_ALPHA" : "CORE_GATEWAY_FIAT",
      currencyType: isCrypto ? "CRIPTO" : "VALUTA_FIAT",
      currency: ucCurrency,
      totalTransaction: totalAmount,
      distribution: {
        platformDestination: {
          destinationAccount: merchantAccountId || PLATFORM_WALLET_CONFIG.accountId,
          amountReceived: parseFloat(platformFee.toFixed(isCrypto ? 6 : 2)),
          type: "COMMISSIONE_PIATTAFORMA"
        },
        providerDestination: {
          amountReceived: parseFloat(providerPayout.toFixed(isCrypto ? 6 : 2)),
          type: "COMPENSO_PRESTATORE"
        }
      },
      status: "LIQUIDATO"
    };
  };

  // Execute Simulated Transaction Split using process rules
  const handleExecuteSplitDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(simTxAmount);
    if (isNaN(val) || val <= 0) return;

    setSimLoading(true);
    setSimulationResult(null);

    // Get pilot or sailor or driver assignment details dynamically
    let assignedWorker = "Autista Convogliatore Ride-Line #34";
    let subAccountCode = "SUB_ADY_8291_PASS";
    let targetNode = "URBAN_RIDE_01";

    if (simServiceType === 'aviation') {
      assignedWorker = providerCompliance ? `${providerCompliance.fullName} (Aero Pilot/eVTOL)` : "Pilot Sarah Jenkins (Aero-ATPL)";
      subAccountCode = providerCompliance ? `SUB_ADY_AERO_${providerCompliance.docNumber.replace(/\D/g, '')}` : "SUB_ADY_AERO_9122";
      targetNode = "Aviation & eVTOL Alpha-Copter #01";
    } else if (simServiceType === 'marine') {
      assignedWorker = providerCompliance ? `${providerCompliance.fullName} (Marine Captain)` : "Captain Mateo Salvadore (Oceanic Master)";
      subAccountCode = providerCompliance ? `SUB_ADY_MAR_${providerCompliance.docNumber.replace(/\D/g, '')}` : "SUB_ADY_MAR_3441";
      targetNode = "Marine Azimut Yacht - Captain Leo";
    } else if (simServiceType === 'delivery') {
      assignedWorker = "Corriere Espresso - Enclave Alpha";
      subAccountCode = "SUB_ADY_DELIV_0402";
      targetNode = "Consegna Espressa - Node_0x1";
    }

    // Process split output using standard function
    const splitReport = processPlatformSplitPayment(val, simCurrency);

    if (splitReport.status === "REJECTED") {
      alert(`Operazione fallita: ${splitReport.reason}`);
      setSimLoading(false);
      return;
    }

    setTimeout(async () => {
      const isCrypto = splitReport.currencyType === "CRIPTO";
      const decimals = isCrypto ? 4 : 2;

      const splitReceipt = {
        id: 'ADY-' + Date.now().toString().substring(8),
        total: val.toFixed(decimals),
        rate: commissionRate,
        currency: simCurrency.toUpperCase(),
        platformDeduction: splitReport.distribution?.platformDestination.amountReceived.toFixed(decimals),
        workerPayout: splitReport.distribution?.providerDestination.amountReceived.toFixed(decimals),
        workerName: assignedWorker,
        subAccount: subAccountCode,
        status: 'SUCCESS_SPLIT_SETTLED',
        gateway: splitReport.gateway,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        mockTxHash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...SEC'
      };

      setSimulationResult(splitReceipt);

      // Create a nice transaction in the list
      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        type: 'receive',
        amount: val.toFixed(decimals),
        asset: simCurrency.toUpperCase(),
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        address: subAccountCode,
        hash: splitReceipt.mockTxHash,
        gasPrice: isCrypto ? '18 Gwei' : 'N/A',
        blockNumber: isCrypto ? '19,458,982' : 'N/A',
        commissionDetail: `Adyen split: ${commissionRate}% (${simCurrency.toUpperCase()} ${splitReceipt.platformDeduction}) a PAGO Platform / ${100 - commissionRate}% (${simCurrency.toUpperCase()} ${splitReceipt.workerPayout}) a ${assignedWorker}`
      };

      setTransactions(prev => [newTx, ...prev]);

      // Push logs to database and terminal logs
      try {
        const dbRes = await fetch('/api/database');
        let currentDb: any = {};
        if (dbRes.ok) {
          currentDb = await dbRes.json();
        }

        const logMessage = `ADYEN_SPLIT: [${splitReport.gateway}] Processed platform split. Total: ${val.toFixed(decimals)} ${simCurrency.toUpperCase()}. Rule: ${commissionRate}% Fee (${simCurrency.toUpperCase()} ${splitReceipt.platformDeduction} to ${splitReport.distribution?.platformDestination.destinationAccount}) & ${100 - commissionRate}% (${simCurrency.toUpperCase()} ${splitReceipt.workerPayout} to sub-account ${subAccountCode} / ${assignedWorker}). Status: ${splitReport.status}`;
        
        await fetch('/api/database/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...currentDb,
            splitSettings: {
              commissionRate,
              merchantAccountId
            },
            terminalLogs: [
              ...(currentDb.terminalLogs || []),
              {
                id: 'PAY-' + Date.now(),
                type: 'SEC',
                message: logMessage,
                timestamp: new Date().toLocaleTimeString('pt-BR')
              }
            ]
          })
        });
      } catch (err) {
        console.error("Failed to commit split log in backend database:", err);
      }

      setSimLoading(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center p-0 sm:p-6 md:p-8 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="geometric-card w-full max-w-5xl bg-white border-primary/20 flex flex-col h-full sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl text-slate-800"
      >
        <div className="corner-accent border-primary/40" />
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-lg">
                <CreditCard className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-sm md:text-base font-heading font-bold text-foreground uppercase tracking-[0.25em]">
                  PAGO_TERMINAL_V1 (NODE_0x6)
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-mono">
                  Gestione unificata e sicura di pagamenti e asset • Split payment Adyen
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border border-slate-150 flex items-center justify-center hover:bg-slate-100 transition-colors rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
          {/* Internal Navigation */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-5 flex flex-row md:flex-col gap-1.5 bg-slate-50/35 overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'overview', icon: Zap, label: 'Overview Balance' },
              { id: 'splits', icon: Sliders, label: 'Adyen Split Pay' },
              { id: 'send', icon: Send, label: 'Invia Fondi' },
              { id: 'receive', icon: Download, label: 'Ricevi Fondi' },
              { id: 'history', icon: History, label: 'Registro Split Logs' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 md:p-3 text-[10px] uppercase font-mono tracking-wider transition-all rounded-lg font-bold shrink-0 ${
                  activeTab === tab.id 
                    ? 'text-primary bg-primary/5 border border-primary/20 shadow-sm font-extrabold' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto no-scrollbar bg-white">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="geometric-card bg-slate-900 text-white border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
                      <div className="corner-accent border-primary/40" />
                      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#12c2e9_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Portafoglio Operativo PAGO</p>
                        <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold">
                          Attivo
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-heading font-extrabold text-white tracking-tighter">
                        {balance.eth} <span className="text-base text-primary font-mono font-bold">ETH</span>
                      </h3>
                      
                      <div className="flex gap-2">
                        <Button className="h-9 text-[9px] uppercase tracking-widest px-4 font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25">Preleva dividendo</Button>
                        <Button variant="outline" className="h-9 text-[9px] uppercase tracking-widest px-4 border-white/10 text-white hover:bg-white/5">Deposita Liquide</Button>
                      </div>
                    </div>

                    <div className="geometric-card border-slate-150 bg-slate-50 p-6 flex flex-col justify-between relative shadow-sm">
                      <RefreshCw className="absolute top-4 right-4 w-4 h-4 text-slate-350 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Dividendi Piattaforma (Commissioni Adyen)</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">€1,482.90</h3>
                        <p className="text-[9px] text-emerald-600 mt-2 font-mono uppercase font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Split automatici attivi sul conto
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard dynamic charts / assets allocation */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nodi di Servizio Connessi a PAGO</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Uber Ride Booking Node link status */}
                      <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] font-bold uppercase text-slate-705">Node_0x3 Ride Hailing</span>
                          <span className="text-[8.5px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold uppercase">Sincronizzato</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-450 border-t border-slate-100 pt-2.5">
                          <span>REGOLA SPLIT:</span>
                          <span className="text-slate-700 font-bold">{commissionRate}% piattaforma / {100-commissionRate}% autista</span>
                        </div>
                      </div>

                      {/* Aviation Helicopter Pilot Node status */}
                      <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] font-bold uppercase text-slate-705">Aviation & eVTOL Alpha</span>
                          {providerCompliance ? (
                            <span className="text-[8.5px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold uppercase">Abilitato Adyen Sub-Acc</span>
                          ) : (
                            <span className="text-[8.5px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-mono font-bold uppercase">Richiede Compliance L0</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-450 border-t border-slate-100 pt-2.5">
                          <span>REGOLA SPLIT:</span>
                          <span className="text-slate-700 font-bold">{commissionRate}% piattaforma / {100-commissionRate}% pilota</span>
                        </div>
                      </div>

                      {/* Marine & Captain ship Node status */}
                      <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] font-bold uppercase text-slate-705">Marine & Captains Delta</span>
                          {providerCompliance ? (
                            <span className="text-[8.5px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold uppercase">Abilitato Adyen Sub-Acc</span>
                          ) : (
                            <span className="text-[8.5px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-mono font-bold uppercase">Richiede Compliance L0</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-450 border-t border-slate-100 pt-2.5">
                          <span>REGOLA SPLIT:</span>
                          <span className="text-slate-700 font-bold">{commissionRate}% piattaforma / {100-commissionRate}% marinaio</span>
                        </div>
                      </div>

                      {/* Express delivery cargo link status */}
                      <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10.5px] font-bold uppercase text-slate-705">Node_0x1 Delivery Cargo</span>
                          <span className="text-[8.5px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold uppercase">Sincronizzato</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-450 border-t border-slate-100 pt-2.5">
                          <span>REGOLA SPLIT:</span>
                          <span className="text-slate-700 font-bold">{commissionRate}% piattaforma / {100-commissionRate}% corriere</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SISTEMA DI RELE RETE ED HQ GEOFENCE MONITOR */}
                  <div className="p-5 border border-slate-150 rounded-xl bg-slate-50 relative overflow-hidden space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="w-5 h-5 text-primary" />
                        <h4 className="text-[10.1px] font-bold text-slate-800 uppercase tracking-wider">SISTEMA DI CERCA ADAPTADA & GPS TELEMETRIA</h4>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold text-white transition-colors duration-300 ${
                        geofenceReport.status === 'OPERATIVO' ? 'bg-emerald-500' : 'bg-red-500 border border-red-650'
                      }`}>
                         {geofenceReport.status}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-500 font-mono leading-relaxed uppercase">
                      Centrale HQ: {HQ_COORDINATES.address} (Coords: {HQ_COORDINATES.latitude}, {HQ_COORDINATES.longitude})
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-mono uppercase tracking-widest text-slate-450 mb-1 font-bold">Latitudine Dispositivo</label>
                        <input
                          type="text"
                          value={deviceLat}
                          onChange={(e) => handleCoordinateChange(e.target.value, deviceLng)}
                          className="w-full bg-white border border-slate-200 p-2 text-xs font-mono font-bold text-slate-700 rounded-lg outline-none focus:border-primary"
                          placeholder="EX: 44.5457"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono uppercase tracking-widest text-slate-450 mb-1 font-bold">Longitudine Dispositivo</label>
                        <input
                          type="text"
                          value={deviceLng}
                          onChange={(e) => handleCoordinateChange(deviceLat, e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2 text-xs font-mono font-bold text-slate-700 rounded-lg outline-none focus:border-primary"
                          placeholder="EX: 7.7169"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-100 rounded-lg flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-slate-450 uppercase">Distanza da Fossano HQ:</span>
                      <span className="text-slate-800 uppercase">
                        {(geofenceReport.distanceMeters / 1000).toFixed(2)} KM ({(geofenceReport.distanceMeters).toFixed(0)} metri)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button 
                        size="sm"
                        variant="outline"
                        type="button" 
                        onClick={() => handleCoordinateChange('44.5457', '7.7169')}
                        className="h-8 text-[8px] text-slate-600 uppercase tracking-widest font-extrabold cursor-pointer hover:bg-slate-100"
                      >
                        Centra su Fossano HQ (Dentro)
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        type="button" 
                        onClick={() => handleCoordinateChange('45.0703', '7.6869')}
                        className="h-8 text-[8px] text-slate-600 uppercase tracking-widest font-extrabold cursor-pointer hover:bg-slate-100"
                      >
                        Assetta Torino (Fuori Geofence)
                      </Button>
                      <Button 
                        size="sm"
                        type="button" 
                        onClick={getBrowserLocation}
                        className="h-8 text-[8px] bg-primary text-white hover:bg-primary/90 uppercase tracking-widest font-extrabold cursor-pointer"
                      >
                        Sincronizza GPS Dispositivo
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'splits' && (
                <motion.div
                  key="splits"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-850">REGOLA SPLIT DI PAGAMENTI ADYEN MARKETPLACE</h4>
                      <p className="text-[10.5px] text-sky-700 leading-relaxed mt-1">
                        Definisci la percentuale che trattieni come dividendo per ogni transazione completata sulla piattaforma. I fondi rimanenti vengono depositati in tempo reale sui sub-account bancari dei lavoratori. Il sistema monitora costantemente i nodi e previene transazioni se i lavoratori non hanno completato la compliance di sicurezza.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Setup / Commission Control Card */}
                    <div className="space-y-6">
                      <div className="p-5 border border-slate-150 rounded-xl bg-slate-50/50 space-y-5">
                        <h3 className="text-xs font-heading font-extrabold uppercase text-slate-800 tracking-wider">
                          Parametri Configurazione Split
                        </h3>

                        <div className="space-y-2">
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                            Adyen Merchant ID
                          </label>
                          <input
                            type="text"
                            value={merchantAccountId}
                            onChange={(e) => setMerchantAccountId(e.target.value.toUpperCase())}
                            className="w-full bg-white border border-slate-200 p-3 text-xs font-mono outline-none focus:border-primary transition-colors text-foreground font-bold rounded-lg uppercase"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold flex justify-between">
                            <span>Saggio di Commissione Trattenuta (Socio)</span>
                            <span className="text-primary font-extrabold">{commissionRate}%</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="1"
                              max="40"
                              value={commissionRate}
                              onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <span className="text-xs font-mono bg-white border border-slate-200 p-1.5 px-3 rounded font-bold text-slate-700">{commissionRate}%</span>
                          </div>
                        </div>

                        {/* Split Distribution Visualizer */}
                        <div className="space-y-2 pt-2 border-t border-slate-250/50">
                          <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold">Ripartizione Automatica Split</p>
                          <div className="w-full h-8 bg-slate-200 rounded-lg overflow-hidden flex font-mono text-[9px] font-bold text-white uppercase text-center items-center">
                            <div 
                              style={{ width: `${commissionRate}%` }} 
                              className="h-full bg-primary flex items-center justify-center transition-all duration-300 min-w-8"
                            >
                              {commissionRate}% Admin
                            </div>
                            <div 
                              style={{ width: `${100 - commissionRate}%` }} 
                              className="h-full bg-slate-800 flex items-center justify-center transition-all duration-300"
                            >
                              {100 - commissionRate}% Lavoratore
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Onboarding Compliance Matrix (Links Enclave to Payout Account) */}
                      <div className="p-5 border border-slate-150 rounded-xl bg-white space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h3 className="text-xs font-heading font-extrabold uppercase text-slate-700 tracking-wider">
                            Onboarding & Adyen Sub-Accounts
                          </h3>
                          <Briefcase className="w-4 h-4 text-slate-400" />
                        </div>

                        <div className="space-y-3 text-[10.5px]">
                          {/* eVTOL Helicopters Onboarding Status */}
                          <div className="flex items-start gap-3 justify-between">
                            <div>
                              <p className="font-bold text-slate-800 uppercase">Elicotteri & eVTOL Alpha-Copter</p>
                              <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                                Sub-Account: {providerCompliance ? `SUB_ADY_AERO_${providerCompliance.docNumber.replace(/\D/g, '')}` : "PENDING_ONBOARDING"}
                              </p>
                            </div>
                            {providerCompliance ? (
                              <span className="text-[8.5px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                                Attivo L0
                              </span>
                            ) : (
                              <span className="text-[8.5px] font-mono bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-bold uppercase">
                                Bloccato (No KYC)
                              </span>
                            )}
                          </div>

                          {/* Marine Onboarding Status */}
                          <div className="flex items-start gap-3 justify-between border-t border-slate-50 pt-2.5">
                            <div>
                              <p className="font-bold text-slate-800 uppercase">Barche & Marinai Captains Delta</p>
                              <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                                Sub-Account: {providerCompliance ? `SUB_ADY_MAR_${providerCompliance.docNumber.replace(/\D/g, '')}` : "PENDING_ONBOARDING"}
                              </p>
                            </div>
                            {providerCompliance ? (
                              <span className="text-[8.5px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                                Attivo L0
                              </span>
                            ) : (
                              <span className="text-[8.5px] font-mono bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded font-bold uppercase">
                                Bloccato (No KYC)
                              </span>
                            )}
                          </div>

                          {/* Standard Rides Onboarding Status */}
                          <div className="flex items-start gap-3 justify-between border-t border-slate-50 pt-2.5">
                            <div>
                              <p className="font-bold text-slate-800 uppercase">Automobili Ride-Line Node_0x3</p>
                              <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                                Sub-Account: SUB_ADY_RIDE_881E
                              </p>
                            </div>
                            <span className="text-[8.5px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                              Attivo L0
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Split Simulator */}
                    <div>
                      <form onSubmit={handleExecuteSplitDemo} className="p-5 border border-slate-200/90 rounded-xl bg-slate-900 text-white space-y-4 shadow-lg relative overflow-hidden">
                        <div className="corner-accent border-primary/45" />
                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#12c2e9_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                        <div className="flex border-b border-white/10 pb-3 justify-between items-center">
                          <div>
                            <h3 className="text-xs font-heading font-extrabold uppercase text-white tracking-widest">
                              Simulatore Adyen Split (SandBox Test)
                            </h3>
                            <p className="text-[8px] font-mono text-slate-400 uppercase mt-0.5">Test di allocazione dividendo in tempo reale</p>
                          </div>
                          <CircleDollarSign className="w-5 h-5 text-primary" />
                        </div>

                        <div className="space-y-4 pt-1">
                          {/* Service Node Selection */}
                          <div>
                            <label className="block text-[8px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                              Seleziona Servizio & Nodo AutGrit
                            </label>
                            <select
                              value={simServiceType}
                              onChange={(e) => {
                                setSimServiceType(e.target.value as any);
                                setSimulationResult(null);
                              }}
                              className="w-full bg-slate-800 border border-white/10 p-3 text-xs font-mono uppercase outline-none focus:border-primary transition-colors text-white font-bold rounded-lg"
                            >
                              <option value="ride">Node_0x3 Corse Automobili (Ride Hailing)</option>
                              <option value="delivery">Node_0x1 Consegna Espressa (Delivery Cargo)</option>
                              <option value="aviation">Elicotteri & Aerei (eVTOL Alpha Flight)</option>
                              <option value="marine">Barche & Marinai (Marine Yacht Delta)</option>
                            </select>
                          </div>

                          {/* Service Transaction Value input */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[8px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                                Importo della Transazione
                              </label>
                              <input
                                type="text"
                                required
                                value={simTxAmount}
                                onChange={(e) => {
                                  setSimTxAmount(e.target.value);
                                  setSimulationResult(null);
                                }}
                                className="w-full bg-slate-800 border border-white/10 p-3 text-sm font-mono outline-none focus:border-primary transition-colors text-white font-bold rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-[8px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                                Valuta (Fiat / Crypto)
                              </label>
                              <select
                                value={simCurrency}
                                onChange={(e) => {
                                  setSimCurrency(e.target.value);
                                  setSimulationResult(null);
                                }}
                                className="w-full bg-slate-800 border border-white/10 p-3 text-xs font-mono uppercase outline-none focus:border-primary transition-colors text-white font-bold rounded-lg"
                              >
                                <option value="EUR">EUR (€ Fiat)</option>
                                <option value="USD">USD ($ Fiat)</option>
                                <option value="USDT">USDT (Cripto)</option>
                                <option value="ETH">ETH (Cripto)</option>
                                <option value="BTC">BTC (Cripto)</option>
                              </select>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={simLoading || isNaN(parseFloat(simTxAmount)) || parseFloat(simTxAmount) <= 0}
                            className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-widest text-[9px] cursor-pointer"
                          >
                            {simLoading ? (
                               <div className="flex items-center gap-2 justify-center">
                                 <RefreshCw className="w-4 h-4 animate-spin" /> Esecuzione Split...
                               </div>
                            ) : "Simula Pagamento Split Adyen"}
                          </Button>
                        </div>

                        {/* Simulator split payout report */}
                        <AnimatePresence>
                          {simulationResult && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t border-white/10 text-[10.5px] font-mono space-y-3"
                            >
                              <div className="p-3.5 bg-white/5 border border-white/5 rounded-lg space-y-2">
                                <p className="text-[8.5px] uppercase tracking-widest text-slate-400 font-bold">REPORT ASSEGNAZIONE SPLIT ADYEN</p>
                                <div className="flex justify-between border-b border-white/5 pb-1 mt-2">
                                  <span className="text-slate-400 uppercase font-bold">Valore Incasso:</span>
                                  <span className="text-white font-bold">{simulationResult.currency} {simulationResult.total}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1 text-primary">
                                  <span className="font-bold uppercase">Trattenuto (Dividendo Admin - {simulationResult.rate}%):</span>
                                  <span className="font-bold">{simulationResult.currency} {simulationResult.platformDeduction}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1 text-emerald-400">
                                  <span className="font-bold uppercase">Accreditato a Sub-Account ({100-simulationResult.rate}%):</span>
                                  <span className="font-bold">{simulationResult.currency} {simulationResult.workerPayout}</span>
                                </div>
                                <div className="flex justify-between text-slate-350 pt-1 text-[9px] leading-relaxed">
                                  <span className="uppercase font-bold">Canale Gateway:</span>
                                  <span className="font-bold text-white uppercase">{simulationResult.gateway}</span>
                                </div>
                                <div className="flex justify-between text-slate-350 text-[9px] leading-relaxed">
                                  <span className="uppercase font-bold">Operatore Assegnato:</span>
                                  <span className="text-end font-bold text-white uppercase">{simulationResult.workerName}</span>
                                </div>
                                <div className="flex justify-between text-slate-350 text-[9px] leading-relaxed">
                                  <span className="uppercase font-bold">Sub-Account ID:</span>
                                  <span className="font-bold text-white">{simulationResult.subAccount}</span>
                                </div>
                              </div>

                              <div className="p-2.5 bg-emerald-500/10 border border-emerald-550/30 text-emerald-400 rounded-lg flex items-start gap-2 text-[9.5px]">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold uppercase">REGISTRAZIONE AVVENUTA CON SUCCESSO</p>
                                  <p className="text-[8.5px] text-emerald-300 mt-0.5 uppercase">L'operazione è stata inviata al registro di audit. Gateway di rete configurato.</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'send' && (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md mx-auto space-y-6 py-6"
                >
                  <div className="text-center mb-6">
                     <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Send className="w-6 h-6 text-primary" />
                     </div>
                     <h3 className="text-base font-bold text-foreground uppercase tracking-widest">Invia Asset</h3>
                     <p className="text-[10px] text-slate-400 uppercase mt-1 font-bold font-mono">Invia fondi o criptovalute a un indirizzo o nodo</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Indirizzo o Nodo Destinatario</label>
                        <input 
                           placeholder="EX: 0x... o nome del sub-account"
                           className="w-full bg-slate-50 border border-slate-200 p-3.5 text-xs font-mono text-foreground outline-none focus:border-primary transition-colors font-bold rounded-lg"
                           value={recipient}
                           onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Importo</label>
                        <div className="relative">
                           <input 
                              type="number"
                              placeholder="0.00"
                              className="w-full bg-slate-50 border border-slate-200 p-3.5 pr-16 text-lg font-bold font-mono text-foreground outline-none focus:border-primary transition-colors rounded-lg"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                           />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">ETH</span>
                        </div>
                    </div>
                  </div>

                  <Button className="w-full h-12 bg-primary text-white font-bold uppercase tracking-widest text-[10px] group shadow-xl shadow-primary/20">
                    Avvia Trasferimento P2P <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {activeTab === 'receive' && (
                <motion.div
                  key="receive"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md mx-auto space-y-6 py-6 text-center"
                >
                  <div className="w-44 h-44 mx-auto bg-white p-4 relative shadow-2xl rounded-xl border border-slate-150 flex items-center justify-center">
                     {/* Simulating QR */}
                     <div className="w-full h-full border-4 border-slate-50 flex items-center justify-center">
                        <Zap className="w-20 h-20 text-primary opacity-20" />
                     </div>
                     <Plus className="absolute -top-2 -left-2 text-primary" />
                     <Plus className="absolute -bottom-2 -right-2 text-primary" />
                  </div>
                  
                  <div className="space-y-3">
                     <h3 className="text-base font-bold text-foreground uppercase tracking-widest">Sincronizzazione Portafoglio</h3>
                     <div className="p-3 bg-slate-50 border border-slate-150 font-mono text-xs text-primary break-all select-all font-bold rounded-lg shadow-inner">
                        0x71C6908AC48450A9E7287395240E89B
                     </div>
                     <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest font-bold">Accetta solo asset crittografici conformi al modulo PAGO.</p>
                  </div>

                  <Button variant="outline" className="w-full border-slate-200 text-[10px] font-bold uppercase tracking-widest py-3.5 rounded-lg hover:bg-slate-50">Copia Indirizzo</Button>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit dei Pagamenti Split Adyen</h4>
                    <span className="text-[8px] font-mono text-slate-400 uppercase uppercase">Registro di Rete</span>
                  </div>
                  
                  {transactions.map(tx => (
                    <div key={tx.id} className="space-y-1">
                      <div 
                        onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
                        className={`geometric-card bg-white border-slate-150 p-4 flex justify-between items-center group cursor-pointer transition-all shadow-sm hover:shadow-md ${
                          selectedTx === tx.id ? 'border-primary/40 ring-1 ring-primary/10 bg-slate-50/50' : 'hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 flex items-center justify-center rounded-full border shadow-sm ${
                              tx.type === 'send' ? 'border-amber-550/35 bg-amber-50 text-amber-500' : 'border-emerald-550/35 bg-emerald-50 text-emerald-550'
                            }`}>
                              {tx.type === 'send' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">{tx.type === 'send' ? 'INVIA' : 'RICEVI'}_PAYMENT</p>
                                <p className="text-[8.5px] text-slate-400 font-mono mt-0.5 uppercase font-bold">{tx.address} • {new Date(tx.timestamp).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                            <div>
                                <p className={`text-xs font-mono font-bold ${
                                  tx.type === 'send' ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                  {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.asset}
                                </p>
                                <span className={`text-[7.5px] uppercase tracking-wider font-bold ${
                                  tx.status === 'confirmed' ? 'text-emerald-500' : 'text-amber-500'
                                }`}>{tx.status}</span>
                            </div>
                            <ArrowRight className={`w-3.5 h-3.5 text-slate-300 transition-transform ${selectedTx === tx.id ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedTx === tx.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mx-4 p-4 bg-slate-50 border-x border-b border-slate-150 rounded-b-xl space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1 font-bold">
                                           <Hash className="w-2 h-2" /> Transaction_Hash
                                        </p>
                                        <p className="text-[9px] font-mono text-primary font-bold break-all flex items-center gap-1.5 uppercase">
                                           {tx.hash} <ExternalLink className="w-2.5 h-2.5 cursor-pointer hover:text-primary/70" />
                                        </p>
                                     </div>
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1 font-bold">
                                           <FileText className="w-2 h-2" /> Block_Number
                                        </p>
                                        <p className="text-[9px] font-mono text-foreground font-bold">{tx.blockNumber}</p>
                                     </div>
                                  </div>
                                  <div className="space-y-3">
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5 font-bold">Network_Gas_Price</p>
                                        <p className="text-[9px] font-mono text-foreground font-bold">{tx.gasPrice}</p>
                                     </div>
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5 font-bold">Execution_Time</p>
                                        <p className="text-[9px] font-mono text-foreground font-bold">{new Date(tx.timestamp).toLocaleString()}</p>
                                     </div>
                                  </div>
                               </div>

                               {tx.commissionDetail && (
                                 <div className="pt-3 border-t border-slate-200/50">
                                   <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Allocazione dello Split Adyen</p>
                                   <div className="p-2.5 bg-sky-50 border border-sky-100/55 rounded text-[9.5px] font-mono text-sky-750 font-bold uppercase">
                                     {tx.commissionDetail}
                                   </div>
                                 </div>
                               )}

                               <div className="pt-3 border-t border-slate-200/50 flex justify-end">
                                  <a 
                                    href={`https://etherscan.io/tx/${tx.hash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[8.5px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                                  >
                                    Visualizza su Explorer <ArrowRight className="w-3 h-3" />
                                  </a>
                                </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8.5px] font-mono text-slate-400 uppercase tracking-widest font-bold shrink-0">
           <div className="flex gap-6">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ADYEN_UPLINK_LIVE</span>
              <span>SUITE: MARKETPLACE & PLATFORMS</span>
           </div>
           <span>VERSIONE: V1.5.0_SBX</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
