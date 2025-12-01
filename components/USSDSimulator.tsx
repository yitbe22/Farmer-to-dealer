
import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Delete, Signal, Battery, Loader2, ChevronUp, ChevronDown, Menu } from 'lucide-react';
import { MarketPrice, Language, Product } from '../types';
import { TRANSLATIONS } from '../constants';

interface USSDSimulatorProps {
  marketPrices: MarketPrice[];
  dealerInventory: Product[];
  onRequestSupport: (issue: string) => void;
  onCreateOffer: (crop: string, quantity: number, farmerName?: string) => void;
  onCreateOrder: (productId: string, quantity: number) => void;
  language: Language;
  deviceType: 'SMARTPHONE' | 'FEATURE_PHONE';
}

const USSDSimulator: React.FC<USSDSimulatorProps> = ({ 
    marketPrices, dealerInventory, onRequestSupport, onCreateOffer, onCreateOrder, language, deviceType 
}) => {
  const [screen, setScreen] = useState<'IDLE' | 'DIALING' | 'MENU_LANG' | 'MENU_MAIN' | 'MENU_SELL' | 'MENU_SELL_QTY' | 'MENU_BUY' | 'MENU_BUY_ITEM' | 'MENU_BUY_QTY' | 'MENU_PRICES' | 'MENU_REPORT' | 'MENU_REGISTER' | 'MENU_REG_NAME' | 'MENU_REG_REGION' | 'RESULT'>('IDLE');
  const [input, setInput] = useState('');
  const [sessionInput, setSessionInput] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ussdLang, setUssdLang] = useState<Language>('en');
  
  // Selection State
  const [selectedSellCrop, setSelectedSellCrop] = useState('');
  const [selectedBuyProduct, setSelectedBuyProduct] = useState<Product | null>(null);

  // Registration State
  const [registeredUser, setRegisteredUser] = useState<{name: string, region: string} | null>(null);
  const [tempRegName, setTempRegName] = useState('');
  
  const t = TRANSLATIONS[language];

  // Time for status bar
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
    return () => clearInterval(timer);
  }, []);

  const goBackToMain = useCallback(() => {
    setScreen('MENU_MAIN');
    if (ussdLang === 'en') {
      setDisplayText(`AgriConnect Eth${registeredUser ? `\nHello, ${registeredUser.name}` : ''}\n1. Sell Produce\n2. Buy Inputs\n3. Market Prices\n4. Farming Tips\n5. Report Issue\n6. ${registeredUser ? 'My Account' : 'Create Account'}`);
    } else {
      setDisplayText(`አግሪ-ኮኔክት${registeredUser ? `\nሰላም, ${registeredUser.name}` : ''}\n1. ምርት ለመሸጥ\n2. ግብዓት ለመግዛት\n3. የገበያ ዋጋ\n4. የግብርና ምክር\n5. ችግር ለማመልከት\n6. ${registeredUser ? 'የእኔ መለያ' : 'መለያ ይፍጠሩ'}`);
    }
    setSessionInput('');
  }, [ussdLang, registeredUser]);

  const processUSSD = useCallback((cmd: string) => {
    const currentInput = cmd.trim();

    // Initial Dial
    if (screen === 'IDLE' || screen === 'DIALING') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (currentInput === '*808#') {
          setScreen('MENU_LANG');
          setDisplayText("AgriConnect Ethiopia\n1. English\n2. አማርኛ (Amharic)");
        } else {
          setScreen('RESULT');
          setDisplayText("Connection Error or Invalid MMI Code.\nTry *808#");
        }
        setSessionInput('');
      }, 300); // Reduced delay for faster initial load
      return;
    }

    // Language Selection
    if (screen === 'MENU_LANG') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (currentInput === '1') {
          setUssdLang('en');
          setScreen('MENU_MAIN');
          setDisplayText(`AgriConnect Eth${registeredUser ? `\nHello, ${registeredUser.name}` : ''}\n1. Sell Produce\n2. Buy Inputs\n3. Market Prices\n4. Farming Tips\n5. Report Issue\n6. ${registeredUser ? 'My Account' : 'Create Account'}`);
        } else if (currentInput === '2') {
          setUssdLang('am');
          setScreen('MENU_MAIN');
          setDisplayText(`አግሪ-ኮኔክት${registeredUser ? `\nሰላም, ${registeredUser.name}` : ''}\n1. ምርት ለመሸጥ\n2. ግብዓት ለመግዛት\n3. የገበያ ዋጋ\n4. የግብርና ምክር\n5. ችግር ለማመልከት\n6. ${registeredUser ? 'የእኔ መለያ' : 'መለያ ይፍጠሩ'}`);
        } else {
          setDisplayText("Invalid Option/የተሳሳተ ምርጫ\n1. English\n2. አማርኛ");
        }
        setSessionInput('');
      }, 300);
      return;
    }

    // Main Menu
    if (screen === 'MENU_MAIN') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (currentInput === '1') {
            setScreen('MENU_SELL');
            if (ussdLang === 'en') {
                setDisplayText("Select Crop to Sell:\n1. Teff\n2. Coffee\n3. Maize\n4. Wheat\n0. Back");
            } else {
                setDisplayText("የሚሸጡትን ሰብል ይምረጡ:\n1. ጤፍ\n2. ቡና\n3. በቆሎ\n4. ስንዴ\n0. ተመለስ");
            }
        } else if (currentInput === '2') {
            setScreen('MENU_BUY');
            if (ussdLang === 'en') {
                setDisplayText("Buy Inputs:\n1. Fertilizers\n2. Seeds\n3. Pesticides\n4. Tools\n0. Back");
            } else {
                setDisplayText("ግብዓት መግዛት:\n1. ማዳበሪያ\n2. ምርጥ ዘር\n3. ፀረ-ተባይ\n4. የእርሻ መሳሪያ\n0. ተመለስ");
            }
        } else if (currentInput === '3') {
          setScreen('MENU_PRICES');
          if (ussdLang === 'en') {
              setDisplayText("Check Price:\n1. Teff\n2. Coffee\n3. Maize\n0. Back");
          } else {
              setDisplayText("ዋጋ ያረጋግጡ:\n1. ጤፍ\n2. ቡና\n3. በቆሎ\n0. ተመለስ");
          }
        } else if (currentInput === '4') {
          setScreen('RESULT');
          const tip = ussdLang === 'en' 
            ? "Tip: Rotate crops annually to prevent soil depletion.\n\n0. Back" 
            : "ምክር: የአፈር ለምነትን ለመጠበቅ በየዓመቱ ሰብል ያፈራርቁ።\n\n0. ተመለስ";
          setDisplayText(tip);
        } else if (currentInput === '5') {
          setScreen('MENU_REPORT');
          setDisplayText(ussdLang === 'en' ? "Describe your issue:" : "ችግርዎን ይግለጹ:");
        } else if (currentInput === '6') {
            if (registeredUser) {
                // Already registered
                setScreen('RESULT');
                setDisplayText(ussdLang === 'en' 
                    ? `Name: ${registeredUser.name}\nRegion: ${registeredUser.region}\nStatus: Active\n\n0. Back` 
                    : `ስም: ${registeredUser.name}\nክልል: ${registeredUser.region}\nሁኔታ: ንቁ\n\n0. ተመለስ`);
            } else {
                // Start Registration
                setScreen('MENU_REG_NAME');
                setDisplayText(ussdLang === 'en' ? "Enter your Full Name:" : "ሙሉ ስምዎን ያስገቡ:");
            }
        } else {
          setDisplayText(ussdLang === 'en' 
            ? "Invalid Option.\n1. Sell Produce\n2. Buy Inputs\n3. Prices\n4. Tips\n5. Report\n6. Account" 
            : "የተሳሳተ ምርጫ።\n1. ምርት ለመሸጥ\n2. ግብዓት ለመግዛት\n3. የገበያ ዋጋ\n4. ምክር\n5. ሪፖርት\n6. መለያ");
        }
        setSessionInput('');
      }, 300);
      return;
    }

    // --- REGISTRATION FLOW ---
    if (screen === 'MENU_REG_NAME') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // Strict Validation: Letters and spaces only, must have at least one space for "Full Name" feel, no numbers
            const hasNumbers = /\d/.test(currentInput);
            const hasLetters = /[a-zA-Z\u1200-\u137F]/.test(currentInput); // Ethiopic or Latin letters

            if (currentInput.length > 2 && !hasNumbers && hasLetters) {
                setTempRegName(currentInput);
                setScreen('MENU_REG_REGION');
                if (ussdLang === 'en') {
                    setDisplayText("Select Region:\n1. Oromia\n2. Amhara\n3. SNNPR\n4. Sidama\n5. Tigray\n6. Somali\n7. Addis Ababa");
                } else {
                    setDisplayText("ክልል ይምረጡ:\n1. ኦሮሚያ\n2. አማራ\n3. ደቡብ\n4. ሲዳማ\n5. ትግራይ\n6. ሶማሌ\n7. አዲስ አበባ");
                }
            } else {
                setDisplayText(ussdLang === 'en' ? "Invalid Name (Letters only).\nEnter Full Name:" : "ትክክለኛ ስም ያስገቡ (ፊደላት ብቻ)።\nሙሉ ስም ያስገቡ:");
            }
            setSessionInput('');
        }, 300);
        return;
    }

    if (screen === 'MENU_REG_REGION') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const regionsEn = ['Oromia', 'Amhara', 'SNNPR', 'Sidama', 'Tigray', 'Somali', 'Addis Ababa'];
            const regionsAm = ['ኦሮሚያ', 'አማራ', 'ደቡብ', 'ሲዳማ', 'ትግራይ', 'ሶማሌ', 'አዲስ አበባ'];
            
            const idx = parseInt(currentInput) - 1;
            
            if (idx >= 0 && idx < regionsEn.length) {
                const region = ussdLang === 'en' ? regionsEn[idx] : regionsAm[idx];
                const newUser = { name: tempRegName, region };
                setRegisteredUser(newUser);
                setScreen('RESULT');
                setDisplayText(ussdLang === 'en' 
                    ? `Welcome, ${tempRegName}!\nAccount Created.\nRegion: ${region}\n\n0. Main Menu` 
                    : `እንኳን ደህና መጡ ${tempRegName}!\nመለያ ተፈጥሯል።\nክልል: ${region}\n\n0. ዋና ማውጫ`);
            } else {
                 setDisplayText(ussdLang === 'en' 
                    ? "Invalid Region.\n1. Oromia\n2. Amhara\n3. SNNPR\n4. Sidama..." 
                    : "የተሳሳተ ክልል\n1. ኦሮሚያ\n2. አማራ\n3. ደቡብ\n4. ሲዳማ...");
            }
            setSessionInput('');
        }, 500);
        return;
    }


    // --- SELL FLOW ---
    if (screen === 'MENU_SELL') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (currentInput === '0') { goBackToMain(); return; }
            
            const cropMap: Record<string, string> = { '1': 'Teff (White)', '2': 'Coffee (Jimma)', '3': 'Maize', '4': 'Wheat' };
            const selected = cropMap[currentInput];
            
            if (selected) {
                setSelectedSellCrop(selected);
                setScreen('MENU_SELL_QTY');
                setDisplayText(ussdLang === 'en' 
                    ? `Selling ${selected}.\nEnter Quantity (Quintals):` 
                    : `${selected} መሸጥ።\nመጠን ያስገቡ (በኩንታል):`);
            } else {
                setDisplayText(ussdLang === 'en' 
                  ? "Invalid Crop.\n1. Teff\n2. Coffee\n3. Maize\n4. Wheat\n0. Back" 
                  : "የተሳሳተ ምርጫ።\n1. ጤፍ\n2. ቡና\n3. በቆሎ\n4. ስንዴ\n0. ተመለስ");
            }
            setSessionInput('');
        }, 300);
        return;
    }

    if (screen === 'MENU_SELL_QTY') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const qty = parseFloat(currentInput);
            if (!isNaN(qty) && qty > 0) {
                // Pass the registered user's name if available
                onCreateOffer(selectedSellCrop, qty, registeredUser?.name);
                setScreen('RESULT');
                setDisplayText(ussdLang === 'en' 
                    ? `Offer Sent!\n${qty} Qtl of ${selectedSellCrop}.\nDealers will contact you.\n\n0. Exit` 
                    : `ተልኳል!\n${qty} ኩንታል ${selectedSellCrop}.\nነጋዴዎች ያግኙዎታል።\n\n0. ውጣ`);
            } else {
                setDisplayText(ussdLang === 'en' 
                  ? `Invalid Quantity.\nEnter a number (e.g., 10)\n0. Back` 
                  : `የተሳሳተ መጠን።\nትክክለኛ ቁጥር ያስገቡ\n0. ተመለስ`);
            }
            setSessionInput('');
        }, 300);
        return;
    }

    // --- BUY INPUTS FLOW ---
    if (screen === 'MENU_BUY') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (currentInput === '0') { goBackToMain(); return; }

            const catMap: Record<string, string> = { '1': 'Fertilizer', '2': 'Seeds', '3': 'Pesticide', '4': 'Tools' };
            const category = catMap[currentInput];

            if (category) {
                // Filter products by category
                const products = dealerInventory.filter(p => p.category === category);
                
                if (products.length === 0) {
                    setDisplayText(ussdLang === 'en' 
                        ? `No ${category} available.\n0. Back` 
                        : `ምንም ${category} የለም።\n0. ተመለስ`);
                } else {
                    setScreen('MENU_BUY_ITEM');
                    let listStr = ussdLang === 'en' ? `Select ${category}:\n` : `${category} ይምረጡ:\n`;
                    products.forEach((p, idx) => {
                        listStr += `${idx + 1}. ${p.name.substring(0, 15)}.. (${p.price} ETB)\n`;
                    });
                    listStr += "0. Back";
                    setDisplayText(listStr);
                }
            } else {
                setDisplayText(ussdLang === 'en' 
                  ? "Invalid Category.\n1. Fertilizers\n2. Seeds\n3. Pesticides\n4. Tools\n0. Back" 
                  : "የተሳሳተ ምርጫ።\n1. ማዳበሪያ\n2. ምርጥ ዘር\n3. ፀረ-ተባይ\n4. የእርሻ መሳሪያ\n0. ተመለስ");
            }
            setSessionInput('');
        }, 300);
        return;
    }

    if (screen === 'MENU_BUY_ITEM') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // Handling Back
            if (currentInput === '0') { 
                setScreen('MENU_BUY');
                if (ussdLang === 'en') {
                    setDisplayText("Buy Inputs:\n1. Fertilizers\n2. Seeds\n3. Pesticides\n4. Tools\n0. Back");
                } else {
                    setDisplayText("ግብዓት መግዛት:\n1. ማዳበሪያ\n2. ምርጥ ዘር\n3. ፀረ-ተባይ\n4. የእርሻ መሳሪያ\n0. ተመለስ");
                }
                setSessionInput('');
                return; 
            }
            
            // Determine current category based on display text
            let category = '';
            if (displayText.includes('Fertilizer') || displayText.includes('ማዳበሪያ')) category = 'Fertilizer';
            else if (displayText.includes('Seeds') || displayText.includes('ምርጥ ዘር')) category = 'Seeds';
            else if (displayText.includes('Tools') || displayText.includes('መሳሪያ')) category = 'Tools';
            else if (displayText.includes('Pesticide') || displayText.includes('ፀረ-ተባይ')) category = 'Pesticide';

            const products = dealerInventory.filter(p => p.category === category);
            const index = parseInt(currentInput) - 1;
            
            if (products[index]) {
                setSelectedBuyProduct(products[index]);
                setScreen('MENU_BUY_QTY');
                setDisplayText(ussdLang === 'en' 
                    ? `Buying ${products[index].name}\nPrice: ${products[index].price} ETB\nEnter Qty:`
                    : `${products[index].name} መግዛት\nዋጋ: ${products[index].price} ብር\nመጠን ያስገቡ:`);
            } else {
                // Re-render the list for help
                let listStr = ussdLang === 'en' ? `Invalid. Select ${category}:\n` : `የተሳሳተ። ${category} ይምረጡ:\n`;
                products.forEach((p, idx) => {
                    listStr += `${idx + 1}. ${p.name.substring(0, 15)}.. (${p.price} ETB)\n`;
                });
                listStr += "0. Back";
                setDisplayText(listStr);
            }
            setSessionInput('');
        }, 300);
        return;
    }

    if (screen === 'MENU_BUY_QTY') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const qty = parseFloat(currentInput);
            if (!isNaN(qty) && qty > 0 && selectedBuyProduct) {
                onCreateOrder(selectedBuyProduct.id, qty);
                const total = qty * selectedBuyProduct.price;
                setScreen('RESULT');
                setDisplayText(ussdLang === 'en' 
                   ? `Order Placed!\n${selectedBuyProduct.name}\nQty: ${qty}\nTotal: ${total} ETB\nPay at Dealer.\n\n0. Exit`
                   : `ትዕዛዝ ተቀብለናል!\n${selectedBuyProduct.name}\nመጠን: ${qty}\nጠቅላላ: ${total} ብር\n\n0. ውጣ`);
            } else {
                setDisplayText(ussdLang === 'en' ? "Invalid Quantity.\nEnter a number.\n0. Back" : "የተሳሳተ መጠን።\nቁጥር ያስገቡ።\n0. ተመለስ");
            }
            setSessionInput('');
        }, 300);
        return;
    }

    // PRICES
    if (screen === 'MENU_PRICES') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (currentInput === '0') { goBackToMain(); return; }
        const cropMap: Record<string, string> = { '1': 'Teff (White)', '2': 'Coffee (Jimma)', '3': 'Maize' };
        const selected = cropMap[currentInput];
        if (selected) {
          const price = marketPrices.find(p => p.crop === selected)?.pricePerKg || 'N/A';
          setDisplayText(ussdLang === 'en' ? `${selected}: ${price} ETB/kg\n0. Back` : `${selected}: ${price} ብር/ኪሎ\n0. ተመለስ`);
          setScreen('RESULT');
        } else {
           setDisplayText(ussdLang === 'en' 
             ? "Invalid Crop.\n1. Teff\n2. Coffee\n3. Maize\n0. Back" 
             : "የተሳሳተ ምርጫ።\n1. ጤፍ\n2. ቡና\n3. በቆሎ\n0. ተመለስ");
        }
        setSessionInput('');
      }, 300);
      return;
    }

    // REPORT
    if (screen === 'MENU_REPORT') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onRequestSupport(currentInput);
        setScreen('RESULT');
        setDisplayText(ussdLang === 'en' ? "Report Sent!\n0. Exit" : "ሪፖርት ተልኳል!\n0. ውጣ");
        setSessionInput('');
      }, 500);
      return;
    }

    // Result/End
    if (screen === 'RESULT') {
      if (currentInput === '0') {
        goBackToMain();
      } else {
         setLoading(true);
         setTimeout(() => {
             setLoading(false);
             setScreen('IDLE');
             setInput('');
             setSessionInput('');
         }, 200);
      }
    }
  }, [screen, ussdLang, marketPrices, dealerInventory, onRequestSupport, onCreateOffer, onCreateOrder, selectedSellCrop, selectedBuyProduct, goBackToMain, displayText, registeredUser, tempRegName]);

  // Keypad Handlers
  const handleKeypadPress = useCallback((key: string) => {
    if (screen === 'IDLE' || screen === 'DIALING') {
        if (screen === 'IDLE') setScreen('DIALING');
        setInput(prev => prev + key);
    } else {
        setSessionInput(prev => prev + key);
    }
  }, [screen]);

  const handleSend = () => {
    if (screen === 'IDLE' || screen === 'DIALING') {
        processUSSD(input);
    } else {
        processUSSD(sessionInput);
    }
  };

  const handleBackspace = () => {
    if (screen === 'IDLE' || screen === 'DIALING') {
        setInput(prev => prev.slice(0, -1));
        if (input.length <= 1) setScreen('IDLE');
    } else {
        setSessionInput(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      // Allow any single character input (letters, numbers) AND SPACE for full names
      if (key.length === 1) {
        handleKeypadPress(key);
      } else if (key === 'Enter') {
        handleSend();
      } else if (key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeypadPress, handleSend, handleBackspace]);

  const isSessionActive = screen !== 'IDLE' && screen !== 'DIALING';

  /* --------------------------------------------------------------------------------
   *  RENDER: FEATURE PHONE (BUTTON MOBILE)
   * -------------------------------------------------------------------------------- */
  if (deviceType === 'FEATURE_PHONE') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 w-full">
        {/* Sleek Dark Feature Phone Body */}
        <div className="relative bg-slate-900 rounded-[2.5rem] p-4 pb-8 w-[280px] h-auto shadow-2xl border-4 border-slate-700 select-none flex flex-col items-center group ring-8 ring-slate-200/50 dark:ring-slate-900/50 transition-transform duration-300 transform hover:scale-[1.01]">
            
            {/* Earpiece */}
            <div className="w-16 h-1.5 bg-slate-800 rounded-full mb-4 border border-slate-700 shadow-inner shrink-0"></div>

            {/* Screen Area */}
            <div className="w-full bg-slate-800 p-2 rounded-xl mb-4 border-2 border-slate-700 shadow-inner shrink-0">
                {/* LCD Display */}
                <div className="w-full h-40 bg-[#98a68a] rounded-sm p-1.5 font-mono text-xs flex flex-col shadow-[inset_0_0_15px_rgba(0,0,0,0.15)] relative overflow-hidden border border-[#89967a]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

                    {/* Status Bar */}
                    <div className="flex justify-between items-center border-b border-black/10 pb-0.5 mb-1 text-[9px] font-bold text-slate-800 z-10">
                        <span className="flex items-center gap-0.5"><Signal size={8} className="fill-current"/> 4G</span>
                        <span>{time}</span>
                        <span className="flex items-center gap-0.5"><Battery size={8} className="fill-current"/> 85%</span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar z-10 text-slate-900 font-semibold leading-tight whitespace-pre-wrap">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <span className="animate-pulse">{t.loading}</span>
                            </div>
                        ) : (
                            isSessionActive ? displayText : (
                                <div className="h-full flex flex-col justify-end">
                                    <div className="text-right text-lg tracking-widest mb-1">{input}</div>
                                    <div className="text-center text-[10px] opacity-60 mt-auto">{t.ussd_prompt}</div>
                                </div>
                            )
                        )}
                    </div>
                    
                    {/* Input Preview for Session */}
                    {isSessionActive && !loading && (
                         <div className="border-t border-black/10 pt-0.5 mt-0.5 flex justify-between items-center text-slate-900 z-10">
                             <span>{t.input}:</span>
                             <span className="font-bold">{sessionInput}<span className="animate-pulse">_</span></span>
                         </div>
                    )}
                </div>
            </div>

            {/* Navigation Cluster */}
            <div className="w-full px-2 mb-4 flex justify-between items-center text-slate-300 shrink-0">
                <button 
                  onClick={() => isSessionActive ? setScreen('IDLE') : handleBackspace()} 
                  className="flex flex-col items-center active:scale-95 transition-transform"
                >
                    <div className="w-10 h-3 bg-slate-700 rounded-sm mb-1 border-b border-slate-900 shadow-sm"></div>
                    <span className="text-[8px] uppercase tracking-wider">{isSessionActive ? t.cancel : t.clear}</span>
                </button>
                
                {/* D-Pad */}
                <div className="w-20 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-lg relative mx-2">
                   <div className="absolute top-1 text-slate-500"><ChevronUp size={12} /></div>
                   <div className="absolute bottom-1 text-slate-500"><ChevronDown size={12} /></div>
                   <button 
                      onClick={handleSend}
                      className="w-8 h-6 bg-slate-700 rounded-md border border-slate-600 shadow-sm active:bg-slate-800 active:shadow-inner flex items-center justify-center"
                   >
                       <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                   </button>
                </div>

                <button 
                  onClick={handleSend} 
                  className="flex flex-col items-center active:scale-95 transition-transform"
                >
                    <div className="w-10 h-3 bg-slate-700 rounded-sm mb-1 border-b border-slate-900 shadow-sm"></div>
                    <span className="text-[8px] uppercase tracking-wider">{isSessionActive ? t.select : t.menu}</span>
                </button>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full px-2 shrink-0">
                {/* Call Buttons */}
                <div className="col-span-3 grid grid-cols-2 gap-8 mb-2 px-1">
                     <button 
                        onClick={handleSend}
                        className="h-9 bg-green-700 rounded-l-xl flex items-center justify-center shadow-[0_3px_0_rgb(21,128,61)] active:translate-y-[2px] active:shadow-none border-t border-green-600 text-white"
                     >
                         <Phone size={14} className="fill-current" />
                     </button>
                     <button 
                        onClick={() => { setScreen('IDLE'); setInput(''); setSessionInput(''); }}
                        className="h-9 bg-red-700 rounded-r-xl flex items-center justify-center shadow-[0_3px_0_rgb(185,28,28)] active:translate-y-[2px] active:shadow-none border-t border-red-600 text-white"
                     >
                         <Phone size={14} className="rotate-[135deg] fill-current" />
                     </button>
                </div>

                {/* Numbers */}
                {['1', '2 abc', '3 def', '4 ghi', '5 jkl', '6 mno', '7 pqrs', '8 tuv', '9 wxyz', '*', '0 +', '#'].map((key) => (
                  <button 
                    key={key}
                    onClick={() => handleKeypadPress(key.split(' ')[0])}
                    className="h-9 bg-slate-800 rounded-lg flex flex-col items-center justify-center shadow-[0_3px_0_rgb(15,23,42)] active:translate-y-[3px] active:shadow-none border border-slate-700/50 hover:bg-slate-750 transition-colors"
                  >
                    <span className="text-white font-bold text-sm leading-none">{key.split(' ')[0]}</span>
                    {key.split(' ')[1] && <span className="text-[7px] text-slate-500 uppercase tracking-tight leading-none mt-0.5">{key.split(' ')[1]}</span>}
                  </button>
                ))}
            </div>
            
            {/* Branding */}
            <div className="mt-4 text-slate-600 font-bold text-xs tracking-widest opacity-50">AGRI-MOBILE</div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------------
   *  RENDER: SMARTPHONE (TOUCH)
   * -------------------------------------------------------------------------------- */
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 w-full">
      <div className="relative bg-black rounded-[3rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden w-full max-w-[320px] h-[640px] select-none ring-4 ring-slate-900/20">
        <div className="w-full h-full bg-white dark:bg-slate-950 relative flex flex-col font-sans">
            <div className="h-8 bg-transparent absolute top-0 w-full z-20 flex justify-between items-center px-6 text-xs font-medium text-black dark:text-white pt-2">
                <span className="font-bold tracking-wide">EthioTel</span>
                <div className="flex items-center gap-1.5">
                    <Signal size={14} className="fill-current" />
                    <span className="text-[10px]">4G</span>
                    <Battery size={14} className="fill-current ml-1" />
                    <span>{time}</span>
                </div>
            </div>

            {isSessionActive ? (
                <div className="flex-1 relative flex items-center justify-center p-6 z-10">
                     <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-600 via-teal-700 to-blue-800 opacity-90"></div>
                     <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
                     
                     {loading ? (
                         <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-2xl p-6 shadow-2xl flex flex-col items-center z-20 animate-in fade-in zoom-in-95">
                             <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
                             <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">USSD code running...</p>
                         </div>
                     ) : (
                        <div className="bg-white dark:bg-slate-800 w-full rounded-lg shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                             <div className="bg-slate-100 dark:bg-slate-700/50 px-4 py-2 border-b border-slate-200 dark:border-slate-600">
                                 <p className="text-xs font-mono text-slate-500 dark:text-slate-400">USSD Response</p>
                             </div>
                             <div className="p-4 max-h-64 overflow-y-auto">
                                 <p className="text-sm font-medium text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                                     {displayText}
                                 </p>
                             </div>
                             {screen !== 'RESULT' && (
                                <div className="px-4 pb-2">
                                    <div className="relative group cursor-text">
                                        <div className="w-full bg-transparent py-2 text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-600 flex items-center h-9 overflow-hidden">
                                            {sessionInput ? (
                                                <>
                                                    <span className="font-medium tracking-wide">{sessionInput}</span>
                                                    {/* Caret after text */}
                                                    <span className="w-0.5 h-5 bg-emerald-500 ml-0.5 animate-pulse"></span>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Caret before placeholder */}
                                                    <span className="w-0.5 h-5 bg-emerald-500 mr-0.5 animate-pulse"></span>
                                                    <span className="text-slate-400 font-light italic">Enter response...</span>
                                                </>
                                            )}
                                        </div>
                                        {/* Focus Bar */}
                                        <div className="absolute bottom-0 left-0 h-[2px] bg-emerald-500 w-full animate-[expandWidth_0.3s_ease-out]"></div>
                                    </div>
                                    <div className="text-right text-xs text-slate-400 mt-1 h-4">{sessionInput.length}/10</div>
                                </div>
                             )}
                             <div className="grid grid-cols-2 border-t border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700">
                                 <button 
                                     onClick={() => { setScreen('IDLE'); setInput(''); setSessionInput(''); }}
                                     className="py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 transition-colors"
                                 >
                                     Cancel
                                 </button>
                                 <button 
                                     onClick={handleSend}
                                     className="py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 active:bg-emerald-100 transition-colors"
                                 >
                                     Send
                                 </button>
                             </div>
                         </div>
                     )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
                    <div className="flex-1 flex flex-col justify-end px-8 pb-8">
                        <div className="text-center mb-6">
                            <span className={`font-light text-slate-900 dark:text-white transition-all ${input.length > 8 ? 'text-2xl' : 'text-4xl'}`}>
                                {input || <span className="opacity-0">_</span>}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleKeypadPress(key)}
                                    className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 flex flex-col items-center justify-center transition-colors mx-auto group"
                                >
                                    <span className="text-2xl font-medium text-slate-900 dark:text-white">{key}</span>
                                    {/[2-9]/.test(key) && (
                                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-1 group-hover:text-slate-600">
                                            {key === '2' ? 'abc' : key === '3' ? 'def' : key === '4' ? 'ghi' : key === '5' ? 'jkl' : key === '6' ? 'mno' : key === '7' ? 'pqrs' : key === '8' ? 'tuv' : 'wxyz'}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 grid grid-cols-3 items-center">
                            <div></div>
                            <button 
                                onClick={handleSend}
                                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-200 dark:shadow-green-900/20 flex items-center justify-center mx-auto"
                            >
                                <Phone size={28} className="text-white fill-current" />
                            </button>
                            <div className="flex justify-center">
                                {input && (
                                    <button 
                                        onClick={handleBackspace}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <Delete size={24} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="h-16 border-t border-slate-100 dark:border-slate-800 flex justify-around items-center text-slate-400">
                        <div className="flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-500">
                             <Phone size={20} className="fill-current" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                             <div className="w-5 h-5 rounded-full border-2 border-current"></div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                             <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">A</div>
                        </div>
                    </div>
                </div>
            )}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 dark:bg-white/20 rounded-full z-30"></div>
            
            <style>{`
                @keyframes expandWidth {
                    from { width: 0; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
      </div>
    </div>
  );
};

export default USSDSimulator;
