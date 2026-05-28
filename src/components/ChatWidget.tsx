import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, User, ShieldCheck } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initializing Socket.io connection with ONLY 'websocket' transport to
    // completely prevent continuous 404 polling requests on platforms like Vercel.
    const socket = io({
      transports: ['websocket'],
      reconnectionAttempts: 1,
      timeout: 3000,
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('connect_error', () => {
      setIsSocketConnected(false);
    });

    socket.on('message', (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isMe: data.socketId === socket.id,
        },
      ]);
    });

    // Welcome message
    setTimeout(() => {
      setMessages([
        {
          id: 'welcome',
          sender: 'SYSTEM_AI',
          text: 'Establishing secure communication channel... Authentication verified. How can I assist your operation today?',
          timestamp: new Date().toISOString(),
          isMe: false,
        },
      ]);
    }, 1000);

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    if (isSocketConnected && socketRef.current) {
      const messageData = {
        sender: 'OPERATOR_PRO',
        text: inputValue,
        socketId: socketRef.current.id,
      };
      socketRef.current.emit('message', messageData);
      setInputValue('');
    } else {
      // Offline/Static fallback simulation
      const textToSend = inputValue;
      setInputValue('');

      // 1. Immediately append user message
      const userMsg: Message = {
        id: 'local-' + Date.now(),
        sender: 'OPERATOR_PRO',
        text: textToSend,
        timestamp: new Date().toISOString(),
        isMe: true,
      };
      setMessages((prev) => [...prev, userMsg]);

      // 2. Simulate AI thinking/typing animation
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);

        const lowerText = textToSend.toLowerCase();
        let aiText = "AUTGRIT_AI: Request received. Running local telemetry compilation... Local system cache reports full functional parameters.";

        if (lowerText.includes('hardware') || lowerText.includes('server') || lowerText.includes('status')) {
          aiText = "SYSTEM_STATUS: Central cluster is nominal. Memory mapping active. Access points are secure under SHA-512/RSA-4096 protocols.";
        } else if (lowerText.includes('money') || lowerText.includes('wallet') || lowerText.includes('eth') || lowerText.includes('balance')) {
          aiText = "VAULT_SYNCHRONIZER: Crypto ledger status is active. Real-time Ethereum consensus is synchronized at 0x71...F23A. System fee is set to standard 0.0012 ETH.";
        } else if (lowerText.includes('ride') || lowerText.includes('taxi') || lowerText.includes('sober') || lowerText.includes('driver')) {
          aiText = "GEOLOCATION_SYSTEM: GPS routing and topology map loaded. Nearest autonomous pilot/vehicle unit is within response proximity (estimated 4.2 minutes).";
        } else if (lowerText.includes('help') || lowerText.includes('menu')) {
          aiText = "GRID_HELP: Operational controls are bound to: #services (Core Node), #professional (Pro Network), #overview (Resource Logs). To trigger actions, access the interactive components in the dashboard.";
        } else {
          const defaults = [
            "SYSTEM_AI: Request mapped. Real-time server sockets are offline (Local-Loopback Active). System operations are unaffected and fully secured.",
            "AUTGRIT_AI: Command understood. Processing local data files... Everything is running stable locally.",
            "GRID_COMMS: Checking decentralized blockchain registers... Local copy of ledger validated.",
            "OPERATIONAL_LOG: Node access is active with Level-0 credentials. How else can I assist with local modules?"
          ];
          aiText = defaults[Math.floor(Math.random() * defaults.length)];
        }

        const aiMsg: Message = {
          id: 'ai-local-' + Date.now(),
          sender: 'SYSTEM_AI',
          text: aiText,
          timestamp: new Date().toISOString(),
          isMe: false,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 1200);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[5000] font-mono">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="geometric-card w-[350px] h-[500px] bg-white border-primary/30 flex flex-col mb-4 overflow-hidden shadow-2xl"
          >
            <div className="corner-accent" />
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest m-0">Grid_Comms_Link</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-slate-400 uppercase tracking-tighter">Secure. Encrypted.</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-white"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className={`text-[8px] uppercase tracking-tighter font-bold ${msg.isMe ? 'text-primary' : 'text-slate-400'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[7px] text-slate-300 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`
                    max-w-[85%] p-3 text-[11px] leading-relaxed shadow-sm
                    ${msg.isMe 
                      ? 'bg-primary text-white rounded-l-lg rounded-tr-lg border border-primary/20' 
                      : 'bg-slate-50 border border-slate-100 text-slate-600 rounded-r-lg rounded-tl-lg'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[8px] uppercase tracking-tighter font-bold text-primary">
                      SYSTEM_AI
                    </span>
                    <span className="text-[7px] text-slate-300 font-mono">
                      NOW
                    </span>
                  </div>
                  <div className="max-w-[85%] p-3 text-[11px] leading-relaxed shadow-sm bg-slate-50 border border-slate-100 text-primary uppercase font-bold tracking-wider">
                    [TRANSMITTING...]
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-100 bg-slate-50"
            >
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Transmit message..."
                  className="flex-1 bg-white border border-slate-200 px-3 py-2 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors uppercase placeholder:text-slate-300 font-bold"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button 
                  type="submit"
                  size="icon"
                  className="shrink-0 bg-primary text-white hover:bg-primary/90 h-full aspect-square shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-slate-900 flex items-center justify-center shadow-lg shadow-primary/20 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
