import { PostHog } from 'posthog-node'

class PostHogClient {
  private client: PostHog | null = null
  private isEnabled: boolean

  constructor(apiKey?: string, host?: string) {
    this.isEnabled = !!apiKey

    if (this.isEnabled && apiKey) {
      this.client = new PostHog(apiKey, {
        host: host || 'https://app.posthog.com'
      })
    }
  }

  async track(event: string, properties: Record<string, any>, distinctId?: string) {
    if (!this.client || !this.isEnabled) {
      console.log(`[ANALYTICS] ${event}:`, properties)
      return
    }

    try {
      this.client.capture({
        distinctId: distinctId || 'anonymous',
        event,
        properties
      })
    } catch (error) {
      console.error('PostHog tracking error:', error)
    }
  }

  async identify(distinctId: string, properties: Record<string, any>) {
    if (!this.client || !this.isEnabled) {
      console.log(`[ANALYTICS] Identify ${distinctId}:`, properties)
      return
    }

    try {
      this.client.identify({
        distinctId,
        properties
      })
    } catch (error) {
      console.error('PostHog identify error:', error)
    }
  }

  async shutdown() {
    if (this.client) {
      await this.client.shutdown()
    }
  }

  // Specific tracking methods for ProofPort events
  async trackOrderGenerated(orderId: string, userId?: string, properties?: Record<string, any>) {
    await this.track('order_generated', {
      order_id: orderId,
      timestamp: new Date().toISOString(),
      ...properties
    }, userId)
  }

  async trackPaymentCompleted(orderId: string, amount: number, currency: string, userId?: string) {
    await this.track('payment_completed', {
      order_id: orderId,
      amount,
      currency,
      timestamp: new Date().toISOString()
    }, userId)
  }

  async trackOrderExtended(orderId: string, oldExpiry: string, newExpiry: string, userId?: string) {
    await this.track('order_extended', {
      order_id: orderId,
      old_expiry: oldExpiry,
      new_expiry: newExpiry,
      timestamp: new Date().toISOString()
    }, userId)
  }

  async trackOrderCancelled(orderId: string, reason: string, userId?: string) {
    await this.track('order_cancelled', {
      order_id: orderId,
      reason,
      timestamp: new Date().toISOString()
    }, userId)
  }

  async trackVerificationAttempt(orderId: string, type: 'flight' | 'hotel', success: boolean, userId?: string) {
    await this.track('verification_attempt', {
      order_id: orderId,
      verification_type: type,
      success,
      timestamp: new Date().toISOString()
    }, userId)
  }

  async trackAPICall(endpoint: string, method: string, statusCode: number, responseTime: number) {
    await this.track('api_call', {
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTime,
      timestamp: new Date().toISOString()
    })
  }

  async trackUserSignup(userId: string, source: string) {
    await this.track('user_signup', {
      source,
      timestamp: new Date().toISOString()
    }, userId)

    await this.identify(userId, {
      signup_date: new Date().toISOString(),
      source
    })
  }

  async trackFormSubmission(formType: string, data: Record<string, any>, userId?: string) {
    await this.track('form_submission', {
      form_type: formType,
      form_data: data,
      timestamp: new Date().toISOString()
    }, userId)
  }

  async trackPDFDownload(orderId: string, userId?: string) {
    await this.track('pdf_download', {
      order_id: orderId,
      timestamp: new Date().toISOString()
    }, userId)
  }

  async trackError(error: string, context: Record<string, any>, userId?: string) {
    await this.track('error', {
      error_message: error,
      context,
      timestamp: new Date().toISOString()
    }, userId)
  }
}

// Singleton instance
let posthogClient: PostHogClient | null = null

export function getPostHogClient(): PostHogClient {
  if (!posthogClient) {
    posthogClient = new PostHogClient(
      process.env.POSTHOG_API_KEY,
      process.env.POSTHOG_HOST
    )
  }
  return posthogClient
}

export { PostHogClient }