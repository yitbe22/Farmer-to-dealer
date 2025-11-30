import React, { useState, useEffect } from 'react';
import { Smartphone, Store, Headset, Sprout, Moon, Sun, Globe, Phone as PhoneIcon, Grip, MonitorSmartphone } from 'lucide-react';
import USSDSimulator from './components/USSDSimulator';
import SMSSimulator from './components/SMSSimulator';
import DealerDashboard from './components/DealerDashboard';
import CallCenterDashboard from './components/CallCenterDashboard';
import Login from './components/Login';
import FeaturePhone from './components/FeaturePhone';
import { UserRole, Product, Ticket, MarketPrice, Language, CropOffer, InputOrder, SMSMessage } from './types';
import { INITIAL_PRODUCTS, INITIAL_PRICES, INITIAL_TICKETS, INITIAL_OFFERS, INITIAL_ORDERS, TRANSLATIONS, ETHIOPIAN_NAMES } from './constants';
import { generateFarmingTip, generateSMSReply } from './services/geminiService';

const App: React.FC = () => {
  // Global App State (Database Simulation)
  const [role, setRole] = useState<UserRole>(UserRole.FARMER);
  const [farmerView, setFarmerView] = useState<'USSD' | 'SMS'>('USSD');
  const [farmerDeviceType, setFarmerDeviceType] = useState<'SMARTPHONE' | 'FEATURE_PHONE'>('SMARTPHONE');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showFarmerPhone, setShowFarmerPhone] = useState(false);
  
  // Auth State
  const [isDealerLoggedIn, setIsDealerLoggedIn] = useState(false);
  
  // Data State
  const [inventory, setInventory] = useState<Product[]>(INITIAL_PRODUCTS);
  const [prices, setPrices] = useState<MarketPrice[]>(INITIAL_PRICES);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [offers, setOffers] = useState<CropOffer[]>(INITIAL_OFFERS);
  const [inputOrders, setInputOrders] = useState<InputOrder[]>(INITIAL_ORDERS);
  
  // Lifted SMS State
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([
    { id: '1', sender: 'System', text: 'ALERT: Heavy rains expected in Oromia region. Secure Teff harvest.', timestamp: new Date().toISOString() }
  ]);

  const t = TRANSLATIONS[language];

  // Initialize Farming Tip
  useEffect(() => {
    const fetchTip = async () => {
      // Removed artificial delay for faster loading
      const tip = await generateFarmingTip();
      // Avoid duplicate tip if re-rendered
      setSmsMessages(prev => {
        if (prev.some(m => m.text.includes('DAILY TIP'))) return prev;
        return [...prev, {
          id: Date.now().toString(),
          sender: 'System',
          text: `DAILY TIP: ${tip}`,
          timestamp: new Date().toISOString()
        }];
      });
    };
    fetchTip();
  }, []);

  // Handlers
  const handleSendMessage = async (text: string) => {
    const userMsg: SMSMessage = {
      id: Date.now().toString(),
      sender: 'Farmer',
      text: text,
      timestamp: new Date().toISOString()
    };
    setSmsMessages(prev => [...prev, userMsg]);

    // Generate AI Reply
    try {
      const replyText = await generateSMSReply(text);
      const systemReply: SMSMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'System',
        text: replyText,
        timestamp: new Date().toISOString()
      };
      setSmsMessages(prev => [...prev, systemReply]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePrice = (crop: string, newPrice: number) => {
    setPrices(prev => prev.map(p => p.crop === crop ? { ...p, pricePerKg: newPrice, lastUpdated: new Date().toISOString() } : p));
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const handleUpdateProductImage = (id: string, imageUrl: string) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, image: imageUrl } : p));
  };

  const handleCreateTicket = (issue: string) => {
    const newTicket: Ticket = {
      id: `T-${Math.floor(Math.random() * 10000)}`,
      farmerName: 'Mobile User',
      phoneNumber: '+251...',
      issue,
      status: 'Open',
      timestamp: new Date().toISOString(),
      priority: 'Medium'
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleCreateOffer = (crop: string, quantity: number) => {
    // Pick a random Ethiopian name
    const randomName = ETHIOPIAN_NAMES[Math.floor(Math.random() * ETHIOPIAN_NAMES.length)];
    
    const newOffer: CropOffer = {
        id: `O-${Math.floor(Math.random() * 10000)}`,
        farmerName: randomName,
        crop: crop,
        quantity: quantity,
        status: 'Pending',
        timestamp: new Date().toISOString(),
    };
    setOffers(prev => [newOffer, ...prev]);
  };

  const handleCreateInputOrder = (productId: string, quantity: number) => {
      const product = inventory.find(p => p.id === productId);
      if (!product) return;
      
      const newOrder: InputOrder = {
          id: `OR-${Math.floor(Math.random() * 10000)}`,
          farmerName: 'Mobile User',
          productName: product.name,
          quantity: quantity,
          totalPrice: product.price * quantity,
          status: 'Pending',
          timestamp: new Date().toISOString(),
      };
      setInputOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOfferStatus = (id: string, status: 'Accepted' | 'Rejected') => {
      // Update the offer status
      setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));

      // Send SMS if accepted
      if (status === 'Accepted') {
        const offer = offers.find(o => o.id === id);
        if (offer) {
          const price = prices.find(p => p.crop === offer.crop)?.pricePerKg || 0;
          const total = offer.quantity * 100 * price;
          
          const rawMsg = t.sms_accepted || "DEAL ALERT: Your offer for {qty} Qtl of {crop} has been ACCEPTED. Total: {total} ETB. Call: 0911-55-44-22";
          
          const messageText = rawMsg
            .replace('{qty}', offer.quantity.toString())
            .replace('{crop}', offer.crop)
            .replace('{total}', total.toLocaleString());

          const sms: SMSMessage = {
            id: Date.now().toString(),
            sender: 'System',
            text: messageText,
            timestamp: new Date().toISOString()
          };
          
          setSmsMessages(prev => [...prev, sms]);
          // Open the phone widget to show the magic
          setShowFarmerPhone(true);
        }
      }
  };

  const handleUpdateOrderStatus = (id: string, status: 'Completed' | 'Cancelled') => {
      setInputOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

      // Send SMS if Completed (Fulfilled)
      if (status === 'Completed') {
        const order = inputOrders.find(o => o.id === id);
        if (order) {
            const rawMsg = t.sms_order_fulfilled || "ORDER READY: {qty}x {product}. Total: {total} ETB. Contact Dealer: 0911-55-44-22.";
            const messageText = rawMsg
                .replace('{qty}', order.quantity.toString())
                .replace('{product}', order.productName)
                .replace('{total}', order.totalPrice.toLocaleString());

            const sms: SMSMessage = {
                id: Date.now().toString(),
                sender: 'System',
                text: messageText,
                timestamp: new Date().toISOString()
            };
            
            setSmsMessages(prev => [...prev, sms]);
            setShowFarmerPhone(true);
        }
      }
  };

  const handleResolveTicket = (id: string, resolution: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    
    // Send SMS with resolution
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      const sms: SMSMessage = {
        id: Date.now().toString(),
        sender: 'System',
        text: `SUPPORT UPDATE: Your ticket regarding "${ticket.issue.substring(0, 15)}..." has been resolved. Notes: ${resolution}`,
        timestamp: new Date().toISOString()
      };
      setSmsMessages(prev => [...prev, sms]);
      setShowFarmerPhone(true);
    }
  };

  return (
    <div className={`h-full w-full ${isDarkMode ? 'dark' : ''}`}>
      <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative">
        {/* Subtle background texture for dark mode to prevent "Just Black" look */}
        <div className="absolute inset-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-800/[0.04] pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-slate-50/50 dark:to-slate-950/50 pointer-events-none z-0"></div>

        {/* Navigation Bar */}
        <nav className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 text-white shadow-lg z-50 transition-all duration-500 sticky top-0 shrink-0">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              
              <div className="flex-shrink-0 flex items-center gap-2 mr-2 sm:mr-6">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
                   <Sprout className="text-white h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:block text-white/95 text-shadow-sm">AgriConnect</span>
              </div>

              <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar py-2">
                <div className="flex bg-black/10 dark:bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-inner whitespace-nowrap">
                  <button 
                    onClick={() => setRole(UserRole.FARMER)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${role === UserRole.FARMER ? 'bg-white text-emerald-700 shadow-md transform scale-105' : 'text-emerald-50 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Smartphone size={16} />
                    <span className="hidden sm:inline">{t.farmer}</span>
                  </button>
                  <button 
                    onClick={() => setRole(UserRole.DEALER)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${role === UserRole.DEALER ? 'bg-white text-emerald-700 shadow-md transform scale-105' : 'text-emerald-50 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Store size={16} />
                    <span className="hidden sm:inline">{t.dealer}</span>
                  </button>
                  <button 
                    onClick={() => setRole(UserRole.AGENT)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${role === UserRole.AGENT ? 'bg-white text-emerald-700 shadow-md transform scale-105' : 'text-emerald-50 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Headset size={16} />
                    <span className="hidden sm:inline">{t.agent}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2 sm:ml-6 shrink-0">
                <button
                  onClick={() => setLanguage(l => l === 'en' ? 'am' : 'en')}
                  className="flex items-center justify-center h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 backdrop-blur-sm active:scale-95"
                  title="Switch Language"
                >
                  <Globe size={14} className="mr-1" />
                  <span className="text-xs font-bold">{language === 'en' ? 'EN' : 'አማ'}</span>
                </button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 backdrop-blur-sm active:scale-95"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-auto relative w-full custom-scrollbar z-10">
          
          {role === UserRole.FARMER && (
            <div className="flex flex-col min-h-full">
              <div className="bg-white dark:bg-slate-800 p-3 shadow-sm z-30 sticky top-0 border-b border-slate-100 dark:border-slate-700">
                 <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                     {/* View Switcher */}
                     <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                       <button 
                          onClick={() => setFarmerView('USSD')}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${farmerView === 'USSD' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                          <MonitorSmartphone size={16} /> USSD (Offline)
                        </button>
                        <button 
                          onClick={() => setFarmerView('SMS')}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${farmerView === 'SMS' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                          <Smartphone size={16} /> SMS (Alerts)
                        </button>
                     </div>

                     {/* Device Toggle */}
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:block">Device Mode</span>
                        <button
                          onClick={() => setFarmerDeviceType(prev => prev === 'SMARTPHONE' ? 'FEATURE_PHONE' : 'SMARTPHONE')}
                          className={`relative h-10 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 border ${
                            farmerDeviceType === 'SMARTPHONE' 
                              ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' 
                              : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                          } active:scale-95`}
                          title="Switch Device Type"
                        >
                           {farmerDeviceType === 'SMARTPHONE' ? (
                             <>
                               <Smartphone size={18} />
                               <span className="text-xs font-bold">Touch</span>
                             </>
                           ) : (
                             <>
                               <Grip size={18} />
                               <span className="text-xs font-bold">Keypad</span>
                             </>
                           )}
                        </button>
                     </div>
                 </div>
              </div>

              <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col relative py-8 px-4">
                {/* Background Decor for Farmer View */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 opacity-80 z-0"></div>
                <div className="flex justify-center w-full z-10">
                   {farmerView === 'USSD' ? (
                     <USSDSimulator 
                        marketPrices={prices} 
                        dealerInventory={inventory}
                        onRequestSupport={handleCreateTicket} 
                        onCreateOffer={handleCreateOffer}
                        onCreateOrder={handleCreateInputOrder}
                        language={language} 
                        deviceType={farmerDeviceType}
                     />
                   ) : (
                     <SMSSimulator 
                        language={language} 
                        messages={smsMessages}
                        onSendMessage={handleSendMessage}
                     />
                   )}
                </div>
              </div>
            </div>
          )}

          {role === UserRole.DEALER && (
            !isDealerLoggedIn ? (
              <Login onLogin={() => setIsDealerLoggedIn(true)} />
            ) : (
              <DealerDashboard 
                inventory={inventory} 
                tickets={tickets} 
                prices={prices}
                offers={offers}
                orders={inputOrders}
                language={language}
                onUpdatePrice={handleUpdatePrice}
                onUpdateStock={handleUpdateStock}
                onUpdateImage={handleUpdateProductImage}
                onUpdateOfferStatus={handleUpdateOfferStatus}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onLogout={() => setIsDealerLoggedIn(false)}
              />
            )
          )}

          {role === UserRole.AGENT && (
            <CallCenterDashboard 
              tickets={tickets} 
              language={language}
              onResolveTicket={handleResolveTicket}
            />
          )}

          {/* Floating Farmer Feature Phone Widget */}
          {showFarmerPhone && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-20 fade-in duration-500 hidden md:block transform scale-75 origin-bottom-right">
              <div className="relative group">
                <button 
                  onClick={() => setShowFarmerPhone(false)}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 z-50 ring-2 ring-white dark:ring-slate-900 transition-transform hover:scale-110"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <FeaturePhone messages={smsMessages} farmerName="Sim Phone" />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;