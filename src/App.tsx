/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Truck, 
  Hammer, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Wallet, 
  Star, 
  ChevronRight, 
  Menu, 
  X,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RideHailingMap } from './components/RideHailingMap';
import { TopologyMap } from './components/TopologyMap';
import { TerminalModule } from './components/TerminalModule';
import { ChatWidget } from './components/ChatWidget';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter, SystemAlert } from './components/NotificationCenter';
import { DeliveryModule } from './components/DeliveryModule';
import { MarketplaceModule } from './components/MarketplaceModule';
import { PaymentModule } from './components/PaymentModule';
import { useTranslation } from './lib/i18n';
import { Bell, Command as CommandIcon, ShoppingCart, CreditCard, HeartPulse, GraduationCap, Package, Github, Twitter, Linkedin } from 'lucide-react';

const SERVICES = [
  {
    id: 'ride',
    titleKey: 'service_ride_title' as const,
    descKey: 'service_ride_desc' as const,
    icon: Car,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'delivery',
    titleKey: 'service_delivery_title' as const,
    descKey: 'service_delivery_desc' as const,
    icon: Truck,
    color: 'from-orange-500 to-yellow-400'
  },
  {
    id: 'sober',
    titleKey: 'service_sober_title' as const,
    descKey: 'service_sober_desc' as const,
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-400',
    highlight: true
  },
  {
    id: 'physical',
    titleKey: 'service_physical_title' as const,
    descKey: 'service_physical_desc' as const,
    icon: Hammer,
    color: 'from-indigo-500 to-purple-400'
  },
  {
    id: 'digital',
    titleKey: 'service_digital_title' as const,
    descKey: 'service_digital_desc' as const,
    icon: Globe,
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'marketplace',
    titleKey: 'service_marketplace_title' as const,
    descKey: 'service_marketplace_desc' as const,
    icon: ShoppingCart,
    color: 'from-amber-600 to-orange-500'
  },
  {
    id: 'payment',
    titleKey: 'service_payment_title' as const,
    descKey: 'service_payment_desc' as const,
    icon: CreditCard,
    color: 'from-emerald-600 to-cyan-500'
  },
  {
    id: 'health',
    titleKey: 'service_health_title' as const,
    descKey: 'service_health_desc' as const,
    icon: HeartPulse,
    color: 'from-red-500 to-rose-400'
  },
  {
    id: 'education',
    titleKey: 'service_education_title' as const,
    descKey: 'service_education_desc' as const,
    icon: GraduationCap,
    color: 'from-blue-600 to-indigo-500'
  }
];

const FEATURES = [
  {
    titleKey: 'feature_shield_title' as const,
    descKey: 'feature_shield_desc' as const,
    icon: Cpu
  },
  {
    titleKey: 'feature_payments_title' as const,
    descKey: 'feature_payments_desc' as const,
    icon: Wallet
  },
  {
    titleKey: 'feature_rewards_title' as const,
    descKey: 'feature_rewards_desc' as const,
    icon: Star
  }
];

export default function App() {
  const { t, currentLanguage, setLanguage, isTranslating, supportedLanguages } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeModule, setActiveModule] = useState<'idle' | 'ride' | 'delivery' | 'sober' | 'marketplace' | 'payment'>('idle');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    { id: '1', type: 'security', title: 'SYSTEM_BOOT', message: 'Core gateway handshake complete. Protocols active.', timestamp: new Date().toISOString() },
    { id: '2', type: 'operation', title: 'NODE_ALPHA_READY', message: 'Deployment region 0xFB sync stable.', timestamp: new Date().toISOString() }
  ]);
  const [walletBalance, setWalletBalance] = useState({ eth: '0.00' });
  const [pendingService, setPendingService] = useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'authorizing' | 'processing' | 'success'>('idle');
  const [invokingId, setInvokingId] = useState<string | null>(null);

  // Custom GPS & Radar scanning state variables
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [nearUnits, setNearUnits] = useState<any[]>([]);
  const [activeRadarService, setActiveRadarService] = useState<any | null>(null);
  const [showRadarAlert, setShowRadarAlert] = useState<boolean>(false);
  const [isSyncingGps, setIsSyncingGps] = useState<boolean>(false);
  
  // Dynamic stats
  const [stats, setStats] = useState({
    load: '04.22%',
    uptime: '412:05:22',
    memory: '12.4'
  });

  // Generate 4-5 near units/personas tailored SPECIFICALLY to that service!
  const generateNearUnitsForService = (service: any, lat: number, lng: number) => {
    const prefix = service.id.toUpperCase();
    const mockNames = {
      ride: ['Corsa Privata #0x12', 'Tesla S - Casey L.', 'Lucid Air - Robin K.', 'Rivian R1S - Jordan P.'],
      delivery: ['Mini Drone Delivery #A4', 'Cargo E-Bike Delta', 'Unit 0x99 Carrier', 'Autonomous Trike Beta'],
      sober: ['SafeReturn Pilot Dan', 'SecureDrive Operator Maria', 'Driver Carlos', 'Tactical Companion Ana'],
      physical: ['Electric Guru Felix', 'Sanitation Unit Alpha', 'Mechanical Relay Hector', 'Locksmith Node 09'],
      digital: ['Smart-Contract Oracle', 'Varanelli FullStack Node', 'AG-Neural Modeler Kyra', 'CyberSec Penetrator'],
      marketplace: ['Hardware Sourcing Hub 02', 'Secure Wearable Vault', 'Hardware Enclave Alpha', 'Telemetry Merchant'],
      payment: ['P2P Collateral Rebalancer', 'Uniswap Gateway Delta', 'USDT Instant Liquidity', 'Tactical Swap Engine'],
      health: ['Med-Link Drone Omega', 'Mobile Trauma Uplink 3', 'Pharma Courier Relay-X', 'Bio-Telemetry Monitor'],
      education: ['Knowledge Matrix Relay', 'Ed-Chain Node #45', 'Skill Certifier Oracle', 'Algonquin Mentor-Node']
    };

    const names = mockNames[service.id as keyof typeof mockNames] || [
      `${prefix}_UNIT_ALPHA`, `${prefix}_UNIT_BETA`, `${prefix}_UNIT_GAMMA`, `${prefix}_UNIT_DELTA`
    ];

    return names.map((name, i) => {
      // Small offset to simulate units within close range
      const offsetLat = (Math.random() - 0.5) * 0.006;
      const offsetLng = (Math.random() - 0.5) * 0.006;
      const distanceKm = Math.sqrt(offsetLat * offsetLat + offsetLng * offsetLng) * 111.32; // Approx distance in km
      return {
        id: `${service.id}-${i}`,
        name,
        lat: lat + offsetLat,
        lng: lng + offsetLng,
        distance: distanceKm.toFixed(3),
        status: 'OPERATIONAL',
        reliability: (95 + Math.random() * 5).toFixed(1) + '%'
      };
    });
  };

  const triggerGpsSync = (service: any) => {
    setIsSyncingGps(true);
    setActiveRadarService(service);
    setShowRadarAlert(true);
    addAlert('operation', 'GPS_AUTO_ACQUIRE', 'Securing automatic telemetry handshake & perimeter scan...');

    const handleSuccess = async (position: any) => {
      const { latitude, longitude } = position.coords;
      const coords = { lat: latitude, lng: longitude };
      setUserCoords(coords);
      
      const units = generateNearUnitsForService(service, latitude, longitude);
      setNearUnits(units);
      setIsSyncingGps(false);
      
      const serviceTitle = service.titleKey ? t(service.titleKey) : service.title;
      addAlert('success', 'GPS_ALIGNED', `Perimeter scan finalized: ${units.length} units spotted near Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}.`);
      
      try {
        await fetch('/api/database/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gpsLocation: coords,
            lastServiceUnits: units,
            lastActiveServiceId: service.id
          })
        });
      } catch (err) {
        console.error("Failed to commit GPS alignment to DB:", err);
      }
    };

    const handleError = async () => {
      // Default / fallback coordinates (São Paulo center) to assure perfect operational status
      const latitude = -23.5505;
      const longitude = -46.6333;
      const coords = { lat: latitude, lng: longitude };
      setUserCoords(coords);
      
      const units = generateNearUnitsForService(service, latitude, longitude);
      setNearUnits(units);
      setIsSyncingGps(false);
      
      addAlert('security', 'GEO_LOCK_SIMULATED', `Manual geographic lookup activated. Dynamic boundary calibrated.`);
      
      try {
        await fetch('/api/database/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gpsLocation: coords,
            lastServiceUnits: units,
            lastActiveServiceId: service.id
          })
        });
      } catch (err) {
        console.error("Failed to commit fallback GPS mapping:", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } else {
      handleError();
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulation of dynamic data
  useEffect(() => {
    const interval = setInterval(() => {
        setStats(prev => ({
            ...prev,
            load: `${(4.1 + Math.random() * 0.25).toFixed(2)}%`,
            memory: (12.3 + Math.random() * 0.3).toFixed(1)
        }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadDb = async () => {
      try {
        const res = await fetch('/api/database');
        if (res.ok) {
          const dbData = await res.json();
          if (dbData.wallet) {
            setWalletBalance({ eth: dbData.wallet.eth });
            setIsWalletConnected(dbData.wallet.isWalletConnected);
          }
          if (dbData.systemStats) {
            setStats(prev => ({ ...prev, ...dbData.systemStats }));
          }
        }
      } catch (err) {
        console.error("Failed to load initial database state:", err);
      }
    };
    loadDb();
  }, []);

  const initWalletHandshake = async () => {
    const newEth = (1.5 + Math.random()).toFixed(4);
    setIsWalletConnected(true);
    setWalletBalance({ eth: newEth });

    try {
      await fetch('/api/database/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: { eth: newEth, isWalletConnected: true }
        })
      });
    } catch (err) {
      console.error("Failed to commit wallet to database:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addAlert = (type: SystemAlert['type'], title: string, message: string) => {
    const newAlert: SystemAlert = {
      id: Math.random().toString(36).substring(7),
      type,
      title,
      message,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleServiceInvoke = (service: any) => {
    setInvokingId(service.id);
    setTimeout(() => setInvokingId(null), 2000);

    // Auto-trigger GPS sync and adaptive nearby units radar scan
    triggerGpsSync(service);

    if (!isWalletConnected) {
      if (['ride', 'delivery', 'sober', 'marketplace', 'payment'].includes(service.id)) {
        setActiveModule(service.id);
        const resolvedTitle = service.titleKey ? t(service.titleKey) : service.title;
        addAlert('operation', 'MODULE_INVOKED', `Establishing secure link to ${resolvedTitle}`);
      }
      return;
    }
    setPendingService(service);
    setPaymentStep('authorizing');
  };

  const executeTransaction = () => {
    setPaymentStep('processing');
    setTimeout(async () => {
      const fee = 0.0012;
      const current = parseFloat(walletBalance.eth);
      if (current >= fee) {
        const nextEth = (current - fee).toFixed(4);
        setWalletBalance({ eth: nextEth });
        setPaymentStep('success');
        addAlert('success', 'TRANSACTION_MINED', `Fee of 0.0012 ETH confirmed. Access granted.`);

        try {
          await fetch('/api/database/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet: { eth: nextEth, isWalletConnected: true }
            })
          });
        } catch (err) {
          console.error("Failed to commit wallet to database on tx:", err);
        }

        setTimeout(() => {
          setPaymentStep('idle');
          if (pendingService) setActiveModule(pendingService.id);
          setPendingService(null);
        }, 1500);
      } else {
        alert('INSUFFICIENT_LIQUIDITY');
        setPaymentStep('idle');
      }
    }, 2000);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary p-4 sm:p-8 relative overflow-hidden`}>
      {/* Glitch Overlay Effect - subtle scanlines */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      {/* Payment Confirmation Overlay */}
      <AnimatePresence>
        {paymentStep !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-white/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="geometric-card max-w-sm w-full bg-white shadow-2xl border-primary/30 p-8 text-center"
            >
              <div className="corner-accent" />
              
              {paymentStep === 'authorizing' && (
                <>
                  <div className="w-14 h-14 bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2 uppercase tracking-widest">{t('tx_auth')}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed mb-6 font-bold">
                    Service: {pendingService?.titleKey ? t(pendingService.titleKey) : pendingService?.title}<br/>
                    Network_Fee: <span className="text-primary font-bold">0.0012 ETH</span>
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setPaymentStep('idle')}
                      className="flex-1 h-12 uppercase tracking-widest text-[10px] border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors font-bold"
                    >
                      {t('reject')}
                    </Button>
                    <Button 
                      onClick={executeTransaction}
                      className="flex-1 h-12 bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                    >
                      {t('sign_hash')}
                    </Button>
                  </div>
                </>
              )}

              {paymentStep === 'processing' && (
                <>
                  <div className="w-14 h-14 border-2 border-primary border-t-transparent animate-spin mx-auto mb-6 rounded-full" />
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2 uppercase tracking-widest">{t('mining_tx')}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed font-bold">{t('broadcasting')}</p>
                </>
              )}

              {paymentStep === 'success' && (
                <>
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6 rounded-lg">
                    <Zap className="w-8 h-8 fill-current" />
                  </div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2 uppercase tracking-widest text-emerald-500">{t('tx_confirmed')}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed font-bold">{t('handshake_ok')}</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Module Overlay */}
      <AnimatePresence>
        {activeModule === 'ride' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RideHailingMap onClose={() => setActiveModule('idle')} />
          </motion.div>
        )}
        {activeModule === 'delivery' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DeliveryModule onClose={() => setActiveModule('idle')} />
          </motion.div>
        )}
        {activeModule === 'marketplace' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MarketplaceModule onClose={() => setActiveModule('idle')} />
          </motion.div>
        )}
        {activeModule === 'payment' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PaymentModule balance={walletBalance} onClose={() => setActiveModule('idle')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation / Header */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 py-4 md:px-8 md:py-6`}>
        <div className="container mx-auto flex justify-between items-center md:items-end md:pb-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary flex items-center justify-center p-1.5 md:p-2">
              <div className="w-full h-full border border-white flex items-center justify-center font-bold text-white text-base md:text-xl tracking-tighter">AG</div>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold tracking-[0.2em] text-foreground uppercase m-0">{t('app_title')} <span className="text-primary font-light">PRO</span></h1>
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-[0.4em] leading-none mt-1">{t('app_subtitle')}</p>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-12 text-right">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{t('system_load')}</p>
              <p className="text-sm font-mono text-primary">{stats.load}</p>
            </div>
            <div className="space-y-1 border-l border-slate-100 pl-12">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{t('uptime')}</p>
              <p className="text-sm font-mono text-foreground">{stats.uptime}</p>
            </div>
            <div className="space-y-1 border-l border-slate-100 pl-12">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{t('protocol')}</p>
              <p className="text-sm font-mono text-foreground">AG-SEC-V1</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex gap-4">
               {/* Language Selector Dropdown */}
               <div className="relative group">
                 <button 
                  className="w-10 h-10 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  title="Change Language"
                 >
                   {isTranslating ? (
                     <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <Globe className="w-4 h-4" />
                   )}
                 </button>
                 <div className="absolute right-0 top-10 mt-2 bg-white border border-slate-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1 min-w-[140px] text-left">
                   {supportedLanguages.map((lang) => (
                     <button
                       key={lang.code}
                       onClick={() => setLanguage(lang.code)}
                       className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors hover:bg-slate-50 cursor-pointer ${currentLanguage === lang.code ? 'text-primary font-bold bg-primary/5' : 'text-slate-500'}`}
                     >
                       {lang.label}
                     </button>
                   ))}
                 </div>
               </div>

               <button 
                onClick={() => setIsCommandOpen(true)}
                className="w-10 h-10 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
               >
                 <CommandIcon className="w-4 h-4" />
               </button>
               <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="w-10 h-10 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors relative cursor-pointer"
               >
                 <Bell className="w-4 h-4" />
                 {alerts.length > 0 && (
                   <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
                 )}
               </button>
            </div>
            <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden flex flex-col justify-between pb-8"
          >
              <div className="flex flex-col gap-6 text-xl font-heading">
                <a href="#services" onClick={() => setIsMenuOpen(false)}>{t('services_heading')}</a>
                <a href="#technology" onClick={() => setIsMenuOpen(false)}>{t('tech_registry_title')}</a>
                <a href="#professional" onClick={() => setIsMenuOpen(false)}>{t('pro_network_title')}</a>
                
                {/* Mobile action icons row */}
                <div className="flex gap-4 items-center justify-start pt-6 mt-2 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      const nextLangIdx = (supportedLanguages.findIndex(l => l.code === currentLanguage) + 1) % supportedLanguages.length;
                      setLanguage(supportedLanguages[nextLangIdx].code);
                    }}
                    className="w-12 h-12 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer rounded-lg bg-white"
                    title="Change Language"
                  >
                    {isTranslating ? (
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-500">
                        <Globe className="w-4 h-4 text-slate-400" />
                        {currentLanguage}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCommandOpen(true);
                    }}
                    className="w-12 h-12 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer rounded-lg bg-white"
                  >
                    <CommandIcon className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsNotificationsOpen(true);
                    }}
                    className="w-12 h-12 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-colors relative cursor-pointer rounded-lg bg-white"
                  >
                    <Bell className="w-5 h-5" />
                    {alerts.length > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full" />
                    )}
                  </button>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                  <Button 
                    onClick={() => {
                        setIsMenuOpen(false);
                        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-6 text-lg tracking-widest uppercase bg-primary text-white shadow-xl shadow-primary/20"
                  >
                    {t('get_started')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                        setIsMenuOpen(false);
                        initWalletHandshake();
                    }}
                    className="w-full py-6 text-lg tracking-widest uppercase border-slate-100 text-slate-400 hover:bg-slate-50"
                  >
                    {t('connect_wallet')}
                  </Button>
                </div>
              </div>

              {/* Mobile system details label */}
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 text-center border-t border-slate-100 pt-4">
                AG_SEC_V1 • {stats.uptime} • {stats.load}
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="overview" className="container mx-auto px-4 sm:px-6 lg:px-8 mt-28 md:mt-40">
        {/* Navigation Menu Rail */}
        <div className="flex gap-8 border-b border-slate-100 mb-20 pb-4 overflow-x-auto no-scrollbar">
           {['Overview', 'Topology', 'Resources', 'Security', 'Logs'].map((item, idx) => (
             <a key={item} href={`#${item.toLowerCase()}`} className={`group cursor-pointer flex items-center gap-3 shrink-0 ${idx > 0 ? 'opacity-40 hover:opacity-100' : ''}`}>
               <span className="text-[10px] text-slate-400 uppercase tracking-widest group-hover:text-primary">0{idx + 1}</span>
               <p className="text-sm text-foreground font-medium tracking-wide uppercase">{item}</p>
             </a>
           ))}
        </div>

        {/* Hero Section */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-slate-200 bg-slate-50 text-[10px] uppercase tracking-[0.3em] text-primary mb-8">
                <Zap className="w-3 h-3 fill-current" />
                {t('control_interface_v')}
              </div>
              <h1 className="text-6xl md:text-8xl font-heading font-bold leading-[0.85] mb-12 uppercase">
                {t('everything_everywhere').split(', ').map((text, i, arr) => (
                  <React.Fragment key={i}>
                    {i === 1 ? <span className="text-primary italic">{text}</span> : <span className={i === 2 ? "text-slate-400" : ""}>{text}</span>}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                 <Button 
                   size="lg" 
                   className="h-12 px-8 uppercase tracking-widest font-bold group bg-primary text-white hover:bg-primary/90"
                   onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                 >
                  {t('initialize_session')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a 
                  href="https://autgrit.io/whitepaper" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-background h-12 px-8 uppercase tracking-widest text-sm font-bold text-foreground transition-all outline-none select-none hover:bg-slate-50"
                >
                  {t('view_whitepaper')}
                </a>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
             <div className="geometric-card">
                <div className="corner-accent" />
                <p className="terminal-label mb-2">{t('memory_allocation')}</p>
                <p className="text-4xl terminal-value">{stats.memory} <span className="text-lg text-slate-600 uppercase">GB</span></p>
                <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase">{t('of_available')}</p>
             </div>
             <div className="geometric-card bg-primary/5 border-primary/20">
                <div className="corner-accent border-primary/30" />
                <p className="terminal-label mb-2 text-primary/70">{t('terminal_session')}</p>
                <p className="text-[10px] font-mono text-slate-400 leading-tight">AUTH: LVL_0<br/>IP: 192.168.0.x<br/>SIG: RSA4096</p>
                <div className="mt-4 flex gap-2">
                   <div className="w-1 h-1 bg-primary animate-pulse" />
                   <div className="w-1 h-1 bg-primary/40 animate-pulse delay-75" />
                   <div className="w-1 h-1 bg-primary/10 animate-pulse delay-150" />
                </div>
             </div>
          </div>
        </section>

        {/* Services / Grid */}
        <section id="services" className="mb-24">
          <div className="flex justify-between items-end border-b border-slate-100 pb-6 mb-12">
            <div>
              <h2 className="text-3xl font-heading font-bold">{t('services_heading')}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-2">{t('services_subheading')}</p>
            </div>
            <button className="text-[10px] border border-slate-200 px-4 py-2 hover:bg-slate-50 text-slate-500 uppercase tracking-widest transition-colors font-mono cursor-pointer">
              {t('export_ref_data')}
            </button>
          </div>

          {/* High-Tech Adaptive GPS Geofence & Proximity Radar HUD */}
          <div className="geometric-card bg-slate-950 text-slate-100 border-primary/20 shadow-2xl p-6 sm:p-8 mb-12 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Background scanner background grids */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#12c2e9_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="corner-accent border-primary/40" />

            <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
              {/* Radar Sweep Animation Frame */}
              <div className="relative w-40 h-40 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {/* Pulsing radar grids */}
                <div className="absolute inset-2 rounded-full border border-primary/10" />
                <div className="absolute inset-8 rounded-full border border-primary/15" />
                <div className="absolute inset-16 rounded-full border border-primary/20" />
                {/* Crosshairs */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-primary/10" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary/10" />
                
                {/* Sweeping line */}
                <div className="absolute inset-0 origin-center animate-[spin_5s_linear_infinite] bg-gradient-to-tr from-primary/30 via-transparent to-transparent rounded-full" />
                
                {/* Dynamic Blips indicating nearby units coordinates */}
                {nearUnits.map((u, i) => {
                  const angle = (i * (360 / Math.max(1, nearUnits.length)) + 45) * (Math.PI / 180);
                  const radius = 25 + (i * 12) % 40; // pseudo random radius
                  const left = `calc(50% + ${Math.cos(angle) * radius}px - 4px)`;
                  const top = `calc(50% + ${Math.sin(angle) * radius}px - 4px)`;
                  return (
                    <div 
                      key={u.id}
                      className="absolute w-2.5 h-2.5 rounded-full bg-primary/80 border border-white flex items-center justify-center shadow-lg"
                      style={{ left, top }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </div>
                  );
                })}
                {/* User position center marker */}
                <div className="absolute w-3.5 h-3.5 rounded-full bg-primary border-2 border-white z-20 shadow-lg animate-pulse" />
              </div>

              {/* Telemetry and Nearby Units Information (The "Cerca Adaptada") */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary uppercase text-[8px] tracking-[0.25em] font-mono mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      {activeRadarService ? `PROX_GEOFENCE_ACTIVE` : `GEOFENCE_ON_STANDBY`}
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] font-heading text-white">
                      {activeRadarService 
                        ? `RADAR: ${t(activeRadarService.titleKey)} (NODE_${activeRadarService.id.toUpperCase()})` 
                        : "SISTEMA DE CERCA ADAPTADA & GPS RECEPTOR AUTOMÁTICO"
                      }
                    </h3>
                  </div>

                  <div className="font-mono text-[10px] text-right text-slate-400">
                    <p className="font-bold text-white uppercase tracking-wider">Coordinates</p>
                    {isSyncingGps ? (
                      <p className="text-primary animate-pulse font-bold uppercase tracking-widest">AQUIRING SIGNAL...</p>
                    ) : userCoords ? (
                      <p className="text-emerald-400 font-bold">LAT: {userCoords.lat.toFixed(5)} | LNG: {userCoords.lng.toFixed(5)}</p>
                    ) : (
                      <p className="text-slate-500 font-bold">GPS_NOT_ESTABLISHED</p>
                    )}
                  </div>
                </div>

                {activeRadarService ? (
                  <div>
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                      Unidades mais próximas focadas na sua função:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {nearUnits.map((u, i) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-primary/25 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 bg-primary/10 border border-primary/30 text-[10px] font-mono font-bold text-primary flex items-center justify-center rounded">
                              0{i+1}
                            </span>
                            <div>
                              <p className="text-[10px] font-mono text-white tracking-wide font-bold">{u.name}</p>
                              <p className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Confiabilidade: {u.reliability}</p>
                            </div>
                          </div>
                          
                          <div className="text-right font-mono">
                            <p className="text-[10px] text-emerald-400 font-bold animate-pulse">{u.distance} KM</p>
                            <p className="text-[7.5px] text-slate-400 tracking-tighter uppercase font-bold">Próximo a você</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5 mt-4">
                      {['ride', 'delivery', 'sober', 'marketplace', 'payment'].includes(activeRadarService.id) && (
                        <Button
                          onClick={() => setActiveModule(activeRadarService.id)}
                          className="h-10 px-5 bg-primary text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20"
                        >
                          Conectar Mapa Local ({activeRadarService.id.toUpperCase()})
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => triggerGpsSync(activeRadarService)}
                        className="h-10 px-4 border-white/10 text-slate-400 hover:text-white uppercase tracking-widest text-[9px] font-bold"
                      >
                        Recalibrar Sinal Geocerca
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center sm:text-left">
                    <p className="text-xs uppercase tracking-widest text-slate-400 leading-relaxed font-bold">
                      Clique em qualquer um dos ícones operacionais de aplicativo abaixo para invocar a função.
                    </p>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                      O sistema iniciará automaticamente a telemetria GPS e calibrará as unidades ("personas") mais próximas de suas coordenadas geográficas reais.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <div 
                  onClick={() => handleServiceInvoke(service)}
                  className="geometric-card group cursor-pointer hover:border-primary/30 hover:bg-white shadow-sm hover:shadow-xl transition-all h-full bg-slate-50/50"
                >
                  <div className="corner-accent" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 border border-slate-100 flex items-center justify-center bg-white group-hover:bg-primary group-hover:text-white transition-all">
                      <service.icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                    <span className="font-mono text-[9px] text-slate-400">NODE_0x{idx}</span>
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-3 text-foreground">{t(service.titleKey)}</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed mb-6 uppercase tracking-wider">{t(service.descKey)}</p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-emerald-600 uppercase">{t('operational_status')}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceInvoke(service);
                      }}
                      disabled={invokingId === service.id}
                      className={`text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                        invokingId === service.id 
                          ? 'text-emerald-500 font-bold' 
                          : 'text-slate-400 hover:text-primary'
                      }`}
                    >
                      {invokingId === service.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 animate-in zoom-in duration-300" />
                          {t('invoking_ok')}
                        </>
                      ) : (
                        t('invoke_module')
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Table Section */}
        <section id="technology" className="mb-24">
           <div className="geometric-card bg-slate-50 p-8">
              <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.25em]">{t('tech_registry_title')}</h3>
                <div className="flex gap-4">
                  <button className="text-[10px] border border-slate-200 px-3 py-1 hover:bg-white text-slate-500 uppercase tracking-widest font-mono transition-colors shadow-sm cursor-pointer">{t('tech_registry_export')}</button>
                  <button className="text-[10px] bg-primary text-white px-3 py-1 font-bold uppercase tracking-widest transition-colors shadow-md cursor-pointer">{t('tech_registry_refresh')}</button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                    <tr className="h-10">
                      <th className="font-medium pl-2">{t('col_identifier')}</th>
                      <th className="font-medium">{t('col_designation')}</th>
                      <th className="font-medium">{t('col_latency')}</th>
                      <th className="font-medium">{t('col_heat')}</th>
                      <th className="font-medium pr-2 text-right text-emerald-600">{t('col_status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {[
                      { id: '0x7A_22', d: t('row_cpu'), l: '0.12ms', h: '42°C', s: t('operational_status') },
                      { id: '0x7A_23', d: t('row_uplink'), l: '4.80ms', h: '38°C', s: t('operational_status') },
                      { id: '0x8B_01', d: t('row_scrub'), l: '1.22ms', h: '56°C', s: t('high_load_status'), warning: true },
                      { id: '0x9C_12', d: t('row_buffer'), l: '0.08ms', h: '28°C', s: t('operational_status') },
                      { id: '0x2F_55', d: t('row_gate'), l: '0.15ms', h: '44°C', s: t('operational_status') },
                    ].map((row) => (
                      <tr key={row.id} className="h-12 hover:bg-white transition-colors group">
                        <td className="pl-2 group-hover:text-primary transition-colors text-foreground font-bold">{row.id}</td>
                        <td className="text-slate-500">{row.d}</td>
                        <td>{row.l}</td>
                        <td>{row.h}</td>
                        <td className={`text-right pr-2 uppercase font-bold ${row.warning ? 'text-amber-500' : 'text-emerald-500'}`}>{row.s}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </section>

        {/* Topology Section */}
        <section id="topology" className="mb-24">
          <div className="flex justify-between items-end border-b border-slate-100 pb-6 mb-12">
            <div>
              <h2 className="text-3xl font-heading font-bold">{t('topology_title')}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-2">{t('topology_subtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TopologyMap />
            </div>
            <div className="space-y-6">
              <div className="geometric-card bg-white shadow-sm">
                <div className="corner-accent border-slate-200" />
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">{t('node_clusters')}</h4>
                <div className="space-y-3 font-mono text-[9px] uppercase">
                  <div className="flex justify-between">
                    <span className="text-slate-400 italic">CORE_GATEWAY</span>
                    <span className="text-emerald-600">98.5% Load</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 italic">SEC_ENCLAVE</span>
                    <span className="text-primary">12.2% Load</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 italic">LIQ_POOL_A</span>
                    <span className="text-emerald-600">44.0% Load</span>
                  </div>
                </div>
              </div>
              <div className="geometric-card border-primary/20 bg-primary/5">
                <div className="corner-accent border-primary/30" />
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{t('pulse_detected')}</h4>
                <p className="text-[9px] text-slate-500 uppercase leading-relaxed">{t('pulse_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI & Security monitor */}
        <section id="security" className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/5 text-[10px] uppercase tracking-[0.3em] text-primary mb-8 px-4">
                <ShieldCheck className="w-4 h-4" />
                {t('safety_protocol_active')}
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 leading-tight">
                {t('safety_heading')}
              </h2>
              <div className="space-y-8">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="flex gap-6 items-start group">
                    <div className="shrink-0 w-12 h-12 border border-slate-100 bg-white shadow-sm flex items-center justify-center group-hover:border-primary transition-colors">
                      <feature.icon className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-2 uppercase tracking-widest text-foreground">{t(feature.titleKey)}</h4>
                      <p className="text-[12px] text-slate-500 uppercase tracking-wider leading-relaxed">
                        {t(feature.descKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <div id="logs" className="space-y-8">
              <TerminalModule />
            </div>
          </div>
        </section>

        {/* Marketplace - Resources Section */}
        <section id="resources" className="mb-24">
          <div className="geometric-card bg-slate-50 p-12 border-slate-100 shadow-xl">
            <div className="corner-accent" />
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
               <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 rounded-2xl">
                 <Package className="w-8 h-8 text-primary" />
               </div>
               <h2 className="text-3xl font-heading font-bold mb-4 uppercase tracking-tight">{t('pro_resources_title')}</h2>
               <p className="text-slate-500 mb-8 uppercase tracking-widest text-[12px] leading-relaxed">
                 {t('pro_resources_desc')}
               </p>
               <Button 
                onClick={() => setActiveModule('marketplace')}
                className="h-12 px-10 bg-primary text-white font-bold uppercase tracking-widest shadow-xl shadow-primary/20 cursor-pointer"
               >
                 {t('launch_marketplace')}
               </Button>
            </div>
          </div>
        </section>

        {/* Professionals Section */}
        <section id="professional" className="mb-24">
          <div className="geometric-card bg-slate-50 p-12 md:p-20 overflow-hidden relative group border-slate-100 shadow-xl">
            <div className="absolute top-0 right-0 w-full h-full border-r-4 border-primary/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 opacity-20 pointer-events-none" />
            <div className="corner-accent" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 uppercase">{t('pro_network_title').replace(/<br\/>/g, "\n")}</h2>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed uppercase tracking-wider font-medium">
                  {t('pro_network_desc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                  {['Flexible_Schedules', 'AI_Optimized_ROAS', 'Merit_Points_Sys', 'Instant_Liq_Pools'].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 bg-white border border-slate-100 shadow-sm rounded-lg">
                      <ChevronRight className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                        {item === 'Flexible_Schedules' ? t('pro_schedule') : item === 'AI_Optimized_ROAS' ? t('pro_roas') : item === 'Merit_Points_Sys' ? t('pro_merit') : item === 'Instant_Liq_Pools' ? t('pro_liq') : item}
                      </span>
                    </div>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  onClick={() => setIsCommandOpen(true)}
                  className="h-12 px-10 bg-primary text-white hover:bg-primary/90 uppercase tracking-widest font-bold shadow-xl shadow-primary/20 cursor-pointer"
                >
                  {t('req_access')}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="aspect-[4/5] filter grayscale border border-slate-100 bg-white overflow-hidden group-hover:grayscale-0 transition-all duration-500 rounded-lg shadow-lg">
                    <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400" alt="Professional" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="space-y-4">
                    <div className="aspect-square border border-slate-100 bg-primary/5 flex items-center justify-center rounded-lg shadow-sm">
                       <Star className="w-12 h-12 text-primary/20 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="aspect-square border border-slate-100 bg-slate-50" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Economy - Terminals */}
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 geometric-card bg-white border-slate-100 shadow-xl">
              <div className="corner-accent" />
              <h2 className="text-2xl font-bold mb-6">{t('currency_resolver')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <p className="terminal-label mb-4 underline decoration-slate-100 underline-offset-8 font-bold">{t('fiat_networks')}</p>
                    <div className="grid grid-cols-1 gap-2 font-mono text-[11px]">
                       {['USD_TERMINAL', 'EUR_NETWORK', 'GBP_RELAY', 'JPY_TRANSIT'].map(f => (
                         <div key={f} className="flex justify-between p-3 bg-slate-50 border border-slate-50 rounded-lg group hover:border-primary/20 transition-all">
                            <span className="text-slate-500 font-bold">{f}</span>
                            <span className="text-emerald-500 animate-pulse font-bold">LINKED</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div>
                    <p className="terminal-label mb-4 underline decoration-slate-100 underline-offset-8 font-bold">{t('crypto_networks')}</p>
                    <div className="grid grid-cols-1 gap-2 font-mono text-[11px]">
                       {['BTC_MAINNET', 'ETH_CONSENSUS', 'SOL_UPSTREAM', 'USDT_VAULT'].map(c => (
                         <div key={c} className="flex justify-between p-3 bg-slate-50 border border-slate-50 rounded-lg group hover:border-primary/20 transition-all">
                            <span className="text-slate-500 font-bold">{c}</span>
                            <span className="text-primary animate-pulse font-bold">ACTIVE</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="geometric-card bg-primary/5 flex flex-col justify-center text-center p-12 shadow-sm border-primary/20">
              <div className="corner-accent" />
              <div className="w-16 h-16 mx-auto mb-6 bg-slate-50 border border-primary/20 flex items-center justify-center p-3 relative group-hover:scale-110 transition-transform rounded-xl">
                 <Wallet className="w-full h-full text-primary" />
                 {isWalletConnected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                 )}
              </div>
              <h3 className="text-lg font-bold mb-4 text-foreground">{isWalletConnected ? t('wallet_connected') : t('connect_wallet')}</h3>
              {isWalletConnected ? (
                <div className="space-y-4 mb-8">
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{t('avail_balance')}</p>
                   <p className="text-3xl font-heading font-bold text-primary">{walletBalance.eth} <span className="text-sm font-mono opacity-50">ETH</span></p>
                   <p className="text-[8px] font-mono text-slate-400 font-bold">ADDR: 0x71...F23A</p>
                </div>
              ) : (
                <p className="text-[10px] uppercase text-slate-400 tracking-widest leading-loose mb-8 font-bold">{t('handshake_desc')}</p>
              )}
              <Button 
                onClick={initWalletHandshake}
                disabled={isWalletConnected}
                className="w-full bg-primary text-white hover:bg-primary/90 uppercase tracking-widest font-bold h-12 shadow-xl shadow-primary/20 cursor-pointer"
              >
                {isWalletConnected ? t('operational_status') : t('init_handshake')}
              </Button>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 gap-8 mb-12">
         <div className="flex flex-wrap justify-center gap-12">
          <div className="flex flex-col gap-1">
              <span className="text-slate-300 font-bold tracking-[0.3em]">{t('footer_protocol')}</span>
             <span>AutGrit-Secure-v1</span>
          </div>
          <div className="flex flex-col gap-1">
              <span className="text-slate-300 font-bold tracking-[0.3em]">{t('footer_matrix')}</span>
             <span>Admin-Level-0</span>
          </div>
          <div className="flex flex-col gap-1">
              <span className="text-slate-300 font-bold tracking-[0.3em]">{t('footer_encryption')}</span>
             <span>SHA-512/RSA-4096</span>
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/autgrit" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Github className="w-4 h-4" /></a>
            <a href="https://twitter.com/autgrit" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="https://linkedin.com/company/autgrit" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="text-right flex flex-col items-center md:items-end gap-2">
           <p>{t('footer_rights')}</p>
           <p className="text-primary opacity-50 font-bold">Local_Crd: SYST_0x2900_V</p>
        </div>
      </footer>

      <ChatWidget />
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
        onInvoke={(id) => {
          setActiveModule(id as any);
          addAlert('operation', 'COMMAND_EXECUTED', `Module ${id.toUpperCase()} protocol initiated via command palette.`);
        }}
      />
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        alerts={alerts}
        onClear={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
      />
    </div>
  );
}
