# Quote Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a service to fetch a daily quote from ZenQuotes and cache it locally for 24 hours.

**Architecture:** A standalone service module `quoteService.ts` that provides a `getDailyQuote` function. It handles fetching, caching in `localStorage`, and graceful error handling with a default fallback.

**Tech Stack:** TypeScript, Fetch API, LocalStorage.

---

### Task 1: Define Types

**Files:**
- Modify: `types.ts`

- [ ] **Step 1: Add Quote and QuoteCache interfaces to types.ts**

```typescript
export interface Quote {
  q: string; // The quote text
  a: string; // The author
  h: string; // HTML representation (optional, but provided by ZenQuotes)
}

export interface QuoteCache {
  quote: Quote;
  lastFetched: string; // ISO date string
}
```

- [ ] **Step 2: Commit**

```bash
git add types.ts
git commit -m "chore: add Quote and QuoteCache types"
```

### Task 2: Create Quote Service

**Files:**
- Create: `services/quoteService.ts`

- [ ] **Step 1: Implement the minimal quote service with fallback**

```typescript
import { Quote, QuoteCache } from '../types';

const QUOTE_CACHE_KEY = 'gtab_daily_quote';
const FALLBACK_QUOTE: Quote = {
  q: "The only way to do great work is to love what you do.",
  a: "Steve Jobs",
  h: "<blockquote>&ldquo;The only way to do great work is to love what you do.&rdquo; &mdash; <cite>Steve Jobs</cite></blockquote>"
};

const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  const cachedDate = dateString.split('T')[0];
  return today === cachedDate;
};

export const getDailyQuote = async (): Promise<Quote> => {
  try {
    // 1. Check Cache
    const cached = localStorage.getItem(QUOTE_CACHE_KEY);
    if (cached) {
      const parsed: QuoteCache = JSON.parse(cached);
      if (isToday(parsed.lastFetched)) {
        return parsed.quote;
      }
    }

    // 2. Fetch New
    // Using a proxy or direct fetch depending on CORS. ZenQuotes usually allows direct fetch for browser extensions or has permissive CORS.
    const response = await fetch('https://zenquotes.io/api/today');
    
    if (!response.ok) {
      throw new Error(`ZenQuotes API error: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const quote = data[0] as Quote;
      
      // 3. Update Cache
      const newCache: QuoteCache = {
        quote,
        lastFetched: new Date().toISOString()
      };
      localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(newCache));
      
      return quote;
    }

    throw new Error('Invalid response format from ZenQuotes');
  } catch (error) {
    console.error('Failed to fetch daily quote:', error);
    
    // Return cached quote even if expired if we can't fetch new
    const cached = localStorage.getItem(QUOTE_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached).quote;
      } catch (e) {
        // Ignore parse error
      }
    }
    
    return FALLBACK_QUOTE;
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add services/quoteService.ts
git commit -m "feat: add daily quote service with caching"
```

### Task 3: Verification (Manual since no test runner)

- [ ] **Step 1: Verify the service implementation logic via inspection**
Ensure:
- Cache key is unique and consistent.
- `isToday` correctly compares only the date part of ISO strings.
- Fallback quote is used when fetch fails and no cache exists.
- `localStorage` is used as requested.
- Error handling catches both fetch failures and parsing errors.

- [ ] **Step 2: Mark as DONE**
