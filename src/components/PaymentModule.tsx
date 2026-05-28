import React, { useState } from 'react';
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
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  asset: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  address: string;
  hash: string;
  gasPrice: string;
  blockNumber: string;
}

const HISTORY: Transaction[] = [
  { 
    id: 'tx1', 
    type: 'send', 
    amount: '0.045', 
    asset: 'ETH', 
    status: 'confirmed', 
    timestamp: '2026-04-24T14:22:00Z', 
    address: '0x71...F23A',
    hash: '0x8f2...e4a1',
    gasPrice: '24 Gwei',
    blockNumber: '19,456,221'
  },
  { 
    id: 'tx2', 
    type: 'receive', 
    amount: '1.200', 
    asset: 'USDT', 
    status: 'confirmed', 
    timestamp: '2026-04-23T09:12:00Z', 
    address: '0x22...E89B',
    hash: '0x3d4...b9c0',
    gasPrice: '18 Gwei',
    blockNumber: '19,451,004'
  },
  { 
    id: 'tx3', 
    type: 'send', 
    amount: '0.005', 
    asset: 'BTC', 
    status: 'pending', 
    timestamp: '2026-04-24T23:55:00Z', 
    address: 'bc1q...x9p2',
    hash: '0x1a2...f5d6',
    gasPrice: 'N/A',
    blockNumber: 'Pending'
  },
];

export const PaymentModule: React.FC<{ onClose: () => void; balance: { eth: string } }> = ({ onClose, balance }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'receive' | 'history'>('overview');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-slate-200/40 backdrop-blur-sm flex flex-col items-center justify-center p-0 sm:p-6 md:p-12"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="geometric-card w-full max-w-4xl bg-white border-primary/20 flex flex-col h-full sm:h-auto sm:max-h-[800px] overflow-hidden shadow-2xl rounded-none sm:rounded-2xl"
      >
        <div className="corner-accent" />
        
        {/* Header */}
        <div className="p-4 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground uppercase tracking-[0.3em] flex items-center gap-4">
              <CreditCard className="w-5 h-5 text-primary" />
              PAGO_TERMINAL_V1
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Unified secure payment & asset management</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
          {/* Internal Navigation */}
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-6 flex flex-row md:flex-col gap-2 bg-slate-50/30 overflow-x-auto no-scrollbar shrink-0 animate-in fade-in duration-300">
            {[
              { id: 'overview', icon: Zap, label: 'Overview' },
              { id: 'send', icon: Send, label: 'Send' },
              { id: 'receive', icon: Download, label: 'Receive' },
              { id: 'history', icon: History, label: 'History' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-2.5 md:p-3 text-[10px] uppercase font-mono tracking-widest transition-all rounded-lg font-bold shrink-0 ${
                  activeTab === tab.id ? 'text-primary bg-primary/5 shadow-sm border border-primary/10' : 'text-slate-400 hover:text-primary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-10 overflow-y-auto no-scrollbar bg-white">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="geometric-card bg-primary text-white border-primary space-y-6 shadow-xl shadow-primary/20">
                      <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Main_Net Balance</p>
                      <h3 className="text-4xl font-heading font-bold text-white tracking-tighter">
                        {balance.eth} <span className="text-lg text-white/50">ETH</span>
                      </h3>
                      <div className="flex gap-3">
                        <Button className="h-8 text-[9px] uppercase tracking-widest px-4 font-bold bg-white text-primary hover:bg-white/90">Withdraw</Button>
                        <Button variant="outline" className="h-8 text-[9px] uppercase tracking-widest px-4 border-white/20 text-white hover:bg-white/10">Add Funds</Button>
                      </div>
                    </div>
                    <div className="geometric-card border-slate-100 bg-slate-50 flex items-center justify-center relative shadow-sm">
                      <RefreshCw className="absolute top-4 right-4 w-4 h-4 text-slate-200" />
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">Portfolio Value</p>
                        <h3 className="text-2xl font-bold text-foreground">$4,288.52</h3>
                        <p className="text-[8px] text-emerald-500 mt-1 uppercase font-bold">+12.4% vs Prev_Cycle</p>
                      </div>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Asset_Allocation</h4>
                     <div className="space-y-3">
                        {['Ethereum', 'Bitcoin', 'Solana', 'USDT'].map((asset, i) => (
                           <div key={asset} className="flex items-center gap-4 p-4 bg-white border border-slate-100 shadow-sm rounded-lg hover:shadow-md transition-shadow">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                 <Zap className="w-4 h-4 text-primary/30" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">{asset}</p>
                                 <div className="w-full h-1 bg-slate-50 mt-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${80 - i * 15}%` }} />
                                 </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{(0.12 * (i+1)).toFixed(2)}</span>
                           </div>
                        ))}
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
                  className="max-w-md mx-auto space-y-8 py-10"
                >
                  <div className="text-center mb-8">
                     <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Send className="w-8 h-8 text-primary" />
                     </div>
                     <h3 className="text-lg font-bold text-foreground uppercase tracking-widest">SEND_ASSETS</h3>
                     <p className="text-[10px] text-slate-400 uppercase mt-2 font-bold">Execute p2p protocol transfer</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Recipient_Address</label>
                        <input 
                           placeholder="0x... or node name"
                           className="w-full bg-slate-50 border border-slate-200 p-4 text-xs font-mono text-foreground outline-none focus:border-primary transition-colors font-bold rounded-lg"
                           value={recipient}
                           onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Amount</label>
                        <div className="relative">
                           <input 
                              type="number"
                              placeholder="0.00"
                              className="w-full bg-slate-50 border border-slate-200 p-4 pr-16 text-xl font-bold font-mono text-foreground outline-none focus:border-primary transition-colors rounded-lg"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                           />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">ETH</span>
                        </div>
                    </div>
                  </div>

                  <Button className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest text-xs group shadow-xl shadow-primary/20">
                    INITIATE_TRANSFER <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {activeTab === 'receive' && (
                <motion.div
                  key="receive"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md mx-auto space-y-8 py-10 text-center"
                >
                  <div className="w-48 h-48 mx-auto bg-white p-4 relative shadow-2xl rounded-xl border border-slate-100">
                     {/* Simulating QR */}
                     <div className="w-full h-full border-4 border-slate-50 flex items-center justify-center">
                        <Zap className="w-24 h-24 text-primary opacity-20" />
                     </div>
                     <Plus className="absolute -top-2 -left-2 text-primary" />
                     <Plus className="absolute -bottom-2 -right-2 text-primary" />
                  </div>
                  
                  <div className="space-y-4">
                     <h3 className="text-lg font-bold text-foreground uppercase tracking-widest">Your_Public_Key</h3>
                     <div className="p-4 bg-slate-50 border border-slate-100 font-mono text-xs text-primary break-all select-all font-bold rounded-lg shadow-inner">
                        0x71C6908AC48450A9E7287395240E89B
                     </div>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Only send ETH or ERC-20 assets to this address.</p>
                  </div>

                  <Button variant="outline" className="w-full border-slate-200 text-xs font-bold uppercase tracking-widest py-6 rounded-lg hover:bg-slate-50">Copy_Link</Button>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction_Log</h4>
                    <span className="text-[8px] font-mono text-slate-300 uppercase">Archive synced</span>
                  </div>
                  
                  {HISTORY.map(tx => (
                    <div key={tx.id} className="space-y-2">
                      <div 
                        onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
                        className={`geometric-card bg-white border-slate-100 p-6 flex justify-between items-center group cursor-pointer transition-all shadow-sm hover:shadow-md ${
                          selectedTx === tx.id ? 'border-primary/40 ring-1 ring-primary/10 bg-slate-50/30' : 'hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full border shadow-sm ${
                              tx.type === 'send' ? 'border-amber-500/30 bg-amber-50 text-amber-500' : 'border-emerald-500/30 bg-emerald-50 text-emerald-500'
                            }`}>
                              {tx.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-foreground uppercase tracking-widest">{tx.type.toUpperCase()}_ASSETS</p>
                                <p className="text-[9px] text-slate-400 font-mono mt-1 uppercase font-bold">{tx.address} • {new Date(tx.timestamp).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div>
                                <p className={`text-sm font-mono font-bold ${
                                  tx.type === 'send' ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                  {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.asset}
                                </p>
                                <span className={`text-[8px] uppercase tracking-[0.2em] font-bold ${
                                  tx.status === 'confirmed' ? 'text-emerald-500' : 'text-amber-500 text-animate-pulse'
                                }`}>{tx.status}</span>
                            </div>
                            <ArrowRight className={`w-4 h-4 text-slate-200 transition-transform ${selectedTx === tx.id ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`} />
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
                            <div className="mx-6 p-6 bg-slate-50 border-x border-b border-slate-100 rounded-b-xl space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                           <Hash className="w-2 h-2" /> Transaction_Hash
                                        </p>
                                        <p className="text-[10px] font-mono text-primary font-bold break-all flex items-center gap-2">
                                           {tx.hash} <ExternalLink className="w-2.5 h-2.5 cursor-pointer hover:text-primary/70" />
                                        </p>
                                     </div>
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                           <FileText className="w-2 h-2" /> Block_Number
                                        </p>
                                        <p className="text-[10px] font-mono text-foreground font-bold">{tx.blockNumber}</p>
                                     </div>
                                  </div>
                                  <div className="space-y-4">
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Network_Gas_Price</p>
                                        <p className="text-[10px] font-mono text-foreground font-bold">{tx.gasPrice}</p>
                                     </div>
                                     <div>
                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-1">Execution_Time</p>
                                        <p className="text-[10px] font-mono text-foreground font-bold">{new Date(tx.timestamp).toLocaleString()}</p>
                                     </div>
                                  </div>
                               </div>
                               <div className="pt-4 border-t border-slate-200/50 flex justify-end">
                                  <a 
                                    href={`https://etherscan.io/tx/${tx.hash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 hover:underline"
                                  >
                                    View on Explorer <ArrowRight className="w-3 h-3" />
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
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8px] font-mono text-slate-300 uppercase tracking-widest font-bold">
           <div className="flex gap-6">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SECURE_UPLINK</span>
              <span>NETWORK: ETHEREUM_MAINNET</span>
           </div>
           <span>PROTOCOL_VERSION: 1.0.42_DELTA</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
