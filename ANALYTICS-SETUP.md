# 📊 ProofPort Analytics Setup Guide

This guide covers setting up comprehensive analytics tracking for ProofPort including GA4, Google Search Console, PostHog, and Meta Conversions API.

## 🎯 Analytics Stack Overview

### 1. **Google Analytics 4 (GA4)**
- **Purpose**: Web analytics, conversion tracking, user behavior
- **Features**: Enhanced ecommerce, custom events, audience insights
- **Integration**: `@next/third-parties` for optimized loading

### 2. **Google Search Console (GSC)**
- **Purpose**: Search performance, indexing status, SEO insights
- **Features**: Search queries, click-through rates, page performance
- **Setup**: HTML meta tag verification

### 3. **PostHog**
- **Purpose**: Product analytics, feature flags, session recordings
- **Features**: Event tracking, user journeys, cohort analysis
- **Integration**: `posthog-js` for client-side, `posthog-node` for server-side

### 4. **Meta Pixel & Conversions API**
- **Purpose**: Facebook/Instagram ad optimization and tracking
- **Features**: Conversion tracking, custom audiences, attribution
- **Integration**: Client-side pixel + server-side Conversions API

### 5. **Vercel Analytics & Speed Insights**
- **Purpose**: Performance monitoring and web analytics
- **Features**: Core Web Vitals, page views, real user monitoring

## 🚀 Quick Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Meta Pixel & Conversions API
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
META_CONVERSION_TOKEN=your_conversion_api_token

# Optional: Additional Analytics
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
NEXT_PUBLIC_HOTJAR_ID=1234567
```

### 2. Google Analytics 4 Setup

1. **Create GA4 Property**
   - Visit [Google Analytics](https://analytics.google.com)
   - Create new property for ProofPort
   - Get your Measurement ID (G-XXXXXXXXXX)

2. **Enhanced Ecommerce Setup**
   - Enable Enhanced Ecommerce in GA4
   - Configure custom events for travel bookings
   - Set up conversion goals

3. **Integration Verification**
   - Check Real-time reports
   - Verify custom events are firing
   - Test enhanced ecommerce data

### 3. Google Search Console Setup

1. **Property Verification**
   - Visit [Search Console](https://search.google.com/search-console)
   - Add your domain
   - Verify via HTML meta tag (already included in layout)

2. **Sitemap Submission**
   - Submit `/sitemap.xml` to GSC
   - Monitor indexing status
   - Check for crawl errors

3. **Performance Monitoring**
   - Track search queries and rankings
   - Monitor Core Web Vitals
   - Analyze page experience signals

### 4. PostHog Setup

1. **Create PostHog Project**
   - Sign up at [PostHog](https://posthog.com)
   - Create new project
   - Get your project API key

2. **Event Configuration**
   - Define custom events for travel bookings
   - Set up user identification
   - Configure session recordings (optional)

3. **Dashboard Setup**
   - Create conversion funnels
   - Set up user cohorts
   - Configure alerts for key metrics

### 5. Meta Pixel & Conversions API Setup

1. **Meta Business Setup**
   - Create/access [Meta Business Manager](https://business.facebook.com)
   - Create new Pixel or use existing
   - Generate Conversions API access token

2. **Pixel Configuration**
   - Add Pixel ID to environment variables
   - Test pixel firing with Meta Pixel Helper
   - Verify custom events in Events Manager

3. **Conversions API Setup**
   - Configure server-side tracking
   - Test conversion events
   - Set up deduplication with pixel

## 📈 Event Tracking Implementation

### Key Events Tracked:

1. **Page Views** (Automatic)
   - All page navigation
   - UTM parameter tracking
   - Referrer information

2. **Form Submissions**
   ```javascript
   trackFormSubmission('travel_document_form', {
     origin: 'JFK',
     destination: 'CDG',
     visa_type: 'tourist',
     bundle: ['flight', 'hotel']
   })
   ```

3. **Order Generation** (Purchase)
   ```javascript
   trackOrderGeneration({
     orderId: 'order_123',
     amount: 34,
     currency: 'USD',
     services: ['flight', 'hotel'],
     ttlDays: 7
   })
   ```

4. **Payment Initiation**
   ```javascript
   trackPaymentInitiated('stripe', 34)
   ```

5. **User Signup**
   ```javascript
   trackUserSignup('magic_link')
   ```

### Custom Events:
- Document download
- Dashboard page views
- Order extensions
- Service bundle changes
- TTL slider interactions

## 🔍 Data Privacy & Compliance

### GDPR Compliance:
- Cookie consent implementation
- Data retention policies
- User data deletion requests
- Privacy policy updates

### Data Security:
- PII hashing for Meta Conversions API
- Secure token storage
- Encrypted data transmission
- Access logging

## 📊 Analytics Dashboard Setup

### 1. GA4 Custom Dashboard
- Conversion funnel visualization
- Revenue by traffic source
- User journey mapping
- Geographic performance

### 2. PostHog Insights
- Feature usage analytics
- User behavior flows
- A/B test results
- Session recordings analysis

### 3. Meta Ads Manager
- Conversion tracking
- Audience insights
- Attribution modeling
- ROI measurement

## 🚨 Monitoring & Alerts

### Set up alerts for:
- Conversion rate drops
- Traffic anomalies
- Error rate increases
- Payment failures
- API downtime

### Key Metrics to Track:
- **Business Metrics**: Conversion rate, revenue, AOV
- **Technical Metrics**: Page load time, error rates, uptime
- **User Metrics**: DAU/MAU, retention, engagement
- **Marketing Metrics**: CAC, LTV, ROAS

## 🧪 Testing & Validation

### Analytics Testing Checklist:
- [ ] GA4 events firing correctly
- [ ] PostHog events captured
- [ ] Meta Pixel events validated
- [ ] Enhanced ecommerce data accurate
- [ ] Server-side conversions working
- [ ] Cross-domain tracking (if applicable)
- [ ] Mobile analytics functional

### Debug Tools:
- **GA4**: Real-time reports, DebugView
- **PostHog**: Live events, debug mode
- **Meta**: Pixel Helper, Test Events
- **General**: Browser dev tools, Analytics Debugger

## 📝 Regular Maintenance

### Weekly:
- Review key metrics and anomalies
- Check for tracking errors
- Monitor conversion funnels

### Monthly:
- Analyze user behavior trends
- Optimize based on insights
- Update tracking implementation
- Review data quality

### Quarterly:
- Comprehensive analytics audit
- Update measurement strategy
- Benchmark against industry standards
- Plan new tracking requirements

## 📚 Additional Resources

- [GA4 Implementation Guide](https://developers.google.com/analytics/devguides/collection/ga4)
- [PostHog Documentation](https://posthog.com/docs)
- [Meta Conversions API Guide](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Next.js Analytics Best Practices](https://nextjs.org/docs/basic-features/analytics)

---

**Analytics Stack Status**: ✅ Fully Configured
**Last Updated**: September 2024
**Maintainer**: ProofPort Team