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
  onAddProduct: (product: Omit<Product, 'id' | 'image'>) => void;
  onLogout: () => void;
}

const DealerDashboard: React.FC<DealerDashboardProps> = ({ 
  inventory, tickets, prices, offers, orders, language, onUpdatePrice, onUpdateStock, onUpdateImage, onUpdateOfferStatus, onUpdateOrderStatus, onAddProduct, onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'INVENTORY' | 'ORDERS' | 'REQUESTS' | 'PRICES' | 'HISTORY'>('MARKETPLACE');
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'Seeds' | 'Fertilizer' | 'Tools' | 'Pesticide'>('Seeds');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('');

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

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProductName || !newProductPrice || !newProductStock || !newProductUnit) return;

      onAddProduct({
          name: newProductName,
          category: newProductCategory,
          price: parseFloat(newProductPrice),
          stock: parseInt(newProductStock),
          unit: newProductUnit
      });
      
      addHistory('Stock Added', `Added ${newProductName}`);
      
      // Reset and Close
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewProductUnit('');
      setIsAddModalOpen(false);
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
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-emerald-500/30 relative">
      
      {/* Luxurious Glass Header - Compacted */}
      <header className="bg-slate-900/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-b border-slate-800 dark:border-white/5 sticky top-0 z-40 transition-all duration-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 select-none group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-500 transform group-hover:scale-105">
                  <ShoppingBag size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                  <h1 className="text-lg font-bold text-white leading-none tracking-tight">{t.dealer_portal}</h1>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-1 opacity-80">{t.green_agro}</span>
              </div>
            </div>

            {/* Desktop Navigation - Compacted */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50 backdrop-blur-md">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon size={14} className={`transition-colors duration-300 ${isActive ? 'text-white' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
               {/* Notifications (Mock) */}
               <button className="hidden md:flex w-9 h-9 rounded-full items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors relative">
                   <Bell size={18} />
                   <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-900"></span>
               </button>

              <button 
                onClick={onLogout}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-slate-800 rounded-full"
              >
                <LogOut size={16} />
                <span>{t.logout}</span>
              </button>
              
              {/* Mobile Hamburger */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 shadow-2xl animate-in slide-in-from-top-2 z-40">
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
                        ? 'bg-emerald-600/20 text-emerald-400 shadow-sm' 
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                    {item.label}
                    {isActive && <ChevronRight className="ml-auto opacity-50" size={16} />}
                  </button>
                );
              })}
              <div className="border-t border-slate-700 my-2 pt-2">
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-4 text-red-400 hover:bg-red-900/10 transition-colors"
                >
                  <LogOut size={18} />
                  {t.logout}
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
                       <h2 className="text-3xl font-bold mb-3 tracking-tight leading-tight">{t.marketplace_overview}</h2>
                       <p className="text-slate-400 text-sm leading-relaxed max-w-md">{t.marketplace_desc}</p>
                       <div className="mt-6 flex gap-3">
                           <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors">{t.view_reports}</button>
                           <button className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-bold text-xs backdrop-blur hover:bg-white/20 transition-colors">{t.manage_settings}</button>
                       </div>
                   </div>
                   
                   {/* Stats Cards in Hero */}
                   <div className="flex gap-4 relative z-10">
                       <div className="flex flex-col items-center p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 min-w-[110px] hover:bg-white/10 transition-colors cursor-default">
                           <span className="text-3xl font-bold text-emerald-400 tracking-tighter">{offers.filter(o => o.status === 'Pending').length}</span>
                           <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-2">{t.new_offers}</span>
                       </div>
                       <div className="flex flex-col items-center p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 min-w-[110px] hover:bg-white/10 transition-colors cursor-default">
                           <span className="text-3xl font-bold text-white tracking-tighter">{offers.filter(o => o.status === 'Accepted').length}</span>
                           <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-2">{t.acquired}</span>
                       </div>
                   </div>
               </div>

               {/* Offers Grid */}
               <div>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.pending_offers}</h3>
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
                                       {t.pending}
                                   </span>
                               </div>

                               <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                                   <div>
                                       <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-1">{t.quantity}</div>
                                       <div className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200 tracking-tight">{offer.quantity} <span className="text-sm font-sans font-medium text-slate-400">Qtl</span></div>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-1">{t.value}</div>
                                       <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{estValue.toLocaleString()}</div>
                                   </div>
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                   <button 
                                       onClick={() => handleProcessOffer(offer.id, 'Rejected', offer.farmerName, offer.crop)}
                                       className="py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/30 transition-all active:scale-95"
                                   >
                                       {t.ignore}
                                   </button>
                                   <button 
                                       onClick={() => handleProcessOffer(offer.id, 'Accepted', offer.farmerName, offer.crop)}
                                       className="py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                                   >
                                       {t.accept_offer}
                                   </button>
                               </div>
                          </div>
                       );
                   })}
                   {offers.filter(o => o.status === 'Pending').length === 0 && (
                       <div className="col-span-full py-24 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02]">
                           <ShoppingBag size={56} className="mx-auto mb-4 opacity-10" />
                           <p className="text-base font-medium opacity-60">{t.no_pending_offers}</p>
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
                       {orders.filter(o => o.status === 'Pending').length} {t.pending_orders}
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
                                       <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">{order.quantity} {t.unit}s</span>
                                       <span className="opacity-40">•</span>
                                       <span>{order.farmerName}</span>
                                       <span className="opacity-40">•</span>
                                       <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                                   </div>
                               </div>
                           </div>
                           
                           <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end bg-slate-50 dark:bg-black/20 md:bg-transparent p-5 md:p-0 rounded-xl md:rounded-none border border-slate-100 dark:border-white/5 md:border-none">
                               <div className="text-right">
                                   <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{t.total}</div>
                                   <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ETB {order.totalPrice.toLocaleString()}</div>
                               </div>

                               {order.status === 'Pending' ? (
                                   <div className="flex gap-3">
                                       <button 
                                          onClick={() => handleProcessOrder(order.id, 'Cancelled', order.farmerName, order.productName)}
                                          className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:rotate-90 active:scale-95"
                                          title={t.reject_order}
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
                       <div className="py-24 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem]">{t.no_orders_yet}</div>
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

                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all shadow-lg shadow-slate-900/20 dark:shadow-emerald-600/20 active:scale-95 text-sm font-bold whitespace-nowrap"
                    >
                       <Plus size={18} /> {t.add_product}
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {inventory.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product, idx) => (
                  <div key={product.id} style={{animationDelay: `${idx * 50}ms`}} className="group bg-white dark:bg-[#111827] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 ease-out overflow-hidden flex flex-col h-full hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4">
                    
                    <div className="h-48 bg-slate-100 dark:bg-black/40 relative overflow-hidden group/image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-white/5">
                          <ImageIcon size={48} strokeWidth={1} />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                      
                      {/* Image Upload Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white p-3 rounded-full border border-white/40 shadow-xl transition-all active:scale-95 flex items-center gap-2 px-4 backdrop-blur-md">
                          <Upload size={18} />
                          <span className="text-xs font-bold">{t.upload_image}</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(product.id, e)} />
                        </label>
                      </div>

                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-slate-900 dark:text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">
                          {product.category}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div>
                             <h3 className="font-bold text-lg text-white leading-snug shadow-black drop-shadow-md">{product.name}</h3>
                             <p className="text-white/80 text-xs font-medium mt-0.5">{t.unit}: {product.unit}</p>
                          </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-6">
                           <div className="flex flex-col">
                               <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t.price}</span>
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
                            <Trash2 size={14} /> {t.clear_log}
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
                        <p className="text-base font-medium opacity-60">{t.no_activity}</p>
                    </div>
                )}
                </div>
            </div>
          )}

        </div>
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Plus className="text-emerald-500" size={24} /> {t.add_product}
                    </h3>
                    <button 
                        onClick={() => setIsAddModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product Name</label>
                            <input 
                                type="text"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                placeholder="e.g. Improved Seeds"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {['Seeds', 'Fertilizer', 'Tools', 'Pesticide'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setNewProductCategory(cat as any)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all whitespace-nowrap ${
                                            newProductCategory === cat 
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/50 dark:text-emerald-400' 
                                            : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price (ETB)</label>
                                <input 
                                    type="number"
                                    value={newProductPrice}
                                    onChange={(e) => setNewProductPrice(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                    placeholder="0.00"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Qty</label>
                                <input 
                                    type="number"
                                    value={newProductStock}
                                    onChange={(e) => setNewProductStock(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unit</label>
                            <input 
                                type="text"
                                value={newProductUnit}
                                onChange={(e) => setNewProductUnit(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                placeholder="e.g. kg, quintal, pcs"
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                Add Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DealerDashboard;