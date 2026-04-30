import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Zap, Shield, Navigation, Terminal, X, ArrowRight, ShoppingCart, CreditCard, HeartPulse, GraduationCap } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  action: () => void;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void; onInvoke: (id: string) => void }> = ({ isOpen, onClose, onInvoke }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    { id: 'ride', title: 'Initialize_Ride_Hailing', category: 'Services', icon: Navigation, action: () => onInvoke('ride') },
    { id: 'delivery', title: 'Deploy_Express_Delivery', category: 'Services', icon: Zap, action: () => onInvoke('delivery') },
    { id: 'sober', title: 'Invoke_Driver_Sobrio', category: 'Services', icon: Shield, action: () => onInvoke('sober') },
    { id: 'marketplace', title: 'Open_Mercato_Registry', category: 'Commerce', icon: ShoppingCart, action: () => onInvoke('marketplace') },
    { id: 'payment', title: 'Access_Pago_Terminal', category: 'Finance', icon: CreditCard, action: () => onInvoke('payment') },
    { id: 'health', title: 'Connect_Med_Link', category: 'Services', icon: HeartPulse, action: () => onInvoke('health') },
    { id: 'education', title: 'Uplink_Ed_Chain', category: 'Knowledge', icon: GraduationCap, action: () => onInvoke('education') },
    { id: 'terminal', title: 'Open_System_Terminal', category: 'System', icon: Terminal, action: () => {} },
    { id: 'logs', title: 'View_Audit_Logs', category: 'System', icon: Terminal, action: () => {} },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setSelectedIndex(0);
      setQuery('');
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[6000] bg-slate-200/60 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          className="geometric-card w-full max-w-2xl bg-white border-primary/20 shadow-2xl overflow-hidden shadow-primary/5"
          onClick={e => e.stopPropagation()}
        >
          <div className="corner-accent" />
          
          <div className="p-6 border-b border-slate-100 flex items-center gap-4">
            <Search className="w-5 h-5 text-primary" />
            <input
              autoFocus
              placeholder="Search nodes, services, or protocols..."
              className="bg-transparent border-none text-foreground w-full outline-none font-mono text-sm uppercase tracking-widest placeholder:text-slate-300 font-bold"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-400 font-mono font-bold">
              <Command className="w-3 h-3" /> K
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2 no-scrollbar bg-white">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  className={`
                    p-4 flex items-center justify-between cursor-pointer group transition-all rounded-lg mb-1
                    ${idx === selectedIndex ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'border border-transparent hover:bg-slate-50'}
                  `}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-8 h-8 flex items-center justify-center border transition-all
                      ${idx === selectedIndex ? 'border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'border-slate-200 text-slate-400 group-hover:border-primary/50'}
                    `}>
                      <cmd.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-[11px] font-mono uppercase tracking-widest ${idx === selectedIndex ? 'text-foreground font-bold' : 'text-slate-500'}`}>
                        {cmd.title}
                      </p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-tighter mt-0.5 font-bold">{cmd.category}</p>
                    </div>
                  </div>
                  {idx === selectedIndex && (
                    <motion.div layoutId="arrow">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                No matching protocols found in registry.
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            <div className="flex gap-4">
              <span><span className="text-primary font-bold">↑↓</span> Navigate</span>
              <span><span className="text-primary font-bold">↵</span> Execute</span>
            </div>
            <span>System_Ready // AG_TERMINAL_v1</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
