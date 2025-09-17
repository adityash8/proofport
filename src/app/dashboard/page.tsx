'use client'

import { useState, useEffect } from 'react'

interface Order {
  id: string
  pnr?: string
  hotel_conf?: string
  status: string
  expiry: string
  created_at: string
  time_left: number
  expired: boolean
  json_data: {
    origin?: string
    dest?: string
    dates?: string
    bundle?: string[]
    passengers?: number
  }
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': 'Bearer mock-token' // In real implementation, use actual JWT
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
    setLoading(false)
  }

  const formatTimeLeft = (timeLeft: number) => {
    if (timeLeft <= 0) return 'Expired'

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const handleExtend = async (orderId: string) => {
    try {
      const response = await fetch('/api/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          order_id: orderId,
          new_ttl: 7 // Extend by 7 days
        })
      })

      if (response.ok) {
        alert('Order extended successfully!')
        fetchOrders() // Refresh the list
      } else {
        alert('Failed to extend order')
      }
    } catch (error) {
      alert('Network error occurred')
    }
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      // In real implementation, call cancel API
      alert('Order cancelled successfully!')
      fetchOrders()
    } catch (error) {
      alert('Failed to cancel order')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your travel documents and orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Orders</p>
                <p className="text-2xl font-bold text-white">
                  {orders.filter(order => !order.expired && order.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-white">
                  {orders.filter(order => order.time_left > 0 && order.time_left < 24 * 60 * 60 * 1000).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Expired</p>
                <p className="text-2xl font-bold text-white">
                  {orders.filter(order => order.expired).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Your Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-lg mb-4">No orders found</div>
              <p className="text-gray-500 mb-6">Create your first travel document to get started</p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Order
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Time Left
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {order.json_data?.origin} → {order.json_data?.dest}
                          </div>
                          <div className="text-sm text-gray-400">
                            {order.json_data?.dates} • {order.json_data?.passengers} passenger(s)
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Order #{order.id.slice(0, 8)}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.pnr && (
                            <div className="flex items-center text-sm">
                              <span className="text-blue-400 mr-2">✈️</span>
                              <span className="text-white font-mono">{order.pnr}</span>
                            </div>
                          )}
                          {order.hotel_conf && (
                            <div className="flex items-center text-sm">
                              <span className="text-green-400 mr-2">🏨</span>
                              <span className="text-white font-mono">{order.hotel_conf}</span>
                            </div>
                          )}
                          {order.json_data?.bundle?.includes('insurance') && (
                            <div className="flex items-center text-sm">
                              <span className="text-purple-400 mr-2">🛡️</span>
                              <span className="text-gray-300">Insurance</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.expired
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.expired ? 'Expired' : order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className={`text-sm ${
                          order.expired ? 'text-red-400' :
                          order.time_left < 24 * 60 * 60 * 1000 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {formatTimeLeft(order.time_left)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires {new Date(order.expiry).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/api/orders/${order.id}/pdf`, '_blank')}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Download
                          </button>

                          {!order.expired && (
                            <>
                              <span className="text-gray-600">•</span>
                              <button
                                onClick={() => handleExtend(order.id)}
                                className="text-green-400 hover:text-green-300 text-sm font-medium"
                              >
                                Extend
                              </button>
                            </>
                          )}

                          <span className="text-gray-600">•</span>
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📄 Need New Documents?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Generate new flight and hotel confirmations for your next trip
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Create New Order
            </a>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📱 WhatsApp Delivery</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get your documents delivered instantly via WhatsApp
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
              Setup WhatsApp
            </button>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">💳 Payment Methods</h3>
            <p className="text-gray-400 text-sm mb-4">
              Manage your payment methods and billing preferences
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
              Manage Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}