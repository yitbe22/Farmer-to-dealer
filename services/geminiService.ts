
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateFarmingTip = async (language: Language = 'en'): Promise<string> => {
  if (!apiKey) {
      return language === 'am'
        ? "ምክር: የአፈር ለምነትን ለመጠበቅ በየዓመቱ ሰብል ያፈራርቁ። (ሙከራ)"
        : "Tip: Rotate your crops to maintain soil health (Mock Data - No API Key).";
  }

  try {
    const prompt = language === 'am'
      ? "ለአፍሪካ አነስተኛ ገበሬ አጭር፣ ተግባራዊ እና በቀላሉ የሚረዳ የግብርና ምክር ይስጡ። ቢበዛ 20 ቃላት። በአማርኛ ይጻፉ።"
      : "Generate a short, practical, and easy-to-understand farming tip for a smallholder farmer in Africa. Max 20 words.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || (language === 'am' ? "ለተሻለ ምርት ማሳዎን ከአረም ነጻ ያድርጉ።" : "Keep your fields weed-free to ensure better yields.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'am' ? "በደረቅ ወቅት ተገቢውን መስኖ ያረጋግጡ።" : "Ensure proper irrigation during dry spells.";
  }
};

export const analyzeSupportTicket = async (issue: string, language: Language = 'en'): Promise<string> => {
  if (!apiKey) {
      return language === 'am'
        ? "ምክር: እባክዎ የግብርና ባለሙያ ያማክሩ። (ሙከራ)"
        : "Suggestion: Please contact the local agronomist for a site visit (Mock Data).";
  }

  try {
    const prompt = language === 'am'
      ? `እርስዎ የግብርና ድጋፍ ሰጪ ባለሙያ ነዎት። አንድ ገበሬ ይህን ችግር አቅርቧል: "${issue}". አጠር ያለ እና ተግባራዊ መፍትሄ ይስጡ (ቢበዛ 50 ቃላት). መልስ በአማርኛ ይሁን።`
      : `You are an expert agricultural support agent. A farmer has reported this issue: "${issue}". Provide a concise, actionable solution (max 50 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || (language === 'am' ? "ጉዳቱ የደረሰበትን ሰብል ይለዩ እና ያስወግዱ።" : "Assess the crop for visible damage and isolate affected plants.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'am' ? "የተባይ ምልክቶችን በቅጠሎች ስር ይፈትሹ።" : "Check for pest infestation signs under leaves.";
  }
};

export const generateSMSReply = async (message: string, language: Language = 'en'): Promise<string> => {
  if (!apiKey) {
      // Robust offline fallback logic
      const lower = message.toLowerCase();
      
      if (language === 'am') {
        if (lower.includes('price') || lower.includes('ዋጋ')) return "የገበያ መረጃ:\nበቆሎ: 55 ብር/ኪሎ\nስንዴ: 85 ብር/ኪሎ\nጤፍ: 120 ብር/ኪሎ";
        if (lower.includes('sell') || lower.includes('መሸጥ')) return "ምርት ለመሸጥ: [ሰብል] [መጠን] ብለው ይላኩ። ምሳሌ: SELL TEFF 50";
        if (lower.includes('buy') || lower.includes('መግዛት')) return "ግብዓት ለመግዛት: በአቅራቢያዎ ወደሚገኝ ሱቅ ይሂዱ ወይም *808# ይጠቀሙ።";
        if (lower.includes('help') || lower.includes('እርዳታ')) return "ትዕዛዞች:\nSELL - ምርት ለመሸጥ\nBUY - ለመግዛት\nPRICE - ዋጋ ለማየት";
        return "እንኳን ደህና መጡ! እርዳታ ለማግኘት HELP ወይም እርዳታ ብለው ይላኩ።";
      }

      if (lower.includes('price')) return "MARKET UPDATE:\nMaize: 55 ETB/kg\nWheat: 85 ETB/kg\nTeff: 120 ETB/kg";
      if (lower.includes('sell')) return "To sell produce, reply with: [CROP] [QUANTITY]. Example: SELL TEFF 50";
      if (lower.includes('buy')) return "To buy inputs, visit your local dealer or use *808#.";
      if (lower.includes('hello') || lower.includes('hi')) return "Welcome! Reply SELL to offer produce, BUY for inputs, or PRICE for rates.";
      if (lower.includes('help')) return "Commands:\nSELL - Offer Crop\nBUY - Order Inputs\nPRICE - Market Rates\nTIP - Advice";
      return "Thank you. An agent will review your request. Reply HELP for options.";
  }

  try {
    const prompt = `You are an SMS automated assistant for AgriConnect Ethiopia. 
      The user is a farmer.
      
      User message: "${message}".
      Language: ${language === 'am' ? 'Amharic' : 'English'}.
      
      Instructions:
      1. Primary Goal: Help farmers SELL their produce (Teff, Coffee, etc.).
      2. Secondary Goal: Help farmers BUY inputs (Fertilizer, Seeds).
      3. If they ask for prices, give realistic Ethiopian market prices (ETB).
      4. Keep answers short (under 160 chars).
      5. Tone: Helpful, professional.
      6. IMPORTANT: Reply in ${language === 'am' ? 'AMHARIC' : 'ENGLISH'} only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || (language === 'am' ? "ሲስተም: ጥያቄዎን ማስተናገድ አልተቻለም።" : "System: Unable to process request.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'am' ? "ሲስተም: አገልግሎቱ አይሰራም። እባክዎ ትንሽ ቆይተው ይሞክሩ።" : "System: Service unavailable. Please try again later.";
  }
};
