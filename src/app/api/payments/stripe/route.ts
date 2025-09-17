import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-08-27.basil'
})

export async function POST(request: NextRequest) {
  try {
    const { amount, order_id } = await request.json()

    if (!amount || !order_id) {
      return NextResponse.json(
        { error: 'Amount and order_id are required' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'ProofPort - Travel Documents',
            description: 'Flight and hotel verification documents'
          },
          unit_amount: Math.round(amount * 100) // Convert to cents
        },
        quantity: 1
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        order_id
      }
    })

    // Store payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id,
        amount,
        status: 'pending',
        stripe_session_id: session.id
      })

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    return NextResponse.json({
      session_url: session.url,
      session_id: session.id
    })

  } catch (error) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}