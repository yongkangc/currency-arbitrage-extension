document.getElementById('save-settings')?.addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const preferredCurrencies: string[] = [];
  
  checkboxes.forEach((checkbox) => {
    const value = (checkbox as HTMLInputElement).value;
    if (value && value !== 'on') {
      preferredCurrencies.push(value);
    }
  });
  
  const showNotifications = (document.getElementById('show-notifications') as HTMLInputElement)?.checked;
  
  chrome.storage.local.set({
    preferences: {
      preferredCurrencies,
      showNotifications,
      enabledSites: ['netflix', 'spotify', 'adobe'],
      autoApplySavings: false,
      theme: 'auto'
    }
  }, () => {
    alert('Settings saved successfully!');
  });
});