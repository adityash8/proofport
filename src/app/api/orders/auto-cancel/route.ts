import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get expired orders
    const { data: expiredOrders, error } = await supabase
      .from('orders')
      .select('*')
      .lt('expiry', new Date().toISOString())
      .eq('status', 'completed')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const cancelledOrders = []

    for (const order of expiredOrders || []) {
      try {
        // Cancel Duffel booking if exists
        if (order.pnr) {
          await fetch(`https://api.duffel.com/air/orders/${order.pnr}/actions/cancel`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.DUFFEL_KEY}`,
              'Content-Type': 'application/json',
              'Duffel-Version': 'v1'
            }
          }).catch(console.error)
        }

        // Cancel hotel booking if exists
        if (order.hotel_conf) {
          await fetch(`https://mock-booking-api.com/bookings/${order.hotel_conf}/cancel`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.BOOKING_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }).catch(console.error)
        }

        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.id)

        cancelledOrders.push(order.id)
      } catch (error) {
        console.error(`Failed to cancel order ${order.id}:`, error)
      }
    }

    return NextResponse.json({
      message: `Cancelled ${cancelledOrders.length} expired orders`,
      cancelled_orders: cancelledOrders
    })

  } catch (error) {
    console.error('Auto-cancel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}