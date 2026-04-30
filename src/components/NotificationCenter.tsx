import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, Zap, Cpu, X, Info, AlertTriangle } from 'lucide-react';

export interface SystemAlert {
  id: string;
  type: 'security' | 'operation' | 'load' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

interface NotificationCenterProps {
  alerts: SystemAlert[];
  isOpen: boolean;
  onClose: () => void;
  onClear: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ alerts, isOpen, onClose, onClear }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'security': return <ShieldAlert className="w-4 h-4 text-primary" />;
      case 'operation': return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'load': return <Cpu className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5500] bg-slate-200/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[400px] z-[5600] bg-white border-l border-slate-100 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                  <Bell className="w-4 h-4 text-primary" />
                  Grid_Intel_Feed
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Real-time bifurcation monitoring</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <AnimatePresence initial={false}>
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="geometric-card p-5 bg-slate-50/80 hover:border-primary/20 hover:bg-white shadow-sm hover:shadow-md transition-all relative"
                    >
                      <button 
                        onClick={() => onClear(alert.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-primary transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex gap-4 items-start">
                        <div className="shrink-0 mt-1">
                          {getIcon(alert.type)}
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[11px] font-bold text-foreground uppercase tracking-widest">{alert.title}</h4>
                            <span className="text-[8px] font-mono text-slate-400">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                     <AlertTriangle className="w-12 h-12 mb-4 text-slate-400" />
                     <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-400">No active bifurcations</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
               <div className="flex justify-between text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  <span>Queue_Depth: {alerts.length}</span>
                  <span>Monitor_Status: NOMINAL</span>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
