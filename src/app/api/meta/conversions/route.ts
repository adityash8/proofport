import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface ConversionsAPIEvent {
  event_name: string
  event_time: number
  event_source_url?: string
  user_data: {
    email?: string
    phone?: string
    client_ip_address?: string
    client_user_agent?: string
    fbp?: string
    fbc?: string
  }
  custom_data?: any
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    if (!process.env.META_PIXEL_ID || !process.env.META_CONVERSION_TOKEN) {
      console.warn('Meta Pixel ID or Conversion Token not configured')
      return NextResponse.json({ success: false, error: 'Not configured' }, { status: 400 })
    }

    // Hash user data for privacy
    const hashUserData = (data: string | undefined): string | undefined => {
      if (!data) return undefined
      return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
    }

    const conversionsData = {
      data: [{
        event_name: eventData.eventName,
        event_time: eventData.eventTime,
        event_source_url: eventData.eventSourceUrl || process.env.NEXT_PUBLIC_SITE_URL,
        user_data: {
          em: eventData.userData.email ? hashUserData(eventData.userData.email) : undefined,
          ph: eventData.userData.phone ? hashUserData(eventData.userData.phone) : undefined,
          client_ip_address: eventData.userData.clientIpAddress,
          client_user_agent: eventData.userData.clientUserAgent,
          fbp: eventData.userData.fbp,
          fbc: eventData.userData.fbc,
        },
        custom_data: eventData.customData,
      }],
      test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined,
    }

    // Remove undefined values
    const cleanData = JSON.parse(JSON.stringify(conversionsData))

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.META_CONVERSION_TOKEN}`,
        },
        body: JSON.stringify(cleanData),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Meta Conversions API error:', result)
      return NextResponse.json({ success: false, error: result }, { status: response.status })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Meta Conversions API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}