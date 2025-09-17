import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { order_id, new_ttl } = await request.json()

    if (!order_id || !new_ttl) {
      return NextResponse.json(
        { error: 'Order ID and new TTL are required' },
        { status: 400 }
      )
    }

    // Get existing order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Calculate new expiry
    const newExpiry = new Date()
    newExpiry.setDate(newExpiry.getDate() + new_ttl)

    // Re-generate holds with new expiry
    let newPnr = order.pnr
    let newHotelConf = order.hotel_conf

    // Extend flight hold if exists
    if (order.pnr && order.json_data?.bundle?.includes('flight')) {
      // In real implementation, create new Duffel hold
      newPnr = `EXTENDED-${order.pnr}-${Date.now()}`
    }

    // Extend hotel hold if exists
    if (order.hotel_conf && order.json_data?.bundle?.includes('hotel')) {
      // In real implementation, create new booking
      newHotelConf = `EXTENDED-${order.hotel_conf}-${Date.now()}`
    }

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        pnr: newPnr,
        hotel_conf: newHotelConf,
        ttl: `${new_ttl} days`,
        expiry: newExpiry.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Order extended successfully',
      new_expiry: newExpiry.toISOString(),
      new_pnr: newPnr,
      new_hotel_conf: newHotelConf
    })

  } catch (error) {
    console.error('Extend order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}