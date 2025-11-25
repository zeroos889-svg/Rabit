# Analytics Setup Guide

## Google Analytics 4 Integration

### Setup Instructions

1. **Get GA4 Measurement ID:**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add to Environment Variables:**
   ```bash
   # .env.development
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # .env.production
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Analytics is automatically initialized in App.tsx**

### Available Analytics Hooks

#### Page Tracking
```typescript
// Automatically tracks page views on route changes
usePageTracking();
```

#### Consultation Tracking
```typescript
const { trackStart, trackComplete, trackBooking, trackCancel } = useConsultationTracking();

// Track consultation start
trackStart("employment-law", "consultant-123");

// Track consultation completion
trackComplete("consultation-456", 30, 5); // 30 minutes, 5-star rating

// Track booking
trackBooking("employment-law", 500); // 500 SAR

// Track cancellation
trackCancel("consultation-456", "schedule-conflict");
```

#### Calculator Tracking
```typescript
const { trackUsage, trackResult } = useCalculatorTracking();

// Track calculator usage
trackUsage("end-of-service");

// Track result view
trackResult("end-of-service", {
  years_of_service: 5,
  salary: 10000,
  calculated_amount: 50000,
});
```

#### Authentication Tracking
```typescript
const { trackSignup, trackLogin, trackLogout } = useAuthTracking();

// Track signup
trackSignup("email", "employee");

// Track login
trackLogin("google");

// Track logout
trackLogout();
```

#### Search Tracking
```typescript
const trackSearch = useSearchTracking();

// Track search
trackSearch("employment contracts", 15); // 15 results
```

#### Error Tracking
```typescript
const trackError = useErrorTracking();

// Track error
trackError("API request failed", "NetworkError", false);
```

#### Custom Event Tracking
```typescript
const trackEvent = useEventTracking();

// Track custom event
trackEvent("feature_used", {
  category: "Features",
  feature_name: "dark-mode",
});
```

#### Click Tracking
```typescript
const trackClick = useClickTracking("download-button", "Downloads");

<button onClick={trackClick}>
  Download
</button>
```

#### Form Tracking
```typescript
const { trackStart, trackComplete, trackError, trackAbandon } = useFormTracking("contact-form");

// Track form start
trackStart();

// Track form completion
trackComplete(45); // 45 seconds

// Track form error
trackError("email", "Invalid email format");

// Track form abandonment
trackAbandon("phone");
```

#### Video Tracking
```typescript
const { trackPlay, trackPause, trackComplete, trackProgress } = useVideoTracking("intro-video");

// Track video play
trackPlay();

// Track video pause
trackPause(30); // paused at 30 seconds

// Track video completion
trackComplete(120); // 120 seconds total

// Track video progress
trackProgress(50); // 50% watched
```

#### Download Tracking
```typescript
const trackDownload = useDownloadTracking();

// Track file download
trackDownload("employment-contract.pdf", "pdf", 245000);
```

#### Social Sharing Tracking
```typescript
const trackSocial = useSocialTracking();

// Track social share
trackSocial("twitter", "blog-post", "post-123");
```

### Direct Analytics Usage

```typescript
import analytics from "@/lib/analytics";

// Track custom event
analytics.trackEvent("custom_event", {
  category: "Custom",
  label: "Label",
  value: 100,
});

// Track page view
analytics.trackPageView({
  page_title: "Custom Title",
  page_path: "/custom-path",
});

// Set user properties
analytics.setUserProperties({
  user_type: "employee",
  subscription_plan: "premium",
});

// Set user ID
analytics.setUserId("user-123");

// Track conversion
analytics.trackConversion("subscription", 299);
```

### Events Being Tracked

#### Automatic Events
- ✅ Page views on every route change
- ✅ Core Web Vitals (CLS, FCP, LCP, TTFB, INP)
- ✅ User properties (type, subscription)

#### Available Custom Events
- **Consultations:**
  - `consultation_started`
  - `consultation_completed`
  - `consultation_booked`
  - `consultation_cancelled`

- **Calculators:**
  - `calculator_used`
  - `calculator_result_viewed`

- **Authentication:**
  - `sign_up`
  - `login`
  - `logout`

- **Search:**
  - `search`

- **Forms:**
  - `form_start`
  - `form_complete`
  - `form_error`
  - `form_abandon`

- **Videos:**
  - `video_play`
  - `video_pause`
  - `video_complete`
  - `video_progress`

- **Downloads:**
  - `file_download`

- **Social:**
  - `share`

- **General:**
  - `click`
  - `conversion`
  - `exception`
  - `performance_metric`

### Debug Mode

Analytics runs in debug mode during development:
```typescript
// Logs all events to console in development
console.log("[Analytics] Event tracked:", eventName, params);
```

### Privacy Considerations

- ✅ IP anonymization enabled by default
- ✅ User tracking can be disabled via config
- ✅ GDPR-compliant (requires user consent)
- ✅ No tracking until consent is given

### Best Practices

1. **Always use hooks** instead of direct analytics calls when possible
2. **Track meaningful events** that help understand user behavior
3. **Add context** to events (user type, subscription plan, etc.)
4. **Monitor conversion funnels** (sign up → consultation → booking)
5. **Track errors** to identify and fix issues quickly
6. **Use descriptive event names** and consistent categories

### Example Integration

```typescript
// In a consultation component
import { useConsultationTracking } from "@/hooks/useAnalytics";

function ConsultationPage() {
  const { trackStart, trackComplete } = useConsultationTracking();

  const handleStartConsultation = () => {
    trackStart("employment-law", consultantId);
    // ... start consultation logic
  };

  const handleCompleteConsultation = () => {
    const duration = calculateDuration();
    const rating = getUserRating();
    trackComplete(consultationId, duration, rating);
    // ... complete consultation logic
  };

  return (
    <div>
      <button onClick={handleStartConsultation}>Start</button>
      <button onClick={handleCompleteConsultation}>Complete</button>
    </div>
  );
}
```

### Testing Analytics

1. **Development Mode:**
   - Check browser console for analytics events
   - Use Google Analytics Debug View

2. **Production Mode:**
   - Use Google Analytics Real-Time view
   - Check events in Analytics dashboard

### Troubleshooting

**Analytics not tracking:**
1. Check if `VITE_GA_MEASUREMENT_ID` is set
2. Check browser console for errors
3. Verify script is loaded (check Network tab)
4. Check cookie consent status

**Events not showing:**
1. Wait 24-48 hours for historical data
2. Use Real-Time view for immediate feedback
3. Check event parameters match GA4 schema

### Performance Impact

- ✅ Analytics script loads asynchronously
- ✅ Events are queued until script loads
- ✅ Minimal impact on page performance
- ✅ Events use `requestIdleCallback` when available
