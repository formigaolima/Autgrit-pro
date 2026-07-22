import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  X, 
  Zap, 
  Shield, 
  ArrowUpRight,
  Filter,
  Package,
  User,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
}

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Neural_Overdrive_X', category: 'Hardware', price: '0.45 ETH', rating: 4.9, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400' },
  { id: 'p2', name: 'Secure_Node_V3', category: 'Security', price: '0.12 ETH', rating: 4.8, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400' },
  { id: 'p3', name: 'Bio_Sync_Link', category: 'Wearable', price: '0.08 ETH', rating: 4.7, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400' },
  { id: 'p4', name: 'Quantum_Shield_Alpha', category: 'Software', price: '0.05 ETH', rating: 5.0, image: 'https://images.unsplash.com/photo-1558494949-ef8b56b5141e?auto=format&fit=crop&q=80&w=400' },
  { id: 'p5', name: 'Urban_Logistics_Core', category: 'Software', price: '0.22 ETH', rating: 4.6, image: 'https://images.unsplash.com/photo-1586528116311-ad86d6f35b41?auto=format&fit=crop&q=80&w=400' },
  { id: 'p6', name: 'Encrypted_Uplink_Module', category: 'Hardware', price: '0.18 ETH', rating: 4.9, image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=400' },
];

export const MarketplaceModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleMode, setRoleMode] = useState<'cliente' | 'lavoratore'>('cliente');
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Hardware');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [vendorLogs, setVendorLogs] = useState<string[]>([]);

  const filteredProducts = productsList.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-8 border-b border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground uppercase tracking-[0.3em] flex items-center gap-4">
            <ShoppingBag className="w-6 h-6 text-primary" />
            MERCATO_CENTRAL
          </h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">High-integrity decentralized product registry</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              placeholder="Search_Node..."
              className="w-full bg-slate-50 border border-slate-200 p-2 pl-10 text-[10px] font-mono uppercase tracking-widest outline-none focus:border-primary transition-colors font-bold text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="w-12 h-12 border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors rounded-lg">
            <X className="w-6 h-6 text-slate-400 font-bold" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-8 space-y-4 md:space-y-8 bg-slate-50/30 shrink-0 overflow-y-auto">
          {/* Due Tasti di Ruolo: Cliente e Venditore */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setRoleMode('cliente')}
              className={`py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer ${
                roleMode === 'cliente'
                  ? 'bg-primary text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 bg-transparent'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Clienti
            </button>
            <button
              onClick={() => setRoleMode('lavoratore')}
              className={`py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer ${
                roleMode === 'lavoratore'
                  ? 'bg-primary text-white shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 bg-transparent'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Venditori
            </button>
          </div>

          {roleMode === 'cliente' ? (
            <>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Filter className="w-3 h-3 text-primary" /> Filtri Categorie
                </h4>
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar pb-2 md:pb-0">
                  {['All', 'Hardware', 'Software', 'Security', 'Wearable'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 md:w-full text-left px-4 py-2.5 md:p-3 text-[10px] uppercase font-mono tracking-widest border transition-all rounded-lg font-bold ${
                        activeCategory === cat ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden md:block geometric-card bg-primary/5 border-primary/20 p-6 shadow-sm">
                <Shield className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-[10px] font-bold text-foreground mb-2 uppercase tracking-widest">AG_SEC_VERIFIED</p>
                <p className="text-[8px] text-slate-500 leading-relaxed uppercase tracking-wider font-bold">All assets in this registry have undergone rigorous automated security validation.</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="geometric-card bg-slate-900 text-white p-5 border-primary/20 relative">
                <p className="text-[8px] font-mono uppercase tracking-widest text-primary font-bold">STATO PROFILO</p>
                <p className="text-xs font-heading font-bold uppercase mt-1">Venditore Certificato</p>
                <p className="text-[8px] text-slate-400 uppercase mt-2 font-bold font-mono">ID: VEN_0X18A2</p>
              </div>

              <div className="p-4 bg-emerald-550/10 border border-emerald-500/20 rounded-xl space-y-1">
                <p className="text-[8px] font-mono text-emerald-600 uppercase tracking-wider font-extrabold">Transazioni Completate</p>
                <p className="text-xl font-mono text-emerald-600 font-extrabold">12.80 ETH</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid or Vendor Space */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar bg-slate-50/50">
          {roleMode === 'lavoratore' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8 animate-status-shimmer"
            >
              <div className="bg-white border border-slate-150 p-8 rounded-xl space-y-4 shadow-sm relative text-slate-800">
                <div className="corner-accent" />
                <h3 className="text-lg font-heading font-bold uppercase tracking-widest text-foreground flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  PUBBLICA NUOVO ASSET DIGITALE
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-loose font-bold">
                  Qualsiasi prestatore di servizi informatici can list an item on the AutGrit marketplace.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">NOME PRODOTTO</label>
                    <input
                      type="text"
                      placeholder="es. Sentinel_Key_v4"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 text-[10px] font-mono rounded"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">CATEGORIA</label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-[10px] font-mono rounded"
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Security">Security</option>
                      <option value="Wearable">Wearable</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">PREZZO RICHIESTO</label>
                    <input
                      type="text"
                      placeholder="es. 0.15 ETH"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 text-[10px] font-mono rounded"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      if (!newProductName.trim() || !newProductPrice.trim()) return;
                      const newId = `p${productsList.length + 1}`;
                      const newItem: Product = {
                        id: newId,
                        name: newProductName,
                        category: newProductCategory,
                        price: newProductPrice,
                        rating: 4.8,
                        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400'
                      };
                      setProductsList(prev => [...prev, newItem]);
                      setVendorLogs(prev => [`[${new Date().toLocaleTimeString()}] ASSET_LISTING: Pubblicato ${newProductName} per ${newProductPrice}.`, ...prev]);
                      setNewProductName('');
                      setNewProductPrice('');
                    }}
                    className="bg-primary text-white uppercase tracking-widest font-bold px-6 h-10 shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    Pubblica Asset Nel Registro
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-800">
                <div className="bg-white border border-slate-150 p-6 rounded-xl space-y-3 shadow-sm text-left">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DURA ADYEN SPLITTING VENDITORI</h4>
                  <div className="divide-y divide-slate-150 font-mono text-[10px] uppercase">
                    <div className="flex py-2 justify-between">
                      <span>Platform Commission fee:</span>
                      <span className="text-primary font-bold">10%</span>
                    </div>
                    <div className="flex py-2 justify-between">
                      <span>Quota Venditore:</span>
                      <span className="text-emerald-650 font-bold">90%</span>
                    </div>
                    <div className="flex py-2 justify-between">
                      <span>Accordo Split Adyen:</span>
                      <span className="text-emerald-650 font-bold font-mono">CONTRATTO_STIPULATO</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-6 rounded-xl space-y-3 shadow-sm flex flex-col justify-start text-left">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REGISTRI INTERNI MARKETPLACE</h4>
                  <div className="flex-1 p-3 bg-slate-50 border border-slate-150 rounded-lg max-h-36 overflow-y-auto space-y-1">
                    {vendorLogs.length === 0 ? (
                      <p className="text-[9px] text-slate-400 font-mono italic text-center uppercase py-4">Nessuna transazione registrata.</p>
                    ) : (
                      vendorLogs.map((log, index) => (
                        <p key={index} className="text-[8px] font-mono text-slate-600 uppercase">{log}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="geometric-card group hover:border-primary/50 transition-all cursor-pointer flex flex-col h-full overflow-hidden bg-white shadow-sm hover:shadow-xl text-slate-800"
                    >
                      <div className="corner-accent" />
                      <div className="aspect-video bg-slate-100 border-b border-slate-100 overflow-hidden relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 border border-slate-100 text-[10px] font-mono text-primary font-bold shadow-sm rounded">
                          {product.price}
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4 text-left">
                          <div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest leading-tight">{product.name}</h3>
                          </div>
                          <Zap className="w-4 h-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex items-center gap-1 mb-8">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < Math.floor(product.rating) ? 'bg-primary' : 'bg-slate-200'}`} />
                          ))}
                          <span className="text-[8px] text-slate-400 font-bold ml-2 font-mono">[{product.rating.toFixed(1)}]</span>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center group-hover:text-primary transition-colors">
                          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">View Node</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-400">
                  <Package className="w-16 h-16 mb-6" />
                  <p className="text-[10px] font-bold font-mono uppercase tracking-[0.5em]">No matching assets found in registry</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
