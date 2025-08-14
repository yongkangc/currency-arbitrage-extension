import { Message, PriceDetectedPayload, CalculateSavingsPayload, SavingsData } from '../shared/types';
import { ArbitrageEngine } from './arbitrage-engine';
import { ExchangeRateService } from '../services/exchange-rate-service';

const arbitrageEngine = new ArbitrageEngine();
const exchangeService = ExchangeRateService.getInstance();

chrome.runtime.onInstalled.addListener(() => {
  console.log('Currency Arbitrage Extension installed');
  
  chrome.storage.local.set({
    preferences: {
      enabledSites: ['netflix', 'spotify', 'adobe'],
      preferredCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'TRY', 'ARS', 'PHP'],
      showNotifications: true,
      autoApplySavings: false,
      theme: 'auto'
    }
  });
  
  chrome.alarms.create('updateRates', { periodInMinutes: 360 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateRates') {
    exchangeService.getRates('USD').catch(console.error);
  }
});

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(console.error);
  return true;
});

async function handleMessage(message: Message, _sender: chrome.runtime.MessageSender) {
  switch (message.type) {
    case 'PRICE_DETECTED':
      return handlePriceDetected(message.payload as PriceDetectedPayload);
    
    case 'CALCULATE_SAVINGS':
      return handleCalculateSavings(message.payload as CalculateSavingsPayload);
    
    case 'GET_PREFERENCES':
      return handleGetPreferences();
    
    case 'SET_PREFERENCES':
      return handleSetPreferences(message.payload);
    
    case 'TRACK_EVENT':
      return handleTrackEvent(message.payload);
    
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

async function handlePriceDetected(payload: PriceDetectedPayload) {
  const preferences = await getPreferences();
  const opportunities = await arbitrageEngine.calculateSavings(
    payload.price,
    preferences.preferredCurrencies
  );
  
  const savingsData: SavingsData = {
    opportunities,
    bestOption: opportunities[0] || null,
    lastUpdated: Date.now()
  };
  
  await saveSavingsHistory(payload.site, savingsData);
  
  if (savingsData.bestOption && preferences.showNotifications) {
    showNotification(savingsData.bestOption);
  }
  
  return savingsData;
}

async function handleCalculateSavings(payload: CalculateSavingsPayload) {
  const opportunities = await arbitrageEngine.calculateSavings(
    payload.price,
    payload.targetCurrencies
  );
  
  return {
    opportunities,
    bestOption: opportunities[0] || null,
    lastUpdated: Date.now()
  };
}

async function handleGetPreferences() {
  return getPreferences();
}

async function handleSetPreferences(preferences: any) {
  await chrome.storage.local.set({ preferences });
  return { success: true };
}

async function handleTrackEvent(event: any) {
  console.log('Event tracked:', event);
  return { success: true };
}

async function getPreferences() {
  const result = await chrome.storage.local.get('preferences');
  return result.preferences || {
    enabledSites: ['netflix', 'spotify', 'adobe'],
    preferredCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'TRY', 'ARS', 'PHP'],
    showNotifications: true,
    autoApplySavings: false,
    theme: 'auto'
  };
}

async function saveSavingsHistory(site: string, savingsData: SavingsData) {
  if (!savingsData.bestOption) return;
  
  const history = await getSavingsHistory();
  history.push({
    id: Date.now().toString(),
    site,
    originalPrice: savingsData.bestOption.originalPrice,
    savedAmount: savingsData.bestOption.netSavings,
    savedCurrency: savingsData.bestOption.targetCurrency.code,
    timestamp: Date.now()
  });
  
  if (history.length > 100) {
    history.shift();
  }
  
  await chrome.storage.local.set({ savingsHistory: history });
}

async function getSavingsHistory() {
  const result = await chrome.storage.local.get('savingsHistory');
  return result.savingsHistory || [];
}

function showNotification(savings: any) {
  const title = `Save ${savings.savingsPercentage.toFixed(0)}% on your subscription!`;
  const message = `Pay in ${savings.targetCurrency.name} and save ${savings.targetCurrency.symbol}${savings.netSavings.toFixed(2)} per month`;
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
    title,
    message,
    priority: 1
  });
}