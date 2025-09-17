import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header (simplified for prototype)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, verify the JWT token
    const userId = 'mock-user-id' // Extract from verified JWT

    // Get user's orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        payments (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate time remaining for each order
    const ordersWithTimeLeft = orders?.map(order => ({
      ...order,
      time_left: order.expiry ?
        Math.max(0, new Date(order.expiry).getTime() - Date.now()) : 0,
      expired: order.expiry ? new Date(order.expiry) < new Date() : false
    }))

    return NextResponse.json({
      orders: ordersWithTimeLeft,
      total_orders: orders?.length || 0
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}