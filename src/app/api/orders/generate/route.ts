import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface GenerateOrderRequest {
  origin: string
  dest: string
  dates: string
  passengers: number
  visa_type: string
  ttl_days: number
  bundle: string[]
}

export async function POST(request: NextRequest) {
  try {
    const {
      origin,
      dest,
      dates,
      passengers,
      visa_type,
      ttl_days,
      bundle
    }: GenerateOrderRequest = await request.json()

    // Get user from auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Claude AI route suggestion
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY || 'placeholder-key',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Suggest cheapest verifiable flight/hotel for ${visa_type} visa from ${origin} to ${dest} on ${dates}`
        }]
      })
    })

    let pnr = null
    let hotel_conf = null
    let screenshots: string[] = []

    // Generate flight hold if requested
    if (bundle.includes('flight')) {
      const duffelResponse = await fetch('https://api.duffel.com/air/offer_requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DUFFEL_KEY || 'placeholder-key'}`,
          'Content-Type': 'application/json',
          'Duffel-Version': 'v1'
        },
        body: JSON.stringify({
          slices: [{
            origin,
            destination: dest,
            departure_date: dates
          }],
          passengers: Array(passengers).fill({ type: 'adult' }),
          cabin_class: 'economy'
        })
      })

      if (duffelResponse.ok) {
        const duffelData = await duffelResponse.json()
        pnr = duffelData.data?.id || 'MOCK-PNR-123456'
      } else {
        pnr = 'MOCK-PNR-123456' // Fallback for prototype
      }
    }

    // Generate hotel hold if requested
    if (bundle.includes('hotel')) {
      // Mock Booking.com API call
      const bookingResponse = await fetch('https://mock-booking-api.com/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BOOKING_API_KEY || 'placeholder-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destination: dest,
          check_in: dates,
          free_cancel: true
        })
      }).catch(() => null)

      hotel_conf = 'HOTEL-CONF-789012' // Mock confirmation
    }

    // Generate insurance certificate if requested
    let insurance_data = null
    if (bundle.includes('insurance')) {
      insurance_data = {
        policy_number: 'INS-POL-345678',
        coverage: 'Travel Insurance',
        amount: '$50,000'
      }
    }

    // Calculate expiry
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + ttl_days)

    // Store order in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: 'mock-user-id', // In real implementation, get from auth
        pnr,
        hotel_conf,
        ttl: `${ttl_days} days`,
        expiry: expiry.toISOString(),
        status: 'completed',
        json_data: {
          origin,
          dest,
          dates,
          passengers,
          visa_type,
          bundle,
          insurance_data,
          screenshots: []
        }
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Mock PDF generation
    const pdf_url = `/api/orders/${orderData.id}/pdf`

    return NextResponse.json({
      order_id: orderData.id,
      pnr,
      hotel_conf,
      pdf_url,
      screenshots,
      expiry: expiry.toISOString()
    })

  } catch (error) {
    console.error('Order generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}