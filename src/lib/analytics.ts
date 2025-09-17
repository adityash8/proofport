'use client'

import React from 'react'
import posthog from 'posthog-js'

// PostHog Configuration
export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll capture pageviews manually
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      }
    })
  }
}

// Google Analytics 4 helpers
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag(...args)
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  // Google Analytics 4
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })

  // PostHog
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(action, {
      category,
      label,
      value,
      timestamp: new Date().toISOString(),
    })
  }
}

export const trackPageView = (url: string, title?: string) => {
  // Google Analytics 4
  gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
    page_location: url,
    page_title: title,
  })

  // PostHog
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview', {
      $current_url: url,
      title,
    })
  }
}

// Meta Pixel helpers
export const initMetaPixel = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
    ;(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

    ;(window as any).fbq('init', process.env.NEXT_PUBLIC_META_PIXEL_ID)
    ;(window as any).fbq('track', 'PageView')
  }
}

export const trackMetaEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', eventName, parameters)
  }
}

// ProofPort specific tracking events
export const trackOrderGeneration = (orderData: {
  orderId: string
  amount: number
  currency: string
  services: string[]
  ttlDays: number
}) => {
  // GA4 Enhanced Ecommerce
  gtag('event', 'purchase', {
    transaction_id: orderData.orderId,
    value: orderData.amount,
    currency: orderData.currency,
    items: orderData.services.map(service => ({
      item_id: service,
      item_name: `ProofPort ${service}`,
      category: 'Travel Documents',
      quantity: 1,
      price: orderData.amount / orderData.services.length,
    })),
  })

  // PostHog
  trackEvent('order_generated', 'conversion', `${orderData.services.join(',')}`, orderData.amount)

  // Meta Pixel
  trackMetaEvent('Purchase', {
    value: orderData.amount,
    currency: orderData.currency,
    content_ids: orderData.services,
    content_type: 'product',
    num_items: orderData.services.length,
  })
}

export const trackFormSubmission = (formType: string, formData: any) => {
  trackEvent('form_submit', 'engagement', formType)

  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('form_submitted', {
      form_type: formType,
      form_data: formData,
    })
  }

  // Meta Pixel
  trackMetaEvent('Lead', {
    content_category: formType,
  })
}

export const trackPaymentInitiated = (paymentMethod: string, amount: number) => {
  // GA4
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: amount,
    payment_method: paymentMethod,
  })

  // PostHog
  trackEvent('payment_initiated', 'conversion', paymentMethod, amount)

  // Meta Pixel
  trackMetaEvent('InitiateCheckout', {
    value: amount,
    currency: 'USD',
    payment_method: paymentMethod,
  })
}

export const trackUserSignup = (method: string) => {
  // GA4
  gtag('event', 'sign_up', {
    method: method,
  })

  // PostHog
  trackEvent('user_signup', 'authentication', method)

  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('user_signed_up', {
      signup_method: method,
      timestamp: new Date().toISOString(),
    })
  }

  // Meta Pixel
  trackMetaEvent('CompleteRegistration', {
    method: method,
  })
}

// Meta Conversions API (Server-side)
export const sendServerSideEvent = async (eventData: {
  eventName: string
  eventTime: number
  userData: {
    email?: string
    phone?: string
    clientIpAddress?: string
    clientUserAgent?: string
    fbp?: string // Facebook browser ID
    fbc?: string // Facebook click ID
  }
  customData?: any
}) => {
  try {
    const response = await fetch('/api/meta/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      console.error('Failed to send server-side event')
    }
  } catch (error) {
    console.error('Error sending server-side event:', error)
  }
}

// PostHog Provider Component - Simplified for prototype
export function PHProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return React.createElement(React.Fragment, null, children)
}