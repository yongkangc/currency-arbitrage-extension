// Service pricing data
const servicePlans = {
  netflix: {
    name: 'Netflix',
    plans: {
      basic: { name: 'Basic', price: 6.99 },
      standard: { name: 'Standard', price: 15.49 },
      premium: { name: 'Premium', price: 22.99 }
    }
  },
  spotify: {
    name: 'Spotify',
    plans: {
      individual: { name: 'Individual', price: 10.99 },
      duo: { name: 'Duo', price: 14.99 },
      family: { name: 'Family', price: 16.99 }
    }
  },
  adobe: {
    name: 'Adobe CC',
    plans: {
      photography: { name: 'Photography', price: 9.99 },
      single: { name: 'Single App', price: 22.99 },
      all: { name: 'All Apps', price: 59.99 }
    }
  },
  disney: {
    name: 'Disney+',
    plans: {
      basic: { name: 'Basic', price: 7.99 },
      premium: { name: 'Premium', price: 13.99 }
    }
  }
};

// Regional pricing multipliers (based on real data)
const regionalMultipliers = {
  USD: 1.00,
  EUR: 0.90,
  GBP: 0.70,
  INR: 0.38,  // India typically 60% cheaper
  TRY: 0.20,  // Turkey typically 80% cheaper
  ARS: 0.07,  // Argentina typically 93% cheaper
  PHP: 0.61,  // Philippines typically 39% cheaper
  BRL: 0.50,  // Brazil typically 50% cheaper
  MXN: 0.51,  // Mexico typically 49% cheaper
  IDR: 0.45,  // Indonesia typically 55% cheaper
  THB: 0.48,  // Thailand typically 52% cheaper
  PLN: 0.65,  // Poland typically 35% cheaper
  EGP: 0.25,  // Egypt typically 75% cheaper
  VND: 0.40,  // Vietnam typically 60% cheaper
  ZAR: 0.55   // South Africa typically 45% cheaper
};

// Exchange rates (you can fetch real ones from an API)
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  INR: 83.0,
  TRY: 32.0,
  ARS: 850.0,
  PHP: 56.0,
  BRL: 5.0,
  MXN: 17.0,
  IDR: 15500,
  THB: 35.0,
  PLN: 4.0,
  EGP: 31.0,
  VND: 24000,
  ZAR: 19.0
};

const currencies = {
  USD: { name: 'US Dollar', flag: '🇺🇸', vpn: false },
  EUR: { name: 'Euro', flag: '🇪🇺', vpn: false },
  GBP: { name: 'British Pound', flag: '🇬🇧', vpn: false },
  CAD: { name: 'Canadian Dollar', flag: '🇨🇦', vpn: false },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺', vpn: false },
  INR: { name: 'Indian Rupee', flag: '🇮🇳', vpn: true },
  TRY: { name: 'Turkish Lira', flag: '🇹🇷', vpn: true },
  ARS: { name: 'Argentine Peso', flag: '🇦🇷', vpn: true },
  PHP: { name: 'Philippine Peso', flag: '🇵🇭', vpn: true },
  BRL: { name: 'Brazilian Real', flag: '🇧🇷', vpn: true },
  MXN: { name: 'Mexican Peso', flag: '🇲🇽', vpn: true },
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩', vpn: true },
  THB: { name: 'Thai Baht', flag: '🇹🇭', vpn: true },
  PLN: { name: 'Polish Zloty', flag: '🇵🇱', vpn: false },
  EGP: { name: 'Egyptian Pound', flag: '🇪🇬', vpn: true },
  VND: { name: 'Vietnamese Dong', flag: '🇻🇳', vpn: true },
  ZAR: { name: 'South African Rand', flag: '🇿🇦', vpn: true }
};

// DOM elements
const serviceSelect = document.getElementById('service');
const planSelect = document.getElementById('plan');
const customPriceGroup = document.getElementById('custom-price-group');
const customPriceInput = document.getElementById('custom-price');
const form = document.getElementById('calculator-form');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const resultsContent = document.getElementById('results-content');

// Update plans when service changes
serviceSelect.addEventListener('change', (e) => {
  const service = e.target.value;
  planSelect.innerHTML = '<option value="">Select a plan...</option>';
  planSelect.disabled = true;
  customPriceGroup.style.display = 'none';
  
  if (service && service !== 'custom') {
    const plans = servicePlans[service].plans;
    Object.keys(plans).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${plans[key].name} - $${plans[key].price}/month`;
      planSelect.appendChild(option);
    });
    planSelect.disabled = false;
  } else if (service === 'custom') {
    customPriceGroup.style.display = 'block';
    planSelect.disabled = true;
  }
});

// Calculate savings
function calculateSavings(basePrice, fromCurrency) {
  const results = [];
  
  // Convert base price to USD
  const basePriceUSD = basePrice / exchangeRates[fromCurrency];
  
  Object.keys(regionalMultipliers).forEach(currency => {
    if (currency === fromCurrency || currency === 'USD') return;
    
    // Calculate local price using regional multiplier
    const localPriceUSD = basePriceUSD * regionalMultipliers[currency];
    const localPrice = localPriceUSD * exchangeRates[currency];
    
    // Calculate savings
    const savings = basePriceUSD - localPriceUSD;
    const savingsPercentage = (savings / basePriceUSD) * 100;
    
    // Calculate fees (3% conversion + potential VPN)
    const conversionFee = localPriceUSD * 0.03;
    const vpnFee = currencies[currency] && currencies[currency].vpn ? 3.99 : 0;
    const netSavings = savings - conversionFee - vpnFee;
    
    if (netSavings > 0 && currencies[currency]) {
      results.push({
        currency,
        localPrice,
        localPriceUSD,
        savings: netSavings,
        savingsPercentage: (netSavings / basePriceUSD) * 100,
        requiresVPN: currencies[currency].vpn,
        annualSavings: netSavings * 12
      });
    }
  });
  
  return results.sort((a, b) => b.savings - a.savings);
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
  const symbol = currency === 'USD' ? '$' : '';
  return `${symbol}${amount.toFixed(2)}`;
}

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const service = serviceSelect.value;
  const plan = planSelect.value;
  const currentCurrency = document.getElementById('current-currency').value;
  let price = 0;
  
  if (service === 'custom') {
    price = parseFloat(customPriceInput.value);
    if (!price || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
  } else if (service && plan) {
    price = servicePlans[service].plans[plan].price;
  } else {
    alert('Please select a service and plan');
    return;
  }
  
  // Convert price to user's currency
  const priceInUserCurrency = price * exchangeRates[currentCurrency];
  
  // Show loading
  loading.classList.add('show');
  results.classList.remove('show');
  
  // Simulate API call delay
  setTimeout(() => {
    const savings = calculateSavings(priceInUserCurrency, currentCurrency);
    
    // Display results
    let html = '';
    
    if (savings.length === 0) {
      html = '<p style="text-align: center; color: #666;">No savings opportunities found. You might already be in the best region!</p>';
    } else {
      html = '<div class="savings-cards">';
      
      savings.slice(0, 6).forEach((item, index) => {
        const curr = currencies[item.currency];
        const isBest = index === 0;
        
        html += `
          <div class="savings-card ${isBest ? 'best' : ''}">
            ${isBest ? '<div class="best-badge">BEST DEAL</div>' : ''}
            <div class="country-flag">${curr.flag}</div>
            <div class="country-name">${curr.name}</div>
            <div class="savings-percentage">${item.savingsPercentage.toFixed(0)}%</div>
            <div class="savings-amount">Save ${formatCurrency(item.savings)}/month</div>
            <div class="savings-amount" style="font-weight: bold;">${formatCurrency(item.annualSavings)}/year</div>
            ${item.requiresVPN ? '<div class="vpn-badge">🔒 VPN Required</div>' : '<div class="no-vpn-badge">✅ No VPN</div>'}
          </div>
        `;
      });
      
      html += '</div>';
      
      // Add summary for best option
      if (savings[0]) {
        const best = savings[0];
        const curr = currencies[best.currency];
        
        html += `
          <div style="text-align: center; margin-top: 30px; padding: 25px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border-radius: 15px; border: 2px solid #10b981;">
            <h3 style="color: #10b981; margin-bottom: 15px; font-size: 1.5em;">
              🎉 Your Best Savings Option
            </h3>
            <p style="font-size: 1.3em; margin-bottom: 10px;">
              Pay in <strong>${curr.flag} ${curr.name}</strong>
            </p>
            <p style="font-size: 1.8em; color: #10b981; font-weight: bold; margin-bottom: 10px;">
              Save ${formatCurrency(best.savings)}/month
            </p>
            <p style="font-size: 1.1em; color: #666;">
              That's <strong>${formatCurrency(best.annualSavings)}</strong> saved per year!
            </p>
            ${best.requiresVPN ? 
              '<p style="margin-top: 15px; color: #ff6b6b;">⚠️ VPN required (~$4/month)</p>' : 
              '<p style="margin-top: 15px; color: #10b981;">✅ No VPN needed - Direct savings!</p>'
            }
          </div>
        `;
        
        // Add quick guide
        html += `
          <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px;">
            <h4 style="color: #667eea; margin-bottom: 15px;">💡 How to Apply These Savings:</h4>
            <ol style="line-height: 1.8; color: #555;">
              <li>Cancel your current subscription (wait for it to expire)</li>
              ${best.requiresVPN ? '<li>Get a VPN service (we recommend NordVPN or ExpressVPN)</li>' : ''}
              ${best.requiresVPN ? `<li>Connect to ${curr.name.split(' ')[0]} server</li>` : ''}
              <li>Sign up again and select ${curr.name} as your region</li>
              <li>Use an international payment method (PayPal, Revolut, or Wise)</li>
              <li>Enjoy your savings! 🎉</li>
            </ol>
          </div>
        `;
      }
    }
    
    resultsContent.innerHTML = html;
    loading.classList.remove('show');
    results.classList.add('show');
    
    // Smooth scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 1500);
});