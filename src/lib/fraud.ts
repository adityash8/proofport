import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface FraudCheckResult {
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  reasons: string[]
  deviceId: string
  shouldBlock: boolean
}

interface DeviceFingerprint {
  visitorId: string
  confidence: number
  browserDetails: Record<string, any>
  timestamp: string
}

class FraudDetectionService {
  private fpPromise: Promise<any> | null = null

  constructor() {
    // Initialize FingerprintJS on client side only
    if (typeof window !== 'undefined') {
      this.fpPromise = FingerprintJS.load()
    }
  }

  async getDeviceFingerprint(): Promise<DeviceFingerprint | null> {
    if (!this.fpPromise) {
      return null
    }

    try {
      const fp = await this.fpPromise
      const result = await fp.get()

      return {
        visitorId: result.visitorId,
        confidence: result.confidence.score,
        browserDetails: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: navigator.platform
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting device fingerprint:', error)
      return null
    }
  }

  async checkFraud(data: {
    deviceFingerprint?: DeviceFingerprint
    email: string
    amount: number
    country?: string
    ipAddress?: string
    orderData: Record<string, any>
  }): Promise<FraudCheckResult> {
    const reasons: string[] = []
    let score = 0

    // Device fingerprint analysis
    if (data.deviceFingerprint) {
      if (data.deviceFingerprint.confidence < 0.5) {
        score += 0.2
        reasons.push('Low device fingerprint confidence')
      }
    } else {
      score += 0.3
      reasons.push('No device fingerprint available')
    }

    // Email analysis
    if (this.isDisposableEmail(data.email)) {
      score += 0.4
      reasons.push('Disposable email detected')
    }

    if (this.isSuspiciousEmail(data.email)) {
      score += 0.3
      reasons.push('Suspicious email pattern')
    }

    // Amount analysis
    if (data.amount > 500) {
      score += 0.2
      reasons.push('High transaction amount')
    }

    if (data.amount < 10) {
      score += 0.1
      reasons.push('Unusually low amount')
    }

    // Order pattern analysis
    if (this.hasSuspiciousOrderPattern(data.orderData)) {
      score += 0.3
      reasons.push('Suspicious order pattern')
    }

    // Country risk (simplified)
    if (data.country && this.isHighRiskCountry(data.country)) {
      score += 0.2
      reasons.push('High-risk country')
    }

    // IP analysis (mock - would integrate with IP intelligence service)
    if (data.ipAddress && this.isSuspiciousIP(data.ipAddress)) {
      score += 0.3
      reasons.push('Suspicious IP address')
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high'
    let shouldBlock = false

    if (score >= 0.8) {
      riskLevel = 'high'
      shouldBlock = true
    } else if (score >= 0.5) {
      riskLevel = 'medium'
    } else {
      riskLevel = 'low'
    }

    return {
      score: Math.min(score, 1.0),
      riskLevel,
      reasons,
      deviceId: data.deviceFingerprint?.visitorId || 'unknown',
      shouldBlock
    }
  }

  private isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      'tempmail.org',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email'
    ]

    const domain = email.split('@')[1]?.toLowerCase()
    return disposableDomains.includes(domain)
  }

  private isSuspiciousEmail(email: string): boolean {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\d{6,}/, // Too many consecutive numbers
      /[a-z]{20,}/, // Too many consecutive letters
      /(.)\1{4,}/, // Repeated characters
    ]

    return suspiciousPatterns.some(pattern => pattern.test(email))
  }

  private hasSuspiciousOrderPattern(orderData: Record<string, any>): boolean {
    // Check for suspicious order patterns
    const today = new Date()
    const orderDate = new Date(orderData.dates || orderData.departure_date)

    // Same-day travel (might be suspicious)
    if (orderDate.toDateString() === today.toDateString()) {
      return true
    }

    // Far future travel (might be test)
    const daysDiff = (orderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff > 365) {
      return true
    }

    return false
  }

  private isHighRiskCountry(country: string): boolean {
    // Simplified high-risk country check
    const highRiskCountries = ['XX', 'YY'] // Replace with actual risk assessment
    return highRiskCountries.includes(country.toUpperCase())
  }

  private isSuspiciousIP(ipAddress: string): boolean {
    // Mock IP analysis - in real implementation, integrate with IP intelligence
    // Check for known VPN/proxy ranges, bot networks, etc.
    const suspiciousRanges = [
      '10.0.0.0/8',    // Private range (might indicate proxy)
      '172.16.0.0/12', // Private range
      '192.168.0.0/16' // Private range
    ]

    // Simple check for private ranges
    return suspiciousRanges.some(range => {
      // Simplified check - in real implementation, use proper CIDR matching
      return ipAddress.startsWith(range.split('/')[0].split('.').slice(0, 2).join('.'))
    })
  }

  async reportFraud(orderId: string, reason: string, additionalData?: Record<string, any>) {
    // In real implementation, report to fraud database/service
    console.log(`Fraud reported for order ${orderId}: ${reason}`, additionalData)
  }

  async getDeviceHistory(deviceId: string) {
    // In real implementation, query device history from database
    return {
      deviceId,
      previousOrders: 0,
      firstSeen: new Date().toISOString(),
      riskScore: 0.1
    }
  }
}

// Mock Stripe Radar integration
class StripeRadarMock {
  static async evaluatePayment(paymentData: {
    amount: number
    currency: string
    email: string
    card?: any
  }): Promise<{ riskScore: number; outcome: 'approve' | 'review' | 'block' }> {
    // Mock Stripe Radar evaluation
    let riskScore = Math.random() * 0.3 // Base low risk

    // Increase risk based on patterns
    if (paymentData.amount > 1000) riskScore += 0.2
    if (paymentData.email.includes('test')) riskScore += 0.3

    let outcome: 'approve' | 'review' | 'block'
    if (riskScore >= 0.8) {
      outcome = 'block'
    } else if (riskScore >= 0.4) {
      outcome = 'review'
    } else {
      outcome = 'approve'
    }

    return { riskScore, outcome }
  }
}

export { FraudDetectionService, StripeRadarMock }
export type { FraudCheckResult, DeviceFingerprint }