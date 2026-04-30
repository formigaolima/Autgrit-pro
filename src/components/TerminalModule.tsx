import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Send, Cpu, ShieldAlert, Activity, Database } from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'SEC' | 'SYS' | 'AI' | 'NET';
  message: string;
  timestamp: string;
}

export const TerminalModule: React.FC = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'SYS') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  useEffect(() => {
    // Random background logs
    const interval = setInterval(() => {
      const messages = [
        '[SEC_AUDIT] - Packet filtered at Node_0x22',
        '[SYS_MON] - Memory scrub clean: 0.12ms',
        '[NET_INF] - Handshake detected at RLY_ALPHA',
        '[AI_SHIELD] - Model update deployed: V1.0.4',
        '[SEC_INF] - Entropy pool optimized',
        '[SYS_ERR] - Minor latency at GATE_B (Resolved)',
      ];
      const types: LogEntry['type'][] = ['SEC', 'SYS', 'NET', 'AI', 'SEC', 'SYS'];
      const idx = Math.floor(Math.random() * messages.length);
      addLog(messages[idx], types[idx]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    setInput('');
    addLog(`> ${cmd}`, 'SYS');
    setIsProcessing(true);

    // Mock processing for system commands
    setTimeout(() => {
        if (cmd === '/status_report') {
            addLog('SYSTEM STATUS: OPTIMAL', 'AI');
            addLog('LATENCY: 0.12ms | UPTIME: 412h', 'SYS');
        } else if (cmd === '/security_check') {
            addLog('SCANNING NODES...', 'SEC');
            addLog('THREAT_LEVEL: ZERO_DETECTION', 'SEC');
            addLog('INTEGRITY: 99.99%', 'SEC');
        } else {
            addLog('QUERYING AI AGENT...', 'AI');
            setTimeout(() => {
                addLog('AI_RESPONSE: System operational. Query recognized.', 'AI');
            }, 1000);
        }
        setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="w-full flex flex-col h-[500px] border border-slate-200 bg-white font-mono overflow-hidden shadow-xl rounded-lg">
      {/* Terminal Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sys_Terminal v2.0</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Log Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar bg-white">
        {logs.map(log => (
          <div key={log.id} className="flex gap-3 text-[10px] leading-relaxed">
            <span className="text-slate-400 shrink-0">[{log.timestamp}]</span>
            <span className={`shrink-0 font-bold ${
              log.type === 'SEC' ? 'text-red-500' :
              log.type === 'AI' ? 'text-primary' :
              log.type === 'NET' ? 'text-emerald-500' : 'text-slate-500'
            }`}>
              [{log.type}]
            </span>
            <span className="text-slate-600 break-all">{log.message}</span>
          </div>
        ))}
        {isProcessing && (
           <div className="flex gap-3 text-[10px]">
              <span className="text-primary animate-pulse font-bold">_ PROCESSING...</span>
           </div>
        )}
      </div>

      {/* Command Input */}
      <form onSubmit={handleCommand} className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
        <span className="text-primary text-xs font-bold tracking-tighter">$</span>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="ENTER_COMMAND_OR_QUERY..."
          className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-slate-300 uppercase font-bold"
        />
        <button type="submit" disabled={isProcessing}>
            <Send className={`w-3 h-3 ${isProcessing ? 'text-slate-300' : 'text-primary hover:scale-110 transition-all'}`} />
        </button>
      </form>
      
      {/* Quick Access */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex gap-4 text-[8px] text-slate-400 uppercase tracking-[0.2em] font-bold">
         <button onClick={() => setInput('/status_report')} className="hover:text-primary transition-colors">[/status_report]</button>
         <button onClick={() => setInput('/security_check')} className="hover:text-primary transition-colors">[/security_check]</button>
      </div>
    </div>
  );
};
