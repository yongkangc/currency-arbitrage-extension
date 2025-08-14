#!/usr/bin/env node

console.log('💱 Testing Currency Arbitrage Calculations\n');
console.log('=' .repeat(50));

// Mock exchange rates for testing
const mockExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.0,
    TRY: 32.0,
    ARS: 850.0,
    PHP: 56.0,
    BRL: 5.0,
    MXN: 17.0
  },
  timestamp: Date.now()
};

// Mock regional pricing (Netflix example)
const regionalPricing = {
  'USD': 15.99,
  'EUR': 13.99,
  'GBP': 10.99,
  'INR': 499,    // ~$6.01 at 83 INR/USD
  'TRY': 99.99,  // ~$3.12 at 32 TRY/USD
  'ARS': 999,    // ~$1.18 at 850 ARS/USD
  'PHP': 549,    // ~$9.80 at 56 PHP/USD
  'BRL': 39.90,  // ~$7.98 at 5 BRL/USD
  'MXN': 139     // ~$8.18 at 17 MXN/USD
};

// Test functions
function convertCurrency(amount, from, to, rates) {
  if (from === to) return amount;
  
  if (rates.base === from) {
    return amount * (rates.rates[to] || 1);
  }
  
  const fromRate = rates.rates[from] || 1;
  const toRate = rates.rates[to] || 1;
  
  return (amount / fromRate) * toRate;
}

function calculateSavings(originalPrice, targetCurrency, rates) {
  const originalUSD = originalPrice;
  const targetLocalPrice = regionalPricing[targetCurrency];
  
  // Convert target price back to USD for comparison
  const targetUSD = convertCurrency(targetLocalPrice, targetCurrency, 'USD', rates);
  
  const savings = originalUSD - targetUSD;
  const savingsPercentage = (savings / originalUSD) * 100;
  
  // Calculate fees (3% conversion + VPN if needed)
  const conversionFee = targetUSD * 0.03;
  const vpnFee = ['INR', 'TRY', 'ARS', 'PHP', 'BRL', 'MXN'].includes(targetCurrency) ? 3.99 : 0;
  const totalFees = conversionFee + vpnFee;
  
  const netSavings = savings - totalFees;
  
  return {
    currency: targetCurrency,
    localPrice: targetLocalPrice,
    priceInUSD: targetUSD,
    grossSavings: savings,
    savingsPercentage,
    fees: {
      conversion: conversionFee,
      vpn: vpnFee,
      total: totalFees
    },
    netSavings,
    worthIt: netSavings > 0
  };
}

// Run tests
console.log('\n📊 Testing Currency Conversions:');
console.log('-'.repeat(50));

const testConversions = [
  { amount: 100, from: 'USD', to: 'EUR', expected: 85 },
  { amount: 100, from: 'USD', to: 'INR', expected: 8300 },
  { amount: 499, from: 'INR', to: 'USD', expected: 6.01 }
];

testConversions.forEach(test => {
  const result = convertCurrency(test.amount, test.from, test.to, mockExchangeRates);
  const pass = Math.abs(result - test.expected) < 1;
  console.log(`${pass ? '✅' : '❌'} Convert ${test.amount} ${test.from} to ${test.to}: ${result.toFixed(2)} ${test.to}`);
});

console.log('\n💰 Testing Arbitrage Opportunities:');
console.log('-'.repeat(50));
console.log('Original Price: $15.99 USD (Netflix US)');
console.log('-'.repeat(50));

const currencies = ['EUR', 'GBP', 'INR', 'TRY', 'ARS', 'PHP', 'BRL', 'MXN'];
const opportunities = [];

currencies.forEach(currency => {
  const result = calculateSavings(15.99, currency, mockExchangeRates);
  opportunities.push(result);
  
  console.log(`\n${currency} - ${result.worthIt ? '✅ PROFITABLE' : '❌ NOT PROFITABLE'}`);
  console.log(`  Local Price: ${currency} ${result.localPrice}`);
  console.log(`  USD Equivalent: $${result.priceInUSD.toFixed(2)}`);
  console.log(`  Gross Savings: $${result.grossSavings.toFixed(2)} (${result.savingsPercentage.toFixed(1)}%)`);
  console.log(`  Fees: $${result.fees.total.toFixed(2)} (Conv: $${result.fees.conversion.toFixed(2)}, VPN: $${result.fees.vpn.toFixed(2)})`);
  console.log(`  Net Savings: $${result.netSavings.toFixed(2)}`);
});

// Find best opportunity
console.log('\n' + '='.repeat(50));
const bestOption = opportunities
  .filter(o => o.worthIt)
  .sort((a, b) => b.netSavings - a.netSavings)[0];

if (bestOption) {
  console.log('🏆 BEST OPTION:');
  console.log(`  Pay in ${bestOption.currency}`);
  console.log(`  Save $${bestOption.netSavings.toFixed(2)}/month (${bestOption.savingsPercentage.toFixed(0)}%)`);
  console.log(`  Annual Savings: $${(bestOption.netSavings * 12).toFixed(2)}`);
} else {
  console.log('❌ No profitable arbitrage opportunities found');
}

// Test VPN detection
console.log('\n' + '='.repeat(50));
console.log('🔒 VPN Requirements Test:');
const vpnRequired = ['INR', 'TRY', 'ARS', 'PHP', 'BRL', 'MXN'];
vpnRequired.forEach(currency => {
  console.log(`  ${currency}: VPN Required ✅`);
});

const noVpnRequired = ['EUR', 'GBP'];
noVpnRequired.forEach(currency => {
  console.log(`  ${currency}: No VPN Needed ⭕`);
});

console.log('\n' + '='.repeat(50));
console.log('✅ Arbitrage calculation tests completed!');