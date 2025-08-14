import { AdapterFactory } from '../adapters';
import { Message, PriceDetectedPayload, UpdateWidgetPayload, SavingsData } from '../shared/types';
import { createSavingsWidget } from '../components/savings-widget';

let currentAdapter: ReturnType<typeof AdapterFactory.createAdapter> = null;
let widgetElement: HTMLElement | null = null;

function init() {
  console.log('Currency Arbitrage Extension: Initializing...');
  
  currentAdapter = AdapterFactory.createAdapter();
  
  if (!currentAdapter) {
    console.log('Currency Arbitrage Extension: Site not supported');
    return;
  }
  
  console.log(`Currency Arbitrage Extension: ${currentAdapter!.siteName} adapter loaded`);
  
  setTimeout(() => {
    detectAndProcessPrice();
    
    currentAdapter!.observePriceChanges((price) => {
      console.log('Price change detected:', price);
      sendPriceToBackground(price);
    });
  }, 2000);
}

async function detectAndProcessPrice() {
  if (!currentAdapter) return;
  
  const price = currentAdapter.detectPrice();
  
  if (price) {
    console.log('Price detected:', price);
    await sendPriceToBackground(price);
  } else {
    console.log('No price detected yet, will retry...');
    setTimeout(detectAndProcessPrice, 3000);
  }
}

async function sendPriceToBackground(price: any) {
  if (!currentAdapter) return;
  
  const message: Message<PriceDetectedPayload> = {
    type: 'PRICE_DETECTED',
    payload: {
      price,
      site: currentAdapter.siteId,
      url: window.location.href
    },
    timestamp: Date.now()
  };
  
  try {
    const savingsData = await chrome.runtime.sendMessage(message);
    if (savingsData) {
      updateWidget(savingsData);
    }
  } catch (error) {
    console.error('Failed to send price to background:', error);
  }
}

function updateWidget(savingsData: SavingsData) {
  if (!currentAdapter) return;
  
  if (!widgetElement) {
    widgetElement = createSavingsWidget(savingsData);
    const container = currentAdapter.getUIContainer();
    if (container) {
      currentAdapter.injectUI(container, widgetElement);
    }
  } else {
    updateSavingsWidget(widgetElement, savingsData);
  }
}

function updateSavingsWidget(widget: HTMLElement, savingsData: SavingsData) {
  const savingsAmount = widget.querySelector('.ca-savings-amount');
  const savingsCurrency = widget.querySelector('.ca-savings-currency');
  const savingsPercentage = widget.querySelector('.ca-savings-percentage');
  
  if (savingsData.bestOption) {
    if (savingsAmount) {
      savingsAmount.textContent = `${savingsData.bestOption.targetCurrency.symbol}${savingsData.bestOption.netSavings.toFixed(2)}`;
    }
    if (savingsCurrency) {
      savingsCurrency.textContent = `${savingsData.bestOption.targetCurrency.flagEmoji} ${savingsData.bestOption.targetCurrency.name}`;
    }
    if (savingsPercentage) {
      savingsPercentage.textContent = `${savingsData.bestOption.savingsPercentage.toFixed(0)}%`;
    }
  }
}

chrome.runtime.onMessage.addListener((message: Message, _sender, _sendResponse) => {
  if (message.type === 'UPDATE_WIDGET') {
    const payload = message.payload as UpdateWidgetPayload;
    updateWidget(payload.savingsData);
  }
  return false;
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('beforeunload', () => {
  if (currentAdapter) {
    currentAdapter.cleanup();
  }
});