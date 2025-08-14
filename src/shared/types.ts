export interface Price {
  amount: number;
  currency: string;
  formatted: string;
  detectedAt: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flagEmoji?: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface SavingsOpportunity {
  originalPrice: Price;
  targetCurrency: Currency;
  convertedPrice: Price;
  savingsAmount: number;
  savingsPercentage: number;
  fees?: {
    conversion: number;
    vpn?: number;
  };
  netSavings: number;
  requiresVPN: boolean;
}

export interface SavingsData {
  opportunities: SavingsOpportunity[];
  bestOption: SavingsOpportunity | null;
  lastUpdated: number;
}

export interface SavingsRecord {
  id: string;
  site: string;
  originalPrice: Price;
  savedAmount: number;
  savedCurrency: string;
  timestamp: number;
}

export interface UserPreferences {
  enabledSites: string[];
  preferredCurrencies: string[];
  showNotifications: boolean;
  autoApplySavings: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface SupportedSite {
  id: string;
  name: string;
  domain: string;
  icon?: string;
}

export interface PriceSelectors {
  selectors: string[];
  patterns?: RegExp[];
  extractMethod?: 'text' | 'attribute' | 'custom';
}

export interface AffiliateLink {
  provider: string;
  url: string;
  commission?: number;
}

export type MessageType = 
  | 'PRICE_DETECTED'
  | 'CALCULATE_SAVINGS'
  | 'UPDATE_WIDGET'
  | 'TRACK_EVENT'
  | 'GET_PREFERENCES'
  | 'SET_PREFERENCES'
  | 'ERROR';

export interface Message<T = any> {
  type: MessageType;
  payload: T;
  timestamp: number;
  tabId?: number;
  frameId?: number;
}

export interface PriceDetectedPayload {
  price: Price;
  site: string;
  url: string;
}

export interface CalculateSavingsPayload {
  price: Price;
  targetCurrencies?: string[];
}

export interface UpdateWidgetPayload {
  savingsData: SavingsData;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface TrackEventPayload {
  event: string;
  category: string;
  label?: string;
  value?: number;
}

export interface ErrorPayload {
  error: string;
  code?: string;
  details?: any;
}

export type PriceChangeCallback = (price: Price) => void;
export type MessageHandler = (message: Message) => void | Promise<void>;