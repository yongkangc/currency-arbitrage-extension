import { Price, PriceSelectors, SupportedSite } from '@shared/types';

export abstract class SiteAdapter {
  protected observer: MutationObserver | null = null;
  
  abstract readonly siteName: string;
  abstract readonly siteId: string;
  abstract readonly domain: string;
  abstract readonly priceSelectors: PriceSelectors;
  
  constructor() {
    this.observer = null;
  }
  
  abstract extractPrice(element: Element): Price | null;
  
  abstract injectUI(container: Element, widget: HTMLElement): void;
  
  abstract getUIContainer(): Element | null;
  
  detectPrice(): Price | null {
    const selectors = this.priceSelectors.selectors;
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        const price = this.extractPrice(element);
        if (price) {
          return price;
        }
      }
    }
    
    if (this.priceSelectors.patterns) {
      const price = this.detectPriceByPattern();
      if (price) {
        return price;
      }
    }
    
    return null;
  }
  
  protected detectPriceByPattern(): Price | null {
    const patterns = this.priceSelectors.patterns;
    if (!patterns || patterns.length === 0) return null;
    
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const text = node.textContent?.trim();
          if (!text) return NodeFilter.FILTER_REJECT;
          
          for (const pattern of patterns) {
            if (pattern.test(text)) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (text) {
        const price = this.parsePriceFromText(text);
        if (price) {
          return price;
        }
      }
    }
    
    return null;
  }
  
  protected parsePriceFromText(text: string): Price | null {
    const currencySymbols: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      'R$': 'BRL',
      '₺': 'TRY',
      'A$': 'AUD',
      'C$': 'CAD',
    };
    
    const pricePattern = /([A-Z]{0,2}[$€£¥₹₺]\s*)?([\d,]+\.?\d{0,2})\s*([A-Z]{3})?/;
    const match = text.match(pricePattern);
    
    if (match) {
      const [, prefix, amount, suffix] = match;
      const cleanAmount = parseFloat(amount.replace(/,/g, ''));
      
      if (isNaN(cleanAmount)) return null;
      
      let currency = 'USD';
      
      if (suffix && suffix.length === 3) {
        currency = suffix;
      } else if (prefix) {
        for (const [symbol, code] of Object.entries(currencySymbols)) {
          if (prefix.includes(symbol)) {
            currency = code;
            break;
          }
        }
      }
      
      return {
        amount: cleanAmount,
        currency,
        formatted: text,
        detectedAt: Date.now()
      };
    }
    
    return null;
  }
  
  observePriceChanges(callback: (price: Price) => void): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    const container = this.getObserverContainer();
    if (!container) return;
    
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    this.observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const price = this.detectPrice();
        if (price) {
          callback(price);
        }
      }, 500);
    });
    
    this.observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'data-price', 'data-amount']
    });
  }
  
  protected getObserverContainer(): Element {
    return document.body;
  }
  
  stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  isSupported(): boolean {
    return window.location.hostname.includes(this.domain);
  }
  
  waitForElement(selector: string, timeout: number = 10000): Promise<Element | null> {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });
      
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }
  
  cleanup(): void {
    this.stopObserving();
    const widgets = document.querySelectorAll('[data-currency-arbitrage-widget]');
    widgets.forEach(widget => widget.remove());
  }
  
  getSiteInfo(): SupportedSite {
    return {
      id: this.siteId,
      name: this.siteName,
      domain: this.domain
    };
  }
}