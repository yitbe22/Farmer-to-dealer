
import React, { useState } from 'react';
import { Headset, MessageSquare, CheckCircle, Clock, Zap, User } from 'lucide-react';
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
    <div className="h-full flex flex-col md:flex-row bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <h2 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Headset className="text-blue-600 dark:text-blue-400" /> Incoming Tickets ({activeTickets.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => { setSelectedTicket(ticket); setAiSuggestion(null); setResolutionNotes(''); }}
              className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{ticket.farmerName}</span>
                <span className="text-xs text-slate-400">{new Date(ticket.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{ticket.issue}</p>
              <div className="mt-2 flex gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                  ticket.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>{ticket.priority}</span>
              </div>
            </div>
          ))}
          {activeTickets.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">No active tickets waiting.</div>
          )}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedTicket ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="relative">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTicket.farmerName)}&background=random&color=fff&size=128`} 
                    alt={selectedTicket.farmerName} 
                    className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-700 shadow-md"
                  />
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${selectedTicket.priority === 'High' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTicket.farmerName}</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{selectedTicket.phoneNumber}</p>
                </div>
                <div className="ml-auto text-right hidden sm:block">
                  <div className="text-sm text-slate-400">Ticket ID</div>
                  <div className="font-mono font-medium dark:text-slate-300">{selectedTicket.id}</div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Issue Description</h3>
                <p className="text-slate-800 dark:text-slate-100 text-lg leading-relaxed">{selectedTicket.issue}</p>
              </div>
            </div>

            {/* AI Assistant Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors hover:shadow-md group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Zap className="text-purple-500 fill-current" size={18} /> Smart Assist
                </h3>
                <button 
                  onClick={handleGetAiHelp}
                  disabled={isAnalyzing}
                  className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 px-3 py-1.5 rounded-full font-medium hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors disabled:opacity-50 transform hover:scale-105 active:scale-95 flex items-center gap-1"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span> Analyzing...
                    </>
                  ) : 'Generate Solution'}
                </button>
              </div>
              
              {aiSuggestion ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-slate-700 dark:text-slate-200 text-sm leading-relaxed border border-purple-100 dark:border-purple-800 animate-in fade-in slide-in-from-bottom-2">
                  <p>{aiSuggestion}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-lg group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors">
                  Click 'Generate Solution' to get AI-powered advice for this issue.
                </div>
              )}
            </div>

            {/* Resolution Form */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={18} /> Resolution
              </h3>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Type resolution notes here to close the ticket..."
                className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 resize-none transition-colors"
              ></textarea>
              <div className="flex justify-end">
                <button 
                  onClick={handleResolve}
                  disabled={!resolutionNotes}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/20"
                >
                  Resolve & Close Ticket
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 transition-colors">
            <MessageSquare size={64} className="mb-4 opacity-20" />
            <p>Select a ticket to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallCenterDashboard;
