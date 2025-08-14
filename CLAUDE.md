# Currency Arbitrage Browser Extension

## Project Overview
A Chrome browser extension that automatically detects and exploits currency arbitrage opportunities for online subscriptions and services. Similar to Honey but focused on currency optimization to save users money.

## Core Value Proposition
Save 20-70% on digital subscriptions by intelligently routing payments through optimal currencies - automatically.

## Technical Stack
- **Language**: TypeScript 5.3+
- **Bundler**: Vite 5.0
- **Framework**: Vanilla TypeScript + Web Components
- **Testing**: Vitest (unit), Playwright (e2e)
- **Styling**: Tailwind CSS (JIT mode)
- **Storage**: Chrome Storage API + IndexedDB

## Project Structure
```
src/
├── background/       # Background service worker and core logic
├── content/         # Content scripts for price detection
├── adapters/        # Site-specific adapters (Netflix, Spotify, etc.)
├── components/      # Web Components for UI
├── popup/          # Extension popup interface
├── shared/         # Shared types and utilities
└── styles/         # CSS and Tailwind configuration
```

## Key Features
1. **Price Detection**: Automatically detects subscription prices on supported sites
2. **Currency Arbitrage**: Calculates potential savings using different currencies
3. **Savings Widget**: Non-intrusive UI showing savings opportunities
4. **Exchange Rate Caching**: Offline support with cached rates
5. **Affiliate Integration**: Monetization through VPN and payment service referrals

## Development Commands

### Setup and Installation
```bash
npm install              # Install dependencies
npm run dev             # Start development server with HMR
```

### Building
```bash
npm run build           # Build for production
npm run preview         # Preview production build
```

### Testing
```bash
npm run test           # Run unit tests with Vitest
npm run test:e2e       # Run end-to-end tests with Playwright
npm run test:coverage  # Generate test coverage report
```

### Linting and Type Checking
```bash
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript type checking
npm run format         # Format code with Prettier
```

### Extension Management
```bash
npm run package        # Package extension for Chrome Web Store
npm run load-ext       # Instructions to load unpacked extension
```

## Architecture Principles

### Performance Targets
- Content script load: <50ms
- Initial price detection: <100ms
- Widget render: <150ms
- Memory footprint: <10MB active

### Security Guidelines
- No PII collection
- Sanitize all user inputs with DOMPurify
- Whitelist supported sites only
- Use HTTPS for all API calls
- Implement rate limiting (100 req/hour)

### Site Adapters
Each supported site has its own adapter implementing:
```typescript
abstract class SiteAdapter {
  abstract readonly siteName: string;
  abstract readonly priceSelectors: string[];
  abstract extractPrice(element: Element): Price | null;
  abstract injectUI(container: Element, widget: HTMLElement): void;
}
```

## Currently Supported Sites
1. Netflix
2. Spotify
3. Adobe Creative Cloud
(More to be added)

## API Integrations

### Exchange Rate APIs
- Primary: exchangerate-api.com
- Fallback: fixer.io
- Cache duration: 24 hours

### Affiliate Partners
- VPN services: NordVPN, ExpressVPN
- Payment services: Wise (TransferWise), Revolut

## Testing Strategy

### Unit Tests
- Focus: Business logic, calculations, parsers
- Coverage target: 80%+
- Location: `src/**/*.test.ts`

### E2E Tests
- Focus: Full user flows on real sites
- Tool: Playwright
- Location: `test/e2e/**`

### Critical Test Scenarios
1. Price detection accuracy on supported sites
2. Currency conversion calculations
3. Savings calculation with fees
4. Widget injection without breaking sites
5. Offline mode with cached rates
6. Performance benchmarks

## Common Development Tasks

### Adding a New Site Adapter
1. Create new adapter in `src/adapters/[site]-adapter.ts`
2. Extend `SiteAdapter` base class
3. Implement price detection logic
4. Add to adapter factory in `src/adapters/index.ts`
5. Add host permissions to `manifest.json`
6. Write tests in `src/adapters/[site]-adapter.test.ts`

### Updating Exchange Rate Provider
1. Modify `src/services/exchange-rate-service.ts`
2. Update API credentials in `.env`
3. Test fallback chain
4. Verify caching logic

### Modifying the Savings Widget
1. Edit `src/components/savings-widget.ts`
2. Update styles in `src/styles/widget.css`
3. Test on all supported sites
4. Verify performance impact

## Debugging Tips

### Chrome Extension Debugging
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select `dist/` folder
4. Right-click extension icon → "Inspect popup"
5. Use Chrome DevTools for debugging

### Content Script Debugging
1. Open target website (e.g., netflix.com)
2. Open Chrome DevTools
3. Check Console for content script logs
4. Use Sources tab to set breakpoints

### Background Service Worker
1. Go to `chrome://extensions/`
2. Find extension and click "service worker"
3. Opens dedicated DevTools for background script

## Performance Monitoring

### Key Metrics to Track
- Page load impact: Should be <100ms
- Accuracy rate: Should be >99%
- Crash rate: Should be <0.1%
- Test coverage: Should be >80%

### Memory Profiling
```javascript
// Use Chrome DevTools Memory Profiler
// Monitor for memory leaks in:
// - Content scripts on long-running pages
// - Background worker after multiple API calls
// - IndexedDB cache growth
```

## Deployment Checklist

### Before Chrome Web Store Submission
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Privacy policy updated
- [ ] Screenshots prepared
- [ ] Description and promotional text ready
- [ ] Icons in all required sizes
- [ ] Version number updated
- [ ] Build optimized for production
- [ ] Source maps excluded from package

## Environment Variables

Create `.env` file with:
```env
VITE_EXCHANGE_API_KEY=your_api_key_here
VITE_AFFILIATE_ID=your_affiliate_id
VITE_ANALYTICS_ID=your_analytics_id
```

## Troubleshooting

### Extension Not Loading
- Check manifest.json syntax
- Verify all file paths are correct
- Check Chrome version compatibility

### Price Detection Failing
- Verify selectors in site adapter
- Check for site HTML changes
- Test in incognito mode

### API Rate Limiting
- Check cache implementation
- Verify rate limiting logic
- Consider upgrading API plan

## Contact for Questions
When working on this project, refer to the technical architecture document in `plans/technical-architecture.md` for detailed implementation guidance.