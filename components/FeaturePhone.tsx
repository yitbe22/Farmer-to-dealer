
import React, { useRef, useEffect } from 'react';
import { Signal, Battery, ChevronUp, ChevronDown, Phone, MessageSquare, X } from 'lucide-react';
import { SMSMessage } from '../types';

interface FeaturePhoneProps {
  messages: SMSMessage[];
  farmerName: string;
}

const FeaturePhone: React.FC<FeaturePhoneProps> = ({ messages, farmerName }) => {
  const screenRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to new messages
  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTop = screenRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScrollUp = () => {
    if (screenRef.current) {
      screenRef.current.scrollBy({ top: -50, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (screenRef.current) {
      screenRef.current.scrollBy({ top: 50, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {/* Device Body */}
      <div className="w-[280px] h-auto bg-gradient-to-b from-slate-800 to-black rounded-[2.5rem] p-4 pb-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-700/50 relative flex flex-col items-center select-none transform transition-transform duration-300 ring-8 ring-black/10">
        
        {/* Glossy Highlight on Body */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-b-full"></div>

        {/* Earpiece */}
        <div className="w-12 h-1 bg-black/50 rounded-full mb-4 border-b border-white/10 shrink-0"></div>

        {/* Screen Bezel */}
        <div className="w-full bg-black rounded-2xl p-1 mb-5 border border-slate-800 shadow-inner shrink-0 relative overflow-hidden">
          {/* Screen Glass Reflection */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 pointer-events-none z-20"></div>

          {/* LCD Screen */}
          <div className="w-full h-48 bg-slate-900 rounded-xl flex flex-col relative overflow-hidden">
            
            {/* Status Bar */}
            <div className="flex justify-between items-center px-2 py-1 bg-slate-900/90 text-[9px] font-medium text-white z-10 border-b border-white/10">
              <span className="flex items-center gap-0.5"><Signal size={8} className="fill-current"/> 4G</span>
              <span className="opacity-80">12:30 PM</span>
              <span className="flex items-center gap-0.5"><Battery size={8} className="fill-current"/> 90%</span>
            </div>

            {/* Header */}
            <div className="bg-emerald-700 px-2 py-1.5 flex items-center gap-2 shadow-sm z-10">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageSquare size={10} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white leading-none">Messages</span>
                    <span className="text-[7px] text-emerald-100 leading-none">AgriConnect</span>
                </div>
            </div>

            {/* Messages List */}
            <div ref={screenRef} className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-900 text-slate-200 font-sans z-10 scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 text-white space-y-1">
                  <MessageSquare size={24} />
                  <span className="text-[10px]">No Messages</span>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'Farmer' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[90%] px-2 py-1.5 rounded-lg text-[10px] leading-tight shadow-sm ${
                      msg.sender === 'Farmer' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'
                    }`}>
                      {msg.sender === 'System' && <span className="font-bold block mb-0.5 text-emerald-400 text-[8px] uppercase tracking-wider">AgriConnect</span>}
                      {msg.text}
                    </div>
                    <span className="text-[7px] text-slate-500 mt-0.5 px-0.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Navigation Cluster */}
        <div className="w-full px-4 mb-4 flex justify-between items-center text-slate-400 shrink-0 relative">
          <button className="flex flex-col items-center group active:text-white transition-colors">
            <div className="w-10 h-0.5 bg-slate-600 mb-1 group-active:bg-emerald-500 transition-colors"></div>
            <span className="text-[8px] font-bold tracking-wider">MENU</span>
          </button>
          
          {/* D-Pad */}
          <div className="w-14 h-14 rounded-full border border-slate-700 flex items-center justify-center relative bg-gradient-to-br from-slate-800 to-black shadow-lg mx-2 active:scale-95 transition-transform overflow-hidden">
             <div className="w-full h-full absolute inset-0 rounded-full bg-white/5 opacity-0 active:opacity-20 transition-opacity pointer-events-none"></div>
             
             {/* Functional Scroll Zones */}
             <button onClick={handleScrollUp} className="absolute top-0 left-0 w-full h-1/2 z-20 flex justify-center items-start pt-1.5 outline-none hover:bg-white/5 active:bg-white/10">
                <ChevronUp size={12} className="text-slate-500" />
             </button>
             <button onClick={handleScrollDown} className="absolute bottom-0 left-0 w-full h-1/2 z-20 flex justify-center items-end pb-1.5 outline-none hover:bg-white/5 active:bg-white/10">
                <ChevronDown size={12} className="text-slate-500" />
             </button>

             <div className="w-6 h-6 bg-slate-900 rounded-full border border-slate-800 shadow-inner z-10 pointer-events-none"></div>
          </div>

          <button className="flex flex-col items-center group active:text-white transition-colors">
            <div className="w-10 h-0.5 bg-slate-600 mb-1 group-active:bg-red-500 transition-colors"></div>
            <span className="text-[8px] font-bold tracking-wider">BACK</span>
          </button>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 w-full px-4 shrink-0">
          {/* Call Keys */}
          <div className="col-span-3 grid grid-cols-2 gap-8 mb-2 px-1">
               <button className="h-8 bg-green-600/90 rounded-full flex items-center justify-center shadow-lg shadow-green-900/50 active:scale-95 transition-all text-white hover:bg-green-500">
                  <Phone size={14} className="fill-current" />
               </button>
               <button className="h-8 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 active:scale-95 transition-all text-white hover:bg-red-500">
                  <Phone size={14} className="fill-current rotate-[135deg]" />
               </button>
          </div>

          {/* Number Keys */}
          {['1', '2 abc', '3 def', '4 ghi', '5 jkl', '6 mno', '7 pqrs', '8 tuv', '9 wxyz', '*', '0 +', '#'].map((key) => (
            <button 
              key={key}
              className="h-8 rounded-lg flex flex-col items-center justify-center active:bg-white/10 transition-all hover:bg-white/5 group"
            >
              <span className="text-white font-medium text-sm leading-none group-active:text-emerald-400 transition-colors">{key.split(' ')[0]}</span>
              {key.split(' ')[1] && <span className="text-[6px] text-slate-500 font-medium tracking-wide leading-none mt-0.5 group-active:text-emerald-500/70">{key.split(' ')[1]}</span>}
            </button>
          ))}
        </div>

        {/* Branding Laser Etch */}
        <div className="mt-auto pt-4 text-white/20 font-bold text-[8px] tracking-[0.2em] uppercase">
          {farmerName}
        </div>
      </div>
    </div>
  );
};

export default FeaturePhone;
