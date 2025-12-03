import React, { useState } from 'react';
import { Headset, MessageSquare, CheckCircle, Zap, Search, Bell, LogOut, Menu, X, ChevronRight, User } from 'lucide-react';
import { Ticket, Language } from '../types';
import { analyzeSupportTicket } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface CallCenterDashboardProps {
  tickets: Ticket[];
  onResolveTicket: (id: string, resolution: string) => void;
  language?: Language;
}

const CallCenterDashboard: React.FC<CallCenterDashboardProps> = ({ tickets, onResolveTicket, language = 'en' }) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const t = TRANSLATIONS[language as Language];

  const handleGetAiHelp = async () => {
    if (!selectedTicket) return;
    setIsAnalyzing(true);
    const suggestion = await analyzeSupportTicket(selectedTicket.issue, language as Language);
    setAiSuggestion(suggestion);
    setIsAnalyzing(false);
  };

  const handleResolve = () => {
    if (selectedTicket) {
      onResolveTicket(selectedTicket.id, resolutionNotes);
      setSelectedTicket(null);
      setAiSuggestion(null);
      setResolutionNotes('');
    }
  };

  const activeTickets = tickets.filter(t => t.status !== 'Resolved');

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-blue-500/30 relative">
      
      {/* Luxurious Glass Header */}
      <header className="bg-slate-900/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-b border-slate-800 dark:border-white/5 sticky top-0 z-40 transition-all duration-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand */}
            <div className="flex items-center gap-3 select-none group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-500 transform group-hover:scale-105">
                  <Headset size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                  <h1 className="text-lg font-bold text-white leading-none tracking-tight">Support Portal</h1>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1 opacity-80">AgriConnect</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
               <button className="hidden md:flex w-9 h-9 rounded-full items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors relative">
                   <Bell size={18} />
                   <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-900"></span>
               </button>

              <button className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 hover:bg-slate-800 rounded-full">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar List */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-white/5 flex flex-col z-20 shadow-xl md:shadow-none h-full relative">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Incoming Tickets</h2>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search tickets..." 
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {activeTickets.map(ticket => (
                    <div 
                    key={ticket.id} 
                    onClick={() => { setSelectedTicket(ticket); setAiSuggestion(null); setResolutionNotes(''); }}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                        selectedTicket?.id === ticket.id 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/20 shadow-sm' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5'
                    }`}
                    >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold text-sm ${selectedTicket?.id === ticket.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {ticket.farmerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(ticket.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">{ticket.issue}</p>
                    <div className="flex gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                        ticket.priority === 'High' 
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                            : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                        }`}>{ticket.priority}</span>
                    </div>
                    </div>
                ))}
                {activeTickets.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <CheckCircle size={32} className="mb-2 opacity-20" />
                        <p className="text-xs">No active tickets</p>
                    </div>
                )}
            </div>
        </aside>

        {/* Main Detail Area */}
        <div className="flex-1 bg-slate-50 dark:bg-[#0B1120] relative overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-4xl mx-auto h-full">
            {selectedTicket ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Card */}
                <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-8 shadow-sm border border-slate-200 dark:border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                     
                     <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/10 shadow-inner">
                                <User size={40} strokeWidth={1.5} />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-[3px] border-white dark:border-[#111827] flex items-center justify-center shadow-sm ${selectedTicket.priority === 'High' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTicket.farmerName}</h1>
                                <span className="bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-white/5">{selectedTicket.id}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm flex items-center gap-2">
                                {selectedTicket.phoneNumber}
                            </p>
                        </div>

                        <div className="flex gap-2">
                             <button className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors border border-slate-200 dark:border-white/5">
                                 <MessageSquare size={20} />
                             </button>
                        </div>
                     </div>

                     <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Issue Reported</h3>
                         <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            "{selectedTicket.issue}"
                         </p>
                     </div>
                </div>

                {/* AI & Resolution Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* AI Assistant */}
                    <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-white/5 flex flex-col h-full hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-500 group">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Zap size={16} className="fill-current" />
                                </div>
                                Smart Assist
                            </h3>
                            {isAnalyzing && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span></span>}
                        </div>
                        
                        <div className="flex-1 bg-slate-50 dark:bg-black/20 rounded-2xl p-4 border border-slate-100 dark:border-white/5 mb-6 min-h-[140px]">
                            {aiSuggestion ? (
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in">{aiSuggestion}</p>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4 opacity-60">
                                    <Zap size={24} className="mb-2" />
                                    Generate AI solution based on farming best practices.
                                </div>
                            )}
                        </div>

                        <button 
                        onClick={handleGetAiHelp}
                        disabled={isAnalyzing}
                        className="w-full py-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-300 font-bold text-sm border border-purple-100 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all active:scale-95"
                        >
                        {isAnalyzing ? 'Analyzing...' : 'Generate Solution'}
                        </button>
                    </div>

                    {/* Resolution Form */}
                    <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-white/5 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                             <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <CheckCircle size={16} />
                             </div>
                             <h3 className="font-bold text-slate-900 dark:text-white">Resolution</h3>
                        </div>

                        <textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Type resolution notes here..."
                            className="flex-1 w-full p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white text-sm resize-none mb-4 placeholder:text-slate-400"
                        ></textarea>

                        <button 
                            onClick={handleResolve}
                            disabled={!resolutionNotes}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Resolve & Close Ticket
                        </button>
                    </div>

                </div>

                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 select-none">
                     <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                        <Headset size={64} strokeWidth={1} />
                     </div>
                     <h2 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">Support Dashboard</h2>
                     <p className="text-sm max-w-xs text-center opacity-60">Select a ticket from the sidebar to view details and provide assistance.</p>
                </div>
            )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default CallCenterDashboard;