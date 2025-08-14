import { SiteAdapter } from './base-adapter';
import { Price, PriceSelectors } from '../shared/types';

export class SpotifyAdapter extends SiteAdapter {
  readonly siteName = 'Spotify';
  readonly siteId = 'spotify';
  readonly domain = 'spotify.com';
  
  readonly priceSelectors: PriceSelectors = {
    selectors: [
      '[data-testid="plan-price"]',
      '.Price-sc-1gnlvff-0',
      'span[class*="Price"]',
      'div[class*="price"] span',
      '.plan-item__price',
      'h3[class*="price"]'
    ],
    patterns: [
      /\$\d+\.?\d*\/month/,
      /\$\d+\.?\d*/,
      /USD\s*\d+\.?\d*/,
      /€\d+\.?\d*/,
      /£\d+\.?\d*/
    ],
    extractMethod: 'text'
  };
  
  extractPrice(element: Element): Price | null {
    const text = element.textContent?.trim();
    if (!text) return null;
    
    const cleanText = text.replace('/month', '').trim();
    return this.parsePriceFromText(cleanText);
  }
  
  injectUI(container: Element, widget: HTMLElement): void {
    widget.style.position = 'fixed';
    widget.style.top = '80px';
    widget.style.right = '20px';
    widget.style.zIndex = '999999';
    
    container.appendChild(widget);
  }
  
  getUIContainer(): Element | null {
    return document.querySelector('[data-testid="plans-page"]') || 
           document.querySelector('.pricing-container') ||
           document.body;
  }
  
  protected getObserverContainer(): Element {
    return document.querySelector('[data-testid="plans-page"]') || 
           document.querySelector('.pricing-container') ||
           document.body;
  }
}