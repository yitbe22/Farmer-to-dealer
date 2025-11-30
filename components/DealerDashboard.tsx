import React, { useState, useRef, useEffect } from 'react';
import { Package, TrendingUp, Users, Plus, Search, Image as ImageIcon, History, Upload, Menu, X, LogOut, ChevronRight, ShoppingBag, Check, XCircle, ShoppingCart, FileText, DollarSign, Trash2, Bell } from 'lucide-react';
import { Product, Ticket, MarketPrice, HistoryLog, Language, CropOffer, InputOrder } from '../types';
import { TRANSLATIONS } from '../constants';

interface DealerDashboardProps {
  inventory: Product[];
  tickets: Ticket[];
  prices: MarketPrice[];
  offers: CropOffer[];
  orders: InputOrder[];
  language: Language;
  onUpdatePrice: (crop: string, newPrice: number) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateImage: (id: string, imageUrl: string) => void;
  onUpdateOfferStatus: (id: string, status: 'Accepted' | 'Rejected') => void;
  onUpdateOrderStatus: (id: string, status: 'Completed' | 'Cancelled') => void;
  onLogout: () => void;
}

const DealerDashboard: React.FC<DealerDashboardProps> = ({ 
  inventory, tickets, prices, offers, orders, language, onUpdatePrice, onUpdateStock, onUpdateImage, onUpdateOfferStatus, onUpdateOrderStatus, onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'INVENTORY' | 'ORDERS' | 'REQUESTS' | 'PRICES' | 'HISTORY'>('MARKETPLACE');
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const prevInventoryRef = useRef(inventory);
  const prevPricesRef = useRef(prices);

  useEffect(() => {
    // Detect Stock Changes
    inventory.forEach(item => {
      const prevItem = prevInventoryRef.current.find(p => p.id === item.id);
      if (prevItem && prevItem.stock !== item.stock) {
        const diff = item.stock - prevItem.stock;
        addHistory('Stock Update', `${item.name}: ${diff > 0 ? '+' : ''}${diff} units`);
      }
    });
    prevInventoryRef.current = inventory;
  }, [inventory]);

  useEffect(() => {
    // Detect Price Changes
    prices.forEach(item => {
      const prevItem = prevPricesRef.current.find(p => p.crop === item.crop);
      if (prevItem && prevItem.pricePerKg !== item.pricePerKg) {
        addHistory('Price Update', `${item.crop}: ${prevItem.pricePerKg} -> ${item.pricePerKg} ETB`);
      }
    });
    prevPricesRef.current = prices;
  }, [prices]);

  const addHistory = (action: string, details: string) => {
    const newLog: HistoryLog = {
      id: Date.now().toString() + Math.random(),
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newLog, ...prev]);
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdateImage(id, url);
      addHistory('Image Update', `New image uploaded for product ID ${id}`);
    }
  };

  const handleProcessOffer = (id: string, status: 'Accepted' | 'Rejected', farmer: string, crop: string) => {
      onUpdateOfferStatus(id, status);
      addHistory('Produce Bought', `${status} offer from ${farmer} for ${crop}`);
  };

  const handleProcessOrder = (id: string, status: 'Completed' | 'Cancelled', farmer: string, product: string) => {
      onUpdateOrderStatus(id, status);
      addHistory('Input Order', `${status} order for ${farmer} (${product})`);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Stock')) return <Package size={16} className="text-blue-500" />;
    if (action.includes('Price')) return <TrendingUp size={16} className="text-green-500" />;
    if (action.includes('Image')) return <ImageIcon size={16} className="text-purple-500" />;
    if (action.includes('Bought')) return <ShoppingBag size={16} className="text-emerald-500" />;
    if (action.includes('Order')) return <ShoppingCart size={16} className="text-amber-500" />;
    return <FileText size={16} className="text-slate-400" />;
  };

  const menuItems = [
    { id: 'MARKETPLACE', label: t.buying, icon: ShoppingBag }, 
    { id: 'ORDERS', label: t.orders, icon: ShoppingCart },     
    { id: 'INVENTORY', label: t.inventory, icon: Package },    
    { id: 'PRICES', label: t.market_prices, icon: TrendingUp },
    { id: 'REQUESTS', label: t.requests, icon: Users },
    { id: 'HISTORY', label: t.history, icon: History },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-emerald-500/30">
      
      {/* Luxurious Glass Header - Compacted */}
      <header className="bg-white/70 dark:bg-[#0B1120]/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 select-none group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-500 transform group-hover:scale-105 ring-4 ring-emerald-50 dark:ring-white/5">
                  <ShoppingBag size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight">Dealer<span className="font-light text-slate-500 dark:text-slate-400 ml-1">Portal</span></h1>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mt-1 opacity-80">GreenAgro</span>
              </div>
            </div>

            {/* Desktop Navigation - Compacted */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-md">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                      isActive 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} className={`transition-colors duration-300 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
               {/* Notifications (Mock) */}
               <button className="hidden md:flex w-9 h-9 rounded-full items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative">
                   <Bell size={18} />
                   <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-[#0B1120]"></span>
               </button>

              <button 
                onClick={onLogout}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
              
              {/* Mobile Hamburger */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors active:scale-95"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-2xl animate-in slide-in-from-top-2 z-40">
            <div className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-4 transition-all ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto opacity-50" size={16} />}
                  </button>
                );
              })}
              <div className="border-t border-slate-100 dark:border-white/5 my-2 pt-2">
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* 1. MARKETPLACE (Farmer Produce) */}
          {activeTab === 'MARKETPLACE' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
               {/* Hero Banner */}
               <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 dark:border-white/10 group">
                   {/* Abstract Backgrounds */}
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
                   <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full animate-pulse"></div>
                   
                   <div className="relative z-10 max-w-xl">
                       <h2 className="text-3xl font-bold mb-3 tracking-tight leading-tight">Marketplace Overview</h2>
                       <p className="text-slate-400 text-sm leading-relaxed max-w-md">Connect directly with local farmers. Acquire premium crops at fair market rates to restock your inventory effectively.</p>
                       <div className="mt-6 flex gap-3">
                           <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors">View Reports</button>
                           <button className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-bold text-xs backdrop-blur hover:bg-white/20 transition-colors">Manage Settings</button>
                       </div>
                   </div>
                   
                   {/* Stats Cards in Hero */}
                   <div className="flex gap-4 relative z-10">
                       <div className="flex flex-col items-center p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 min-w-[110px] hover:bg-white/10 transition-colors cursor-default">
                           <span className="text-3xl font-bold text-emerald-400 tracking-tighter">{offers.filter(o => o.status === 'Pending').length}</span>
                           <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-2">New Offers</span>
                       </div>
                       <div className="flex flex-col items-center p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 min-w-[110px] hover:bg-white/10 transition-colors cursor-default">
                           <span className="text-3xl font-bold text-white tracking-tighter">{offers.filter(o => o.status === 'Accepted').length}</span>
                           <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-2">Acquired</span>
                       </div>
                   </div>
               </div>

               {/* Offers Grid */}
               <div>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Pending Farmer Offers</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {offers.filter(o => o.status === 'Pending').map((offer, idx) => {
                       const marketPrice = prices.find(p => p.crop === offer.crop)?.pricePerKg || 0;
                       const estValue = offer.quantity * 100 * marketPrice;
                       
                       return (
                          <div key={offer.id} style={{animationDelay: `${idx * 100}ms`}} className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2">
                               <div className="flex justify-between items-start mb-6">
                                   <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            <Users size={24} />
                                       </div>
                                       <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{offer.crop}</h4>
                                            <p className="text-xs font-medium text-slate-500 mt-1">{offer.farmerName}</p>
                                       </div>
                                   </div>
                                   <span className="text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-1.5 rounded-full uppercase tracking-wide border border-amber-100 dark:border-amber-900/30">
                                       Pending
                                   </span>
                               </div>

                               <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                                   <div>
                                       <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-1">Quantity</div>
                                       <div className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200 tracking-tight">{offer.quantity} <span className="text-sm font-sans font-medium text-slate-400">Qtl</span></div>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-1">Value</div>
                                       <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{estValue.toLocaleString()}</div>
                                   </div>
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                   <button 
                                       onClick={() => handleProcessOffer(offer.id, 'Rejected', offer.farmerName, offer.crop)}
                                       className="py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/30 transition-all active:scale-95"
                                   >
                                       Ignore
                                   </button>
                                   <button 
                                       onClick={() => handleProcessOffer(offer.id, 'Accepted', offer.farmerName, offer.crop)}
                                       className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                                   >
                                       Accept Offer
                                   </button>
                               </div>
                          </div>
                       );
                   })}
                   {offers.filter(o => o.status === 'Pending').length === 0 && (
                       <div className="col-span-full py-24 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02]">
                           <ShoppingBag size={56} className="mx-auto mb-4 opacity-10" />
                           <p className="text-base font-medium opacity-60">No pending offers at the moment.</p>
                       </div>
                   )}
                 </div>
               </div>
            </div>
          )}

          {/* 2. ORDERS (Input Sales) */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
               <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-white/5">
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.orders}</h2>
                   <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-sm text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-white/5">
                       {orders.filter(o => o.status === 'Pending').length} Pending Orders
                   </div>
               </div>
               
               <div className="space-y-4">
                   {orders.map((order, idx) => (
                       <div key={order.id} style={{animationDelay: `${idx * 50}ms`}} className="bg-white dark:bg-[#111827] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all duration-300 group animate-in slide-in-from-bottom-2">
                           <div className="flex items-center gap-6 w-full md:w-auto">
                               <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                                   <ShoppingCart size={24} />
                               </div>
                               <div>
                                   <h3 className="font-bold text-slate-900 dark:text-white text-lg">{order.productName}</h3>
                                   <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                                       <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">{order.quantity} units</span>
                                       <span className="opacity-40">•</span>
                                       <span>{order.farmerName}</span>
                                       <span className="opacity-40">•</span>
                                       <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                                   </div>
                               </div>
                           </div>
                           
                           <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end bg-slate-50 dark:bg-black/20 md:bg-transparent p-5 md:p-0 rounded-xl md:rounded-none border border-slate-100 dark:border-white/5 md:border-none">
                               <div className="text-right">
                                   <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total</div>
                                   <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ETB {order.totalPrice.toLocaleString()}</div>
                               </div>

                               {order.status === 'Pending' ? (
                                   <div className="flex gap-3">
                                       <button 
                                          onClick={() => handleProcessOrder(order.id, 'Cancelled', order.farmerName, order.productName)}
                                          className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:rotate-90 active:scale-95"
                                          title="Reject Order"
                                       >
                                           <X size={20} />
                                       </button>
                                       <button 
                                          onClick={() => handleProcessOrder(order.id, 'Completed', order.farmerName, order.productName)}
                                          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-95"
                                       >
                                           {t.fulfill}
                                       </button>
                                   </div>
                               ) : (
                                   <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                       order.status === 'Completed' 
                                       ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                                       : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-white/5 dark:border-white/10'
                                   }`}>
                                       {order.status}
                                   </span>
                               )}
                           </div>
                       </div>
                   ))}
                   {orders.length === 0 && (
                       <div className="py-24 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem]">No input orders yet.</div>
                   )}
               </div>
            </div>
          )}

          {/* 3. INVENTORY (My Store) */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.inventory}</h2>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Refined Search Bar */}
                    <div className="relative group w-full sm:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                           <Search size={18} />
                        </div>
                        <input 
                           type="text" 
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           placeholder={t.search}
                           className="pl-11 pr-4 py-3 w-full sm:w-72 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm group-focus-within:w-full sm:group-focus-within:w-80 group-focus-within:shadow-lg dark:text-white placeholder:text-slate-400"
                        />
                    </div>

                    <button className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all shadow-lg shadow-slate-900/20 dark:shadow-emerald-600/20 active:scale-95 text-sm font-bold whitespace-nowrap">
                       <Plus size={18} /> {t.add_product}
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {inventory.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product, idx) => (
                  <div key={product.id} style={{animationDelay: `${idx * 50}ms`}} className="group bg-white dark:bg-[#111827] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 ease-out overflow-hidden flex flex-col h-full hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4">
                    
                    <div className="h-48 bg-slate-100 dark:bg-black/40 relative overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-white/5">
                          <ImageIcon size={48} strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-slate-900 dark:text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">
                          {product.category}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div>
                             <h3 className="font-bold text-lg text-white leading-snug shadow-black drop-shadow-md">{product.name}</h3>
                             <p className="text-white/80 text-xs font-medium mt-0.5">Unit: {product.unit}</p>
                          </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-6">
                           <div className="flex flex-col">
                               <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Price</span>
                               <span className="text-xl font-bold text-slate-900 dark:text-white">ETB {product.price.toLocaleString()}</span>
                           </div>
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5">
                                <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
                           </div>
                      </div>
                      
                      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.stock_level}</span>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-black/20 p-1 rounded-xl border border-slate-100 dark:border-white/5">
                          <button 
                            onClick={() => onUpdateStock(product.id, Math.max(0, product.stock - 10))} 
                            className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:shadow-md transition-all active:scale-90 flex items-center justify-center"
                          >
                              -
                          </button>
                          <span className={`font-mono font-bold w-10 text-center text-sm ${product.stock < 20 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>{product.stock}</span>
                          <button 
                            onClick={() => onUpdateStock(product.id, product.stock + 10)} 
                            className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:shadow-md transition-all active:scale-90 flex items-center justify-center"
                          >
                              +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRICES View */}
          {activeTab === 'PRICES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6">
              {prices.map((price, idx) => (
                <div key={price.crop} style={{animationDelay: `${idx * 100}ms`}} className="bg-white dark:bg-[#111827] p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between transition-all hover:shadow-xl hover:border-emerald-500/20 group">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{price.crop}</h3>
                      <p className="text-slate-500 text-xs mt-2 font-medium flex items-center gap-1.5">
                        <History size={12} />
                        {t.last_updated}: {new Date(price.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-2xl ${price.trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'} border border-transparent dark:border-white/5`}>
                      <TrendingUp size={24} className={price.trend === 'down' ? 'rotate-180' : ''} />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-4">
                         <div className="relative flex-1 group/input">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none group-focus-within/input:text-emerald-500 transition-colors">ETB</span>
                           <input 
                             type="number" 
                             value={price.pricePerKg}
                             onChange={(e) => onUpdatePrice(price.crop, parseFloat(e.target.value))}
                             className="w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0B1120] rounded-xl font-bold text-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                           />
                         </div>
                         <span className="text-slate-500 dark:text-slate-400 text-sm font-bold whitespace-nowrap">/ kg</span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REQUESTS View */}
          {activeTab === 'REQUESTS' && (
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] shadow-lg border border-slate-200 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-6">
               <div className="p-8 border-b border-slate-100 dark:border-white/5">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.requests}</h2>
               </div>
               
               <div className="overflow-x-auto">
                   <table className="w-full text-left whitespace-nowrap">
                     <thead className="bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                       <tr>
                         <th className="px-8 py-5">{t.farmer}</th>
                         <th className="px-8 py-5">Phone</th>
                         <th className="px-8 py-5">Issue</th>
                         <th className="px-8 py-5">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                       {tickets.map(ticket => (
                         <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                           <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">{ticket.farmerName}</td>
                           <td className="px-8 py-6 text-slate-500 font-mono text-xs bg-slate-50/50 dark:bg-white/5 rounded-lg w-min px-3 py-1 m-4">{ticket.phoneNumber}</td>
                           <td className="px-8 py-6 text-slate-600 dark:text-slate-300 max-w-xs truncate text-sm font-medium">{ticket.issue}</td>
                           <td className="px-8 py-6">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                               ticket.status === 'Open' 
                               ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400' 
                               : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400'
                             }`}>{ticket.status}</span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
               </div>
            </div>
          )}
          
          {/* HISTORY View (Enhanced) */}
          {activeTab === 'HISTORY' && (
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] shadow-lg border border-slate-200 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-6 flex flex-col h-full max-h-[600px]">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <History size={24} className="text-emerald-600" />
                        {t.history}
                    </h2>
                    {history.length > 0 && (
                        <button 
                            onClick={() => setHistory([])}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all flex items-center gap-2 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                        >
                            <Trash2 size={14} /> Clear Log
                        </button>
                    )}
                </div>
                
                <div className="overflow-y-auto p-0 custom-scrollbar flex-1 bg-white dark:bg-[#111827]">
                {history.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {history.map(log => (
                            <div key={log.id} className="flex gap-6 p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className="mt-1 w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:shadow-md transition-all duration-300">
                                    {getActionIcon(log.action)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</span>
                                        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed font-medium">{log.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <History size={32} className="opacity-40" strokeWidth={1.5} />
                        </div>
                        <p className="text-base font-medium opacity-60">No recent activity recorded.</p>
                    </div>
                )}
                </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DealerDashboard;