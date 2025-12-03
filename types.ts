
export enum UserRole {
  FARMER = 'FARMER',
  DEALER = 'DEALER',
  AGENT = 'AGENT'
}

// What the Dealer sells to Farmers (Inputs)
export interface Product {
  id: string;
  name: string;
  category: 'Seeds' | 'Fertilizer' | 'Tools' | 'Pesticide';
  price: number;
  stock: number;
  unit: string;
  image?: string; // URL or base64
}

// Orders where Farmers buy Inputs from Dealers
export interface InputOrder {
  id: string;
  farmerName: string; // Simulated for USSD
  productName: string;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  timestamp: string;
}

export interface MarketPrice {
  crop: string;
  pricePerKg: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface Ticket {
  id: string;
  farmerName: string;
  phoneNumber: string;
  issue: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  timestamp: string;
  priority: 'Low' | 'Medium' | 'High';
  aiSuggestion?: string;
}

export interface SMSMessage {
  id: string;
  sender: 'System' | 'Farmer';
  text: string;
  timestamp: string;
  translationKey?: string; // Key in TRANSLATIONS
  translationParams?: Record<string, string>; // Params to replace in template
}

export interface HistoryLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

// What Farmers sell to Dealers (Produce)
export interface CropOffer {
  id: string;
  farmerName: string;
  crop: string;
  quantity: number; // in Quintals (100kg)
  status: 'Pending' | 'Accepted' | 'Rejected';
  timestamp: string;
}

export type Language = 'en' | 'am';
