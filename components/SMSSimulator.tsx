
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { SMSMessage, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SMSSimulatorProps {
  language?: Language;
  messages: SMSMessage[];
  onSendMessage: (text: string) => void;
}

const SMSSimulator: React.FC<SMSSimulatorProps> = ({ language = 'en', messages, onSendMessage }) => {
  const t = TRANSLATIONS[language];
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 transition-colors w-full">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[320px] h-[600px] rounded-[30px] shadow-2xl border-[8px] border-slate-800 dark:border-slate-950 flex flex-col overflow-hidden relative transition-colors duration-300 transform hover:scale-[1.01]">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-950 w-32 h-6 rounded-b-xl z-10 transition-colors duration-300"></div>
        
        {/* Header */}
        <div className="bg-emerald-600 dark:bg-emerald-900 text-white p-4 pt-8 shadow-md z-0 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
               <MessageSquare size={16} />
            </div>
            <div>
               <h3 className="font-bold text-sm">AgriAlerts</h3>
               <p className="text-[10px] opacity-80">+251 911 000 000</p>
            </div>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-3 overflow-y-auto space-y-3 transition-colors custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'Farmer' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm transition-colors ${
                msg.sender === 'Farmer' 
                ? 'bg-emerald-500 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
              }`}>
                {msg.text}
                <div className={`text-[10px] mt-1 text-right ${msg.sender === 'Farmer' ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 transition-colors">
          <div className="relative flex-1 group">
             <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.type_message}
                className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-t-lg rounded-b-none px-3 py-2.5 text-sm focus:outline-none transition-colors placeholder-slate-400 border-b border-slate-300 dark:border-slate-700 caret-emerald-500"
              />
              {/* Animated Focus Bar */}
              <div className={`absolute bottom-0 left-0 h-[2px] bg-emerald-500 transition-all duration-300 ease-out ${isFocused ? 'w-full' : 'w-0'}`}></div>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </div>
      <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm hidden md:block opacity-60">
        {t.chat_subtitle}
      </p>
    </div>
  );
};

export default SMSSimulator;
