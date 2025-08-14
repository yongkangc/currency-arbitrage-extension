import { SavingsData } from '../shared/types';

export function createSavingsWidget(savingsData: SavingsData): HTMLElement {
  const widget = document.createElement('div');
  widget.setAttribute('data-currency-arbitrage-widget', 'true');
  widget.className = 'ca-widget';
  
  if (!savingsData.bestOption) {
    widget.innerHTML = `
      <div class="ca-widget-content ca-widget-loading">
        <div class="ca-spinner"></div>
        <span>Checking savings...</span>
      </div>
    `;
    return widget;
  }
  
  const { bestOption } = savingsData;
  
  widget.innerHTML = `
    <div class="ca-widget-content">
      <div class="ca-widget-header">
        <span class="ca-widget-title">💰 Save Money!</span>
        <button class="ca-widget-close" aria-label="Close">×</button>
      </div>
      
      <div class="ca-widget-body">
        <div class="ca-savings-summary">
          <div class="ca-savings-main">
            <span class="ca-savings-percentage">${bestOption.savingsPercentage.toFixed(0)}%</span>
            <span class="ca-savings-label">savings</span>
          </div>
          
          <div class="ca-savings-details">
            <div class="ca-savings-amount-row">
              <span>Save</span>
              <span class="ca-savings-amount">${bestOption.targetCurrency.symbol}${bestOption.netSavings.toFixed(2)}</span>
              <span>/month</span>
            </div>
            
            <div class="ca-savings-currency-row">
              <span>Pay in</span>
              <span class="ca-savings-currency">
                ${bestOption.targetCurrency.flagEmoji} ${bestOption.targetCurrency.name}
              </span>
            </div>
            
            ${bestOption.requiresVPN ? `
              <div class="ca-vpn-notice">
                <span class="ca-vpn-icon">🔒</span>
                <span>VPN required</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="ca-widget-actions">
          <button class="ca-btn ca-btn-primary" data-action="apply">
            Apply Savings
          </button>
          <button class="ca-btn ca-btn-secondary" data-action="learn-more">
            Learn More
          </button>
        </div>
        
        <div class="ca-widget-footer">
          <a href="#" class="ca-see-all-options" data-action="see-all">
            See all ${savingsData.opportunities.length} options →
          </a>
        </div>
      </div>
    </div>
  `;
  
  attachEventListeners(widget, savingsData);
  
  return widget;
}

function attachEventListeners(widget: HTMLElement, savingsData: SavingsData) {
  const closeBtn = widget.querySelector('.ca-widget-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      widget.style.display = 'none';
      chrome.storage.session.set({ widgetDismissed: true });
    });
  }
  
  const applyBtn = widget.querySelector('[data-action="apply"]');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      if (savingsData.bestOption) {
        handleApplySavings(savingsData.bestOption);
      }
    });
  }
  
  const learnMoreBtn = widget.querySelector('[data-action="learn-more"]');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => {
      showLearnMoreModal(savingsData);
    });
  }
  
  const seeAllLink = widget.querySelector('[data-action="see-all"]');
  if (seeAllLink) {
    seeAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAllOptionsModal(savingsData);
    });
  }
}

function handleApplySavings(bestOption: any) {
  chrome.runtime.sendMessage({
    type: 'TRACK_EVENT',
    payload: {
      event: 'apply_savings',
      category: 'engagement',
      label: bestOption.targetCurrency.code,
      value: bestOption.netSavings
    },
    timestamp: Date.now()
  });
  
  if (bestOption.requiresVPN) {
    showVPNRecommendations();
  } else {
    showPaymentMethodGuide(bestOption);
  }
}

function showLearnMoreModal(_savingsData: SavingsData) {
  const modal = createModal('How Currency Arbitrage Works', `
    <div class="ca-modal-content">
      <h3>Save Money with Regional Pricing</h3>
      <p>Many subscription services offer different prices in different countries. By changing your payment region, you can access these lower prices legally.</p>
      
      <h4>How it works:</h4>
      <ol>
        <li>We detect your current subscription price</li>
        <li>Compare it with prices in other regions</li>
        <li>Calculate your potential savings (including fees)</li>
        <li>Help you switch to the best option</li>
      </ol>
      
      <h4>Is this legal?</h4>
      <p>Yes! You're simply choosing to pay in a different currency. Many digital nomads and travelers do this regularly.</p>
      
      <h4>What you need:</h4>
      <ul>
        <li>A payment method that works internationally</li>
        <li>VPN for some regions (we'll guide you)</li>
        <li>5 minutes to make the switch</li>
      </ul>
    </div>
  `);
  
  document.body.appendChild(modal);
}

function showAllOptionsModal(savingsData: SavingsData) {
  const optionsHTML = savingsData.opportunities.map(opp => `
    <div class="ca-option-card">
      <div class="ca-option-header">
        <span class="ca-option-flag">${opp.targetCurrency.flagEmoji}</span>
        <span class="ca-option-currency">${opp.targetCurrency.name}</span>
        ${opp.requiresVPN ? '<span class="ca-vpn-badge">VPN</span>' : ''}
      </div>
      <div class="ca-option-savings">
        <span class="ca-option-percentage">${opp.savingsPercentage.toFixed(0)}%</span>
        <span class="ca-option-amount">${opp.targetCurrency.symbol}${opp.netSavings.toFixed(2)}/mo</span>
      </div>
      <button class="ca-btn ca-btn-sm" data-currency="${opp.targetCurrency.code}">
        Choose This
      </button>
    </div>
  `).join('');
  
  const modal = createModal('All Savings Options', `
    <div class="ca-modal-content">
      <div class="ca-options-grid">
        ${optionsHTML}
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
}

function showVPNRecommendations() {
  const modal = createModal('VPN Recommended', `
    <div class="ca-modal-content">
      <h3>You'll need a VPN for this region</h3>
      <p>To access regional pricing, you'll need to appear to be browsing from that country.</p>
      
      <h4>Recommended VPN Services:</h4>
      <div class="ca-vpn-options">
        <div class="ca-vpn-card">
          <h5>NordVPN</h5>
          <p>Fast, reliable, 30-day money-back guarantee</p>
          <a href="#" class="ca-btn ca-btn-primary">Get NordVPN</a>
        </div>
        <div class="ca-vpn-card">
          <h5>ExpressVPN</h5>
          <p>Premium service, excellent for streaming</p>
          <a href="#" class="ca-btn ca-btn-primary">Get ExpressVPN</a>
        </div>
      </div>
      
      <p class="ca-disclaimer">
        <small>We may earn a commission from VPN signups. This helps keep the extension free.</small>
      </p>
    </div>
  `);
  
  document.body.appendChild(modal);
}

function showPaymentMethodGuide(bestOption: any) {
  const modal = createModal('How to Switch', `
    <div class="ca-modal-content">
      <h3>Switch to ${bestOption.targetCurrency.name}</h3>
      
      <h4>Step 1: Cancel Current Subscription</h4>
      <p>Go to your account settings and cancel your current subscription.</p>
      
      <h4>Step 2: Use International Payment</h4>
      <p>You'll need a payment method that works internationally:</p>
      <ul>
        <li>Revolut (Recommended)</li>
        <li>Wise (TransferWise)</li>
        <li>PayPal</li>
        <li>International credit card</li>
      </ul>
      
      <h4>Step 3: Resubscribe</h4>
      <p>Sign up again and select ${bestOption.targetCurrency.name} as your payment currency.</p>
      
      <div class="ca-action-buttons">
        <a href="#" class="ca-btn ca-btn-primary">Get Revolut Card</a>
        <a href="#" class="ca-btn ca-btn-secondary">Get Wise Card</a>
      </div>
    </div>
  `);
  
  document.body.appendChild(modal);
}

function createModal(title: string, content: string): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'ca-modal';
  modal.innerHTML = `
    <div class="ca-modal-backdrop"></div>
    <div class="ca-modal-dialog">
      <div class="ca-modal-header">
        <h2>${title}</h2>
        <button class="ca-modal-close">×</button>
      </div>
      <div class="ca-modal-body">
        ${content}
      </div>
    </div>
  `;
  
  const closeBtn = modal.querySelector('.ca-modal-close');
  const backdrop = modal.querySelector('.ca-modal-backdrop');
  
  const closeModal = () => modal.remove();
  
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  
  return modal;
}