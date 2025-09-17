import { Twilio } from 'twilio'

interface WhatsAppMessage {
  to: string
  message: string
  mediaUrl?: string
}

class TwilioClient {
  private client: Twilio
  private fromWhatsApp: string

  constructor(accountSid: string, authToken: string, whatsappNumber: string) {
    this.client = new Twilio(accountSid, authToken)
    this.fromWhatsApp = `whatsapp:${whatsappNumber}`
  }

  async sendWhatsAppMessage(params: WhatsAppMessage): Promise<boolean> {
    try {
      const message = await this.client.messages.create({
        body: params.message,
        from: this.fromWhatsApp,
        to: `whatsapp:${params.to}`,
        ...(params.mediaUrl && { mediaUrl: [params.mediaUrl] })
      })

      console.log(`WhatsApp message sent: ${message.sid}`)
      return true
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)
      return false
    }
  }

  async sendOrderConfirmation(
    phoneNumber: string,
    orderData: {
      orderId: string
      pnr?: string
      hotelConf?: string
      pdfUrl: string
      expiry: string
    }
  ): Promise<boolean> {
    const message = `
🛂 *ProofPort - Your Travel Documents Are Ready!*

📋 Order ID: ${orderData.orderId}
${orderData.pnr ? `✈️ Flight PNR: ${orderData.pnr}` : ''}
${orderData.hotelConf ? `🏨 Hotel Confirmation: ${orderData.hotelConf}` : ''}

📄 Download your documents: ${orderData.pdfUrl}

⏰ Expires: ${new Date(orderData.expiry).toLocaleDateString()}

Need help? Reply to this message or visit proofport.com/support

*ProofPort - Proof of Travel, Zero Headache* 🌟
    `.trim()

    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message
    })
  }

  async sendExtensionNotification(
    phoneNumber: string,
    orderData: {
      orderId: string
      newExpiry: string
      pdfUrl: string
    }
  ): Promise<boolean> {
    const message = `
🔄 *ProofPort - Documents Extended*

📋 Order ID: ${orderData.orderId}
✅ Your travel documents have been extended!

📄 Download updated documents: ${orderData.pdfUrl}
⏰ New expiry: ${new Date(orderData.newExpiry).toLocaleDateString()}

*ProofPort - Proof of Travel, Zero Headache* 🌟
    `.trim()

    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message
    })
  }

  async sendExpiryReminder(
    phoneNumber: string,
    orderData: {
      orderId: string
      expiry: string
      extendUrl: string
    }
  ): Promise<boolean> {
    const hoursLeft = Math.round(
      (new Date(orderData.expiry).getTime() - Date.now()) / (1000 * 60 * 60)
    )

    const message = `
⚠️ *ProofPort - Documents Expiring Soon*

📋 Order ID: ${orderData.orderId}
⏰ Expires in ${hoursLeft} hours (${new Date(orderData.expiry).toLocaleDateString()})

🔄 Extend your documents: ${orderData.extendUrl}

Don't let your travel plans get disrupted!

*ProofPort - Proof of Travel, Zero Headache* 🌟
    `.trim()

    return this.sendWhatsAppMessage({
      to: phoneNumber,
      message
    })
  }
}

// Mock implementation for prototype
class MockTwilioClient {
  async sendWhatsAppMessage(params: WhatsAppMessage): Promise<boolean> {
    console.log(`[MOCK] WhatsApp to ${params.to}: ${params.message}`)
    return true
  }

  async sendOrderConfirmation(phoneNumber: string, orderData: any): Promise<boolean> {
    console.log(`[MOCK] Order confirmation sent to ${phoneNumber}:`, orderData)
    return true
  }

  async sendExtensionNotification(phoneNumber: string, orderData: any): Promise<boolean> {
    console.log(`[MOCK] Extension notification sent to ${phoneNumber}:`, orderData)
    return true
  }

  async sendExpiryReminder(phoneNumber: string, orderData: any): Promise<boolean> {
    console.log(`[MOCK] Expiry reminder sent to ${phoneNumber}:`, orderData)
    return true
  }
}

export { TwilioClient, MockTwilioClient }
export type { WhatsAppMessage }