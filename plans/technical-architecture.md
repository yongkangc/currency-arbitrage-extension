# Currency Arbitrage Browser Extension - Technical Architecture

## 1. High-Level Architecture Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Extension                      │
├───────────────────────────┬───────────────────────────────────┤
│     Content Scripts       │        Background Service         │
│  ┌─────────────────┐     │    ┌──────────────────────┐      │
│  │ Price Detector  │     │    │  Arbitrage Engine    │      │
│  │                 │◄────┼────┤                      │      │
│  │ DOM Observer    │     │    │  Exchange Rate Cache │      │
│  └─────────────────┘     │    └──────────────────────┘      │
│  ┌─────────────────┐     │    ┌──────────────────────┐      │
│  │ UI Injector     │     │    │  Storage Manager     │      │
│  │                 │◄────┼────┤                      │      │
│  │ Savings Widget  │     │    │  Analytics Tracker   │      │
│  └─────────────────┘     │    └──────────────────────┘      │
└───────────────────────────┴───────────────────────────────────┘
                    │                      │
                    ▼                      ▼
        ┌─────────────────────┐  ┌──────────────────┐
        │  Exchange Rate API  │  │  Affiliate APIs  │
        └─────────────────────┘  └──────────────────┘
```

**Core Design Principles:**
- **Minimal Footprint**: Content scripts only load on supported sites
- **Performance First**: Background worker handles heavy computation
- **Privacy by Design**: No user data leaves the browser unless explicitly shared
- **Progressive Enhancement**: Core functionality works offline with cached rates

## 2. Technology Stack Recommendations

```typescript
// Core Technologies
const techStack = {
  language: "TypeScript 5.3+",
  bundler: "Vite 5.0",
  framework: "Vanilla TypeScript + Web Components",
  testing: {
    unit: "Vitest",
    e2e: "Playwright",
    coverage: "V8 Coverage"
  },
  styling: "Tailwind CSS (JIT mode)",
  storage: "Chrome Storage API + IndexedDB",
  build: {
    dev: "Vite dev server with HMR",
    prod: "Vite build with code splitting"
  }
};
```

**Rationale:**
- **TypeScript**: Type safety for complex price calculations
- **Vite**: Fast builds, excellent DX, native ESM support
- **Vanilla + Web Components**: Minimal bundle size, native browser APIs
- **Tailwind JIT**: Only includes used styles, perfect for extensions
- **IndexedDB**: Large storage for exchange rate history

## 3. Detailed Component Breakdown

### Content Script Layer

```typescript
// src/content/price-detector.ts
interface PriceDetector {
  site: SupportedSite;
  selectors: PriceSelectors;
  extractPrice(): Price | null;
  observeChanges(callback: PriceChangeCallback): void;
}

// src/content/ui-injector.ts
interface UIInjector {
  injectWidget(price: Price, savings: SavingsData): void;
  showNotification(message: string): void;
  cleanup(): void;
}
```

### Background Service Layer

```typescript
// src/background/arbitrage-engine.ts
interface ArbitrageEngine {
  calculateSavings(originalPrice: Price, targetCurrencies: Currency[]): SavingsOpportunity[];
  getRealTimeRates(base: string): Promise<ExchangeRates>;
  cacheRates(rates: ExchangeRates): void;
}

// src/background/storage-manager.ts
interface StorageManager {
  saveUserPreferences(prefs: UserPreferences): Promise<void>;
  getSavingsHistory(): Promise<SavingsRecord[]>;
  cacheExchangeRates(rates: ExchangeRates): Promise<void>;
}
```

### Site Adapters (Strategy Pattern)

```typescript
// src/adapters/base-adapter.ts
abstract class SiteAdapter {
  abstract readonly siteName: string;
  abstract readonly priceSelectors: string[];
  abstract extractPrice(element: Element): Price | null;
  abstract injectUI(container: Element, widget: HTMLElement): void;
}

// Concrete implementations for each site
class NetflixAdapter extends SiteAdapter { /* ... */ }
class SpotifyAdapter extends SiteAdapter { /* ... */ }
```

## 4. Data Flow and Storage Strategy

### Data Flow Architecture

```
User Visits Site → Content Script Activates
                          ↓
                   Price Detection
                          ↓
                Message to Background
                          ↓
              Arbitrage Calculation
                    ↓         ↓
            Cache Check   API Request
                    ↓         ↓
                 Merge Results
                          ↓
              Return to Content Script
                          ↓
                   Display Widget
```

### Storage Layers

```typescript
// Storage strategy with fallbacks
const storageStrategy = {
  volatile: {
    // Session data, current calculations
    storage: "chrome.storage.session",
    ttl: "session",
    size: "5MB"
  },
  persistent: {
    // User preferences, savings history
    storage: "chrome.storage.local",
    ttl: "permanent",
    size: "10MB"
  },
  cache: {
    // Exchange rates, price history
    storage: "IndexedDB",
    ttl: "24 hours",
    size: "50MB"
  }
};
```

## 5. Security Considerations

### Security Architecture

```typescript
// src/security/content-security.ts
const securityMeasures = {
  // Content Script Isolation
  contentScriptSandbox: {
    executeInIsolatedWorld: true,
    limitDOMAccess: ["price elements only"],
    noEval: true,
    strictCSP: true
  },
  
  // Data Protection
  dataHandling: {
    noPII: "Never collect personal information",
    encryptStorage: "AES-256 for sensitive data",
    sanitizeInputs: "DOMPurify for all user inputs",
    validateOrigins: "Whitelist supported sites only"
  },
  
  // API Security
  apiSecurity: {
    rateLimit: "100 requests/hour",
    apiKeyRotation: "Monthly",
    httpsOnly: true,
    cors: "Strict origin checking"
  }
};
```

### Permissions Model

```json
{
  "permissions": [
    "storage",
    "alarms"
  ],
  "host_permissions": [
    "https://*.netflix.com/*",
    "https://*.spotify.com/*",
    "https://*.adobe.com/*"
  ],
  "optional_permissions": [
    "notifications"
  ]
}
```

## 6. Testing Strategy

### Test Pyramid

```typescript
// test/testing-strategy.ts
const testingPyramid = {
  unit: {
    coverage: "80%+",
    focus: "Business logic, calculations, parsers",
    tool: "Vitest",
    location: "src/**/*.test.ts"
  },
  integration: {
    coverage: "60%+",
    focus: "API interactions, storage, messaging",
    tool: "Vitest + MSW",
    location: "test/integration/**"
  },
  e2e: {
    coverage: "Critical paths",
    focus: "Full user flows on real sites",
    tool: "Playwright",
    location: "test/e2e/**"
  }
};
```

### Test Scenarios

```typescript
// Key test cases
const criticalTests = [
  "Price detection on supported sites",
  "Accurate currency conversion",
  "Savings calculation with fees",
  "Widget injection without breaking sites",
  "Offline mode with cached rates",
  "Performance: <100ms price detection"
];
```

## 7. Implementation Phases

### Phase 1: MVP (Week 1-2)
```typescript
const phase1 = {
  goals: ["Basic price detection", "Currency conversion", "Simple UI"],
  sites: ["Netflix only"],
  features: [
    "Detect Netflix subscription price",
    "Convert to 5 major currencies",
    "Show savings in simple tooltip"
  ]
};
```

### Phase 2: Core Features (Week 3-4)
```typescript
const phase2 = {
  goals: ["Multi-site support", "Persistent storage", "Better UI"],
  sites: ["Netflix", "Spotify", "Adobe CC"],
  features: [
    "Site adapter system",
    "Savings history tracking",
    "Customizable widget UI",
    "Offline support"
  ]
};
```

### Phase 3: Monetization (Week 5-6)
```typescript
const phase3 = {
  goals: ["Affiliate integration", "Analytics", "Polish"],
  features: [
    "VPN affiliate links",
    "Payment method recommendations",
    "Anonymous analytics",
    "Settings page",
    "Onboarding flow"
  ]
};
```

### Phase 4: Scale (Week 7+)
```typescript
const phase4 = {
  goals: ["Firefox support", "More sites", "Advanced features"],
  features: [
    "Cross-browser compatibility",
    "20+ supported sites",
    "Price alerts",
    "Bulk subscription analysis",
    "Browser sync"
  ]
};
```

## 8. File Structure

```
currency-arbitrage-extension/
├── src/
│   ├── background/
│   │   ├── service-worker.ts       # Main background script
│   │   ├── arbitrage-engine.ts     # Core calculation logic
│   │   ├── exchange-service.ts     # API interactions
│   │   └── storage-manager.ts      # Data persistence
│   ├── content/
│   │   ├── content-script.ts       # Entry point
│   │   ├── price-detector.ts       # Price extraction
│   │   ├── ui-injector.ts          # Widget injection
│   │   └── message-handler.ts      # Chrome messaging
│   ├── adapters/
│   │   ├── base-adapter.ts         # Abstract adapter
│   │   ├── netflix-adapter.ts      # Netflix-specific
│   │   ├── spotify-adapter.ts      # Spotify-specific
│   │   └── index.ts                # Adapter factory
│   ├── components/
│   │   ├── savings-widget.ts       # Web Component
│   │   ├── settings-panel.ts       # Settings UI
│   │   └── notification-toast.ts   # Notifications
│   ├── popup/
│   │   ├── popup.html              # Extension popup
│   │   ├── popup.ts                # Popup logic
│   │   └── popup.css               # Popup styles
│   ├── shared/
│   │   ├── types.ts                # TypeScript types
│   │   ├── constants.ts            # App constants
│   │   ├── utils.ts                # Shared utilities
│   │   └── currency-data.ts        # Currency metadata
│   └── styles/
│       ├── tailwind.css            # Tailwind base
│       └── widget.css              # Widget-specific
├── public/
│   ├── manifest.json               # Extension manifest
│   ├── icons/                      # Extension icons
│   └── assets/                     # Static assets
├── test/
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # Playwright tests
├── scripts/
│   ├── build.ts                    # Build script
│   ├── package.ts                  # Package for store
│   └── test-sites.ts               # Test helper
├── .env.example                    # Environment template
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── tailwind.config.js              # Tailwind config
└── package.json                    # Dependencies
```

## 9. API Design

### Internal Message API

```typescript
// src/shared/messages.ts
type MessageType = 
  | "PRICE_DETECTED"
  | "CALCULATE_SAVINGS"
  | "UPDATE_WIDGET"
  | "TRACK_EVENT";

interface Message<T = any> {
  type: MessageType;
  payload: T;
  timestamp: number;
  tabId?: number;
}

// Type-safe message handlers
const messageHandlers: Record<MessageType, MessageHandler> = {
  PRICE_DETECTED: handlePriceDetection,
  CALCULATE_SAVINGS: handleSavingsCalculation,
  // ...
};
```

### External API Integration

```typescript
// src/services/exchange-rate-service.ts
interface ExchangeRateService {
  provider: "exchangerate-api" | "fixer" | "currencyapi";
  
  async getRates(base: string): Promise<ExchangeRates> {
    // Implement caching strategy
    const cached = await this.checkCache(base);
    if (cached && !this.isStale(cached)) {
      return cached;
    }
    
    // Fallback chain for reliability
    try {
      return await this.primaryProvider.getRates(base);
    } catch {
      return await this.fallbackProvider.getRates(base);
    }
  }
}
```

## 10. Performance Optimization Strategies

### Critical Performance Metrics

```typescript
const performanceTargets = {
  // Page Load Impact
  contentScriptLoad: "<50ms",
  initialDetection: "<100ms",
  widgetRender: "<150ms",
  
  // Runtime Performance
  priceUpdate: "<50ms",
  apiResponse: "<500ms (cached: <10ms)",
  
  // Resource Usage
  memoryFootprint: "<10MB active",
  cpuUsage: "<1% idle, <5% active"
};
```

### Optimization Techniques

```typescript
// 1. Lazy Loading
const lazyLoadAdapters = async (site: string) => {
  const adapter = await import(`./adapters/${site}-adapter.ts`);
  return new adapter.default();
};

// 2. Debounced Operations
const debouncedPriceCheck = debounce(checkPrice, 500);

// 3. Virtual Scrolling for History
const virtualList = new VirtualList({
  itemHeight: 60,
  buffer: 5
});

// 4. Service Worker Caching
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('exchange-rates')) {
    event.respondWith(cacheFirst(event.request));
  }
});

// 5. Code Splitting
const routes = {
  '/settings': () => import('./pages/settings'),
  '/history': () => import('./pages/history')
};
```

### Bundle Size Strategy

```typescript
const bundleStrategy = {
  contentScript: "< 50KB gzipped",
  background: "< 100KB gzipped",
  popup: "< 30KB gzipped",
  
  techniques: [
    "Tree shaking with Vite",
    "Dynamic imports for site adapters",
    "Tailwind JIT for minimal CSS",
    "Compress with Brotli",
    "Exclude source maps in production"
  ]
};
```

## Implementation Checklist

### Week 1 Sprint
- [ ] Initialize project with Vite + TypeScript
- [ ] Set up manifest.json for Chrome
- [ ] Implement Netflix adapter
- [ ] Create basic price detection
- [ ] Build simple savings calculation
- [ ] Design minimal widget UI

### Week 2 Sprint  
- [ ] Add exchange rate API integration
- [ ] Implement caching with IndexedDB
- [ ] Create settings storage
- [ ] Add Spotify adapter
- [ ] Write unit tests for core logic
- [ ] Set up Playwright for e2e tests

### Week 3 Sprint
- [ ] Build settings page
- [ ] Add savings history tracking
- [ ] Implement offline mode
- [ ] Create onboarding flow
- [ ] Add Adobe adapter
- [ ] Performance optimization pass

### Week 4 Sprint
- [ ] Integrate affiliate APIs
- [ ] Add analytics tracking
- [ ] Polish UI/UX
- [ ] Write documentation
- [ ] Prepare for Chrome Web Store
- [ ] Security audit

## Key Success Metrics

```typescript
const successMetrics = {
  technical: {
    pageLoadImpact: "< 100ms",
    accuracyRate: "> 99%",
    crashRate: "< 0.1%",
    testCoverage: "> 80%"
  },
  user: {
    installToActiveRate: "> 60%",
    weeklyActiveUsers: "> 40%",
    savingsIdentified: "> $10/user/month",
    affiliateClickRate: "> 15%"
  }
};
```

## Trade-offs and Decisions

**What we're optimizing for:**
- Fast, non-intrusive user experience
- High accuracy in savings calculations
- Privacy-first approach
- Quick time to market

**What we're accepting:**
- Limited to manual site adapter creation initially
- No server-side component (all client-side)
- Depends on third-party exchange rate APIs
- Chrome-first approach (Firefox later)

**Why these choices:**
- Single developer can implement and maintain
- No infrastructure costs initially
- Can validate product-market fit quickly
- Natural upgrade path as product grows

---

This architecture provides a solid foundation that can be built by a single developer in 4-6 weeks while maintaining high quality and performance standards. The modular design allows for easy extension as you add more sites and features.