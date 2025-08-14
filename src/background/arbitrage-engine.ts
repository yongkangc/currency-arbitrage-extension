import { Price, SavingsOpportunity } from '../shared/types';
import { ExchangeRateService } from '../services/exchange-rate-service';
import { CURRENCIES } from '../shared/currency-data';

export class ArbitrageEngine {
  private exchangeService: ExchangeRateService;
  
  constructor() {
    this.exchangeService = ExchangeRateService.getInstance();
  }
  
  async calculateSavings(
    originalPrice: Price,
    targetCurrencies: string[] = ['USD', 'EUR', 'GBP', 'INR', 'TRY', 'ARS', 'PHP']
  ): Promise<SavingsOpportunity[]> {
    const rates = await this.exchangeService.getRates(originalPrice.currency);
    const opportunities: SavingsOpportunity[] = [];
    
    for (const currencyCode of targetCurrencies) {
      if (currencyCode === originalPrice.currency) continue;
      
      const currency = CURRENCIES[currencyCode];
      if (!currency) continue;
      
      const convertedAmount = this.exchangeService.convertAmount(
        originalPrice.amount,
        originalPrice.currency,
        currencyCode,
        rates
      );
      
      const localPrice = await this.getLocalPrice(originalPrice, currencyCode);
      
      if (localPrice && localPrice < convertedAmount) {
        const savingsAmount = convertedAmount - localPrice;
        const savingsPercentage = (savingsAmount / convertedAmount) * 100;
        
        const fees = this.calculateFees(localPrice, currencyCode);
        const netSavings = savingsAmount - fees.total;
        
        if (netSavings > 0) {
          opportunities.push({
            originalPrice,
            targetCurrency: currency,
            convertedPrice: {
              amount: localPrice,
              currency: currencyCode,
              formatted: `${currency.symbol}${localPrice.toFixed(2)}`,
              detectedAt: Date.now()
            },
            savingsAmount,
            savingsPercentage,
            fees: {
              conversion: fees.conversion,
              vpn: fees.vpn
            },
            netSavings,
            requiresVPN: this.requiresVPN(currencyCode)
          });
        }
      }
    }
    
    return opportunities.sort((a, b) => b.netSavings - a.netSavings);
  }
  
  private async getLocalPrice(originalPrice: Price, targetCurrency: string): Promise<number | null> {
    const regionalPricing: Record<string, Record<string, number>> = {
      'netflix': {
        'USD': 15.99,
        'EUR': 13.99,
        'GBP': 10.99,
        'INR': 499,
        'TRY': 99.99,
        'ARS': 999,
        'PHP': 549,
        'BRL': 39.90,
        'MXN': 139
      },
      'spotify': {
        'USD': 10.99,
        'EUR': 10.99,
        'GBP': 10.99,
        'INR': 119,
        'TRY': 29.99,
        'ARS': 399,
        'PHP': 149,
        'BRL': 21.90,
        'MXN': 115
      }
    };
    
    const site = this.detectSite();
    const pricing = regionalPricing[site];
    
    if (pricing && pricing[targetCurrency]) {
      return pricing[targetCurrency];
    }
    
    const rates = await this.exchangeService.getRates(originalPrice.currency);
    return this.exchangeService.convertAmount(
      originalPrice.amount,
      originalPrice.currency,
      targetCurrency,
      rates
    );
  }
  
  private calculateFees(amount: number, currency: string): { conversion: number; vpn: number; total: number } {
    const conversionFeeRate = 0.03;
    const conversion = amount * conversionFeeRate;
    
    const vpnMonthlyFees: Record<string, number> = {
      'INR': 299,
      'TRY': 39.99,
      'ARS': 599,
      'PHP': 299,
      'BRL': 29.90,
      'MXN': 89
    };
    
    const vpn = vpnMonthlyFees[currency] ? vpnMonthlyFees[currency] / 10 : 0;
    
    return {
      conversion,
      vpn,
      total: conversion + vpn
    };
  }
  
  private requiresVPN(currency: string): boolean {
    const vpnRequiredCurrencies = ['INR', 'TRY', 'ARS', 'PHP', 'BRL', 'MXN'];
    return vpnRequiredCurrencies.includes(currency);
  }
  
  private detectSite(): string {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (hostname.includes('netflix')) return 'netflix';
    if (hostname.includes('spotify')) return 'spotify';
    if (hostname.includes('adobe')) return 'adobe';
    
    return 'unknown';
  }
}