import { SavingsData } from '../shared/types';

document.addEventListener('DOMContentLoaded', async () => {
  await updateCurrentSite();
  await loadSavingsHistory();
  attachEventListeners();
});

async function updateCurrentSite() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const siteStatus = document.getElementById('current-site');
  
  if (!tab || !tab.url) {
    if (siteStatus) {
      siteStatus.innerHTML = `
        <div class="site-status">
          <span class="status-icon">❌</span>
          <span class="status-text">No active tab</span>
        </div>
      `;
    }
    return;
  }
  
  const url = new URL(tab.url);
  const supported = ['netflix.com', 'spotify.com', 'adobe.com'].some(domain => 
    url.hostname.includes(domain)
  );
  
  if (siteStatus) {
    if (supported) {
      siteStatus.innerHTML = `
        <div class="site-status supported">
          <span class="status-icon">✅</span>
          <span class="status-text">${url.hostname} - Supported!</span>
        </div>
      `;
      
      checkForSavings(tab);
    } else {
      siteStatus.innerHTML = `
        <div class="site-status unsupported">
          <span class="status-icon">ℹ️</span>
          <span class="status-text">${url.hostname} - Not supported yet</span>
        </div>
      `;
    }
  }
}

async function checkForSavings(tab: chrome.tabs.Tab) {
  if (!tab.id) return;
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'GET_CURRENT_SAVINGS',
      timestamp: Date.now()
    });
    
    if (response && response.savingsData) {
      displaySavings(response.savingsData);
    }
  } catch (error) {
    console.log('No savings data available yet');
  }
}

function displaySavings(savingsData: SavingsData) {
  const summaryEl = document.getElementById('savings-summary');
  if (!summaryEl) return;
  
  if (savingsData.bestOption) {
    const amountEl = summaryEl.querySelector('.amount');
    const percentageEl = summaryEl.querySelector('.percentage');
    
    if (amountEl) {
      amountEl.textContent = `${savingsData.bestOption.targetCurrency.symbol}${savingsData.bestOption.netSavings.toFixed(2)}`;
    }
    
    if (percentageEl) {
      percentageEl.textContent = `${savingsData.bestOption.savingsPercentage.toFixed(0)}%`;
    }
    
    summaryEl.classList.remove('hidden');
  }
}

async function loadSavingsHistory() {
  const result = await chrome.storage.local.get('savingsHistory');
  const history = result.savingsHistory || [];
  
  const totalSaved = history.reduce((sum: number, record: any) => 
    sum + (record.savedAmount || 0), 0
  );
  
  const uniqueSites = new Set(history.map((record: any) => record.site)).size;
  
  const totalSavedEl = document.getElementById('total-saved');
  const sitesOptimizedEl = document.getElementById('sites-optimized');
  
  if (totalSavedEl) {
    totalSavedEl.textContent = `$${totalSaved.toFixed(2)}`;
  }
  
  if (sitesOptimizedEl) {
    sitesOptimizedEl.textContent = uniqueSites.toString();
  }
}

function attachEventListeners() {
  const applySavingsBtn = document.getElementById('apply-savings');
  if (applySavingsBtn) {
    applySavingsBtn.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'APPLY_SAVINGS',
          timestamp: Date.now()
        });
        window.close();
      }
    });
  }
  
  const settingsBtn = document.getElementById('open-settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
  
  const historyBtn = document.getElementById('view-history');
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/history.html') });
    });
  }
  
  const helpBtn = document.getElementById('get-help');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://github.com/currency-arbitrage/docs' });
    });
  }
}