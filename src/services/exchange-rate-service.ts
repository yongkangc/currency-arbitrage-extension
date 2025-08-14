import { ExchangeRates } from '../shared/types';

export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private cache: Map<string, { rates: ExchangeRates; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY || 'demo-key';
  
  private constructor() {}
  
  static getInstance(): ExchangeRateService {
    if (!this.instance) {
      this.instance = new ExchangeRateService();
    }
    return this.instance;
  }
  
  async getRates(base: string = 'USD'): Promise<ExchangeRates> {
    const cacheKey = base.toUpperCase();
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isStale(cached.timestamp)) {
      return cached.rates;
    }
    
    try {
      const rates = await this.fetchFromPrimary(base);
      this.cache.set(cacheKey, { rates, timestamp: Date.now() });
      await this.saveToStorage(cacheKey, rates);
      return rates;
    } catch (error) {
      console.error('Failed to fetch from primary API:', error);
      
      try {
        const rates = await this.fetchFromFallback(base);
        this.cache.set(cacheKey, { rates, timestamp: Date.now() });
        await this.saveToStorage(cacheKey, rates);
        return rates;
      } catch (fallbackError) {
        console.error('Failed to fetch from fallback API:', fallbackError);
        
        const storedRates = await this.loadFromStorage(cacheKey);
        if (storedRates) {
          return storedRates;
        }
        
        return this.getMockRates(base);
      }
    }
  }
  
  private async fetchFromPrimary(base: string): Promise<ExchangeRates> {
    const url = `https://v6.exchangerate-api.com/v6/${this.API_KEY}/latest/${base}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      base: data.base_code,
      rates: data.conversion_rates,
      timestamp: Date.now()
    };
  }
  
  private async fetchFromFallback(base: string): Promise<ExchangeRates> {
    const url = `https://api.fixer.io/latest?base=${base}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      base: data.base,
      rates: data.rates,
      timestamp: Date.now()
    };
  }
  
  private getMockRates(base: string): ExchangeRates {
    const mockRates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      AUD: 1.35,
      CAD: 1.25,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.5,
      BRL: 5.25,
      MXN: 20.0,
      TRY: 8.5,
      ARS: 98.0,
      PHP: 50.0,
      IDR: 14350
    };
    
    if (base !== 'USD') {
      const baseRate = mockRates[base] || 1;
      const adjustedRates: Record<string, number> = {};
      
      for (const [currency, rate] of Object.entries(mockRates)) {
        adjustedRates[currency] = rate / baseRate;
      }
      
      return {
        base,
        rates: adjustedRates,
        timestamp: Date.now()
      };
    }
    
    return {
      base,
      rates: mockRates,
      timestamp: Date.now()
    };
  }
  
  private isStale(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_DURATION;
  }
  
  private async saveToStorage(key: string, rates: ExchangeRates): Promise<void> {
    try {
      await chrome.storage.local.set({
        [`exchange_rates_${key}`]: {
          rates,
          savedAt: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to save rates to storage:', error);
    }
  }
  
  private async loadFromStorage(key: string): Promise<ExchangeRates | null> {
    try {
      const result = await chrome.storage.local.get(`exchange_rates_${key}`);
      const stored = result[`exchange_rates_${key}`];
      
      if (stored && stored.rates) {
        return stored.rates;
      }
    } catch (error) {
      console.error('Failed to load rates from storage:', error);
    }
    
    return null;
  }
  
  convertAmount(amount: number, from: string, to: string, rates: ExchangeRates): number {
    if (from === to) return amount;
    
    if (rates.base === from) {
      return amount * (rates.rates[to] || 1);
    }
    
    const fromRate = rates.rates[from] || 1;
    const toRate = rates.rates[to] || 1;
    
    return (amount / fromRate) * toRate;
  }
}