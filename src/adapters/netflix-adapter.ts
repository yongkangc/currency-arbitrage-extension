import { SiteAdapter } from './base-adapter';
import { Price, PriceSelectors } from '../shared/types';

export class NetflixAdapter extends SiteAdapter {
  readonly siteName = 'Netflix';
  readonly siteId = 'netflix';
  readonly domain = 'netflix.com';
  
  readonly priceSelectors: PriceSelectors = {
    selectors: [
      '[data-uia="plan-price"]',
      '.price-text',
      '.planGrid__cell--price',
      '.plan-price',
      'div[class*="price"] span',
      'span[class*="price"]'
    ],
    patterns: [
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
    
    return this.parsePriceFromText(text);
  }
  
  injectUI(container: Element, widget: HTMLElement): void {
    widget.style.position = 'fixed';
    widget.style.top = '20px';
    widget.style.right = '20px';
    widget.style.zIndex = '999999';
    
    container.appendChild(widget);
  }
  
  getUIContainer(): Element | null {
    return document.querySelector('.default-ltr-cache-1d3w5wq') || 
           document.querySelector('[data-uia="plan-form-container"]') ||
           document.body;
  }
  
  protected getObserverContainer(): Element {
    return document.querySelector('.default-ltr-cache-1d3w5wq') || 
           document.querySelector('[data-uia="plan-form-container"]') ||
           document.body;
  }
}