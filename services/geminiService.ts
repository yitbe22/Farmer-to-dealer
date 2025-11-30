
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateFarmingTip = async (): Promise<string> => {
  if (!apiKey) return "Tip: Rotate your crops to maintain soil health (Mock Data - No API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, practical, and easy-to-understand farming tip for a smallholder farmer in Africa. Max 20 words.",
    });
    return response.text || "Keep your fields weed-free to ensure better yields.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ensure proper irrigation during dry spells.";
  }
};

export const analyzeSupportTicket = async (issue: string): Promise<string> => {
  if (!apiKey) return "Suggestion: Please contact the local agronomist for a site visit (Mock Data).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert agricultural support agent. A farmer has reported this issue: "${issue}". Provide a concise, actionable solution (max 50 words).`,
    });
    return response.text || "Assess the crop for visible damage and isolate affected plants.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Check for pest infestation signs under leaves.";
  }
};

export const generateSMSReply = async (message: string): Promise<string> => {
  if (!apiKey) {
      // Robust offline fallback logic
      const lower = message.toLowerCase();
      if (lower.includes('price')) return "MARKET UPDATE:\nMaize: 55 ETB/kg\nWheat: 85 ETB/kg\nTeff: 120 ETB/kg";
      if (lower.includes('sell')) return "To sell produce, reply with: [CROP] [QUANTITY]. Example: SELL TEFF 50";
      if (lower.includes('buy')) return "To buy inputs, visit your local dealer or use *808#.";
      if (lower.includes('hello') || lower.includes('hi')) return "Welcome! Reply SELL to offer produce, BUY for inputs, or PRICE for rates.";
      if (lower.includes('help')) return "Commands:\nSELL - Offer Crop\nBUY - Order Inputs\nPRICE - Market Rates\nTIP - Advice";
      return "Thank you. An agent will review your request. Reply HELP for options.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an SMS automated assistant for AgriConnect Ethiopia. 
      The user is a farmer.
      
      User message: "${message}".
      
      Instructions:
      1. Primary Goal: Help farmers SELL their produce (Teff, Coffee, etc.).
      2. Secondary Goal: Help farmers BUY inputs (Fertilizer, Seeds).
      3. If they ask for prices, give realistic Ethiopian market prices (ETB).
      4. Keep answers short (under 160 chars).
      5. Tone: Helpful, professional.`,
    });
    return response.text || "System: Unable to process request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System: Service unavailable. Please try again later.";
  }
};
