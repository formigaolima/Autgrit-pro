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
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initializing Socket.io connection
    socketRef.current = io();

    socketRef.current.on('message', (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isMe: data.socketId === socketRef.current?.id,
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
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    const messageData = {
      sender: 'OPERATOR_PRO',
      text: inputValue,
      socketId: socketRef.current.id,
    };

    socketRef.current.emit('message', messageData);
    setInputValue('');
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
