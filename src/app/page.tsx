'use client'

import { useState } from 'react'
import { trackFormSubmission, trackOrderGeneration, sendServerSideEvent } from '@/lib/analytics'

export default function Home() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    passengers: 1,
    visaType: '',
    ttlDays: 3,
    bundle: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Track form submission
    trackFormSubmission('travel_document_form', {
      origin: formData.origin,
      destination: formData.destination,
      visa_type: formData.visaType,
      bundle: formData.bundle,
      ttl_days: formData.ttlDays
    })

    try {
      const response = await fetch('/api/orders/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: formData.origin,
          dest: formData.destination,
          dates: formData.departureDate,
          passengers: formData.passengers,
          visa_type: formData.visaType,
          ttl_days: formData.ttlDays,
          bundle: formData.bundle
        })
      })

      const data = await response.json()
      if (response.ok) {
        setResult(data)

        // Track successful order generation
        const orderAmount = calculatePrice()
        trackOrderGeneration({
          orderId: data.order_id,
          amount: orderAmount,
          currency: 'USD',
          services: formData.bundle,
          ttlDays: formData.ttlDays
        })

        // Send server-side event to Meta
        await sendServerSideEvent({
          eventName: 'Purchase',
          eventTime: Math.floor(Date.now() / 1000),
          userData: {
            clientIpAddress: '', // Will be populated server-side
            clientUserAgent: navigator.userAgent,
          },
          customData: {
            value: orderAmount,
            currency: 'USD',
            content_ids: formData.bundle,
            content_type: 'product',
          }
        })
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Network error occurred')
    }

    setIsLoading(false)
  }

  const handleBundleChange = (service: string) => {
    setFormData(prev => ({
      ...prev,
      bundle: prev.bundle.includes(service)
        ? prev.bundle.filter(s => s !== service)
        : [...prev.bundle, service]
    }))
  }

  const calculatePrice = () => {
    let price = 0
    if (formData.bundle.includes('flight')) price += 15
    if (formData.bundle.includes('hotel')) price += 12
    if (formData.bundle.includes('insurance')) price += 7
    if (formData.ttlDays > 3) price += (formData.ttlDays - 3) * 2
    return price
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Proof of Travel,
              </span>
              <br />
              <span className="text-white">Zero Headache</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Generate flight & hotel confirmations, wallet passes, and visa insurance in seconds.
              No hidden fees. No sketchy PDFs—just verifiable reservations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm text-gray-300">Generated in <span className="text-blue-400 font-semibold">&lt;45s</span></div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">🔐</div>
                <div className="text-sm text-gray-300">100% <span className="text-green-400 font-semibold">Verifiable</span></div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm text-gray-300">WhatsApp + <span className="text-purple-400 font-semibold">Wallet Pass</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Generate Your Travel Documents</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From (Origin)</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="JFK, New York"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To (Destination)</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="CDG, Paris"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Departure Date</label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Passengers</label>
                <select
                  value={formData.passengers}
                  onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visa Type</label>
                <select
                  value={formData.visaType}
                  onChange={(e) => setFormData(prev => ({ ...prev, visaType: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select visa type</option>
                  <option value="tourist">Tourist Visa</option>
                  <option value="business">Business Visa</option>
                  <option value="schengen">Schengen Visa</option>
                  <option value="transit">Transit Visa</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* TTL Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Validity: {formData.ttlDays} {formData.ttlDays === 1 ? 'Day' : 'Days'}
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">1 day</span>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={formData.ttlDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, ttlDays: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-400">14 days</span>
              </div>
            </div>

            {/* Bundle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Select Services</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'flight', name: 'Flight Hold', price: 15, icon: '✈️', desc: 'Real PNR confirmation' },
                  { id: 'hotel', name: 'Hotel Booking', price: 12, icon: '🏨', desc: 'Free cancellation' },
                  { id: 'insurance', name: 'Travel Insurance', price: 7, icon: '🛡️', desc: 'Certificate for visa' }
                ].map((service) => (
                  <label key={service.id} className="relative">
                    <input
                      type="checkbox"
                      checked={formData.bundle.includes(service.id)}
                      onChange={() => handleBundleChange(service.id)}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.bundle.includes(service.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{service.icon}</span>
                        <span className="text-blue-400 font-semibold">${service.price}</span>
                      </div>
                      <h3 className="font-semibold text-white">{service.name}</h3>
                      <p className="text-sm text-gray-400">{service.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            {formData.bundle.length > 0 && (
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total Price:</span>
                  <span className="text-2xl font-bold text-green-400">${calculatePrice()}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {formData.ttlDays > 3 && `Includes $${(formData.ttlDays - 3) * 2} for extended validity`}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || formData.bundle.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Documents...
                </div>
              ) : (
                `Generate Documents - $${calculatePrice()}`
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h3 className="text-lg font-semibold text-green-400 mb-4">✅ Documents Generated Successfully!</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {result.pnr && (
                  <div>
                    <span className="text-gray-400">Flight PNR:</span>
                    <span className="text-white font-mono ml-2">{result.pnr}</span>
                  </div>
                )}
                {result.hotel_conf && (
                  <div>
                    <span className="text-gray-400">Hotel Confirmation:</span>
                    <span className="text-white font-mono ml-2">{result.hotel_conf}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={result.pdf_url}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📄 Download PDF
                </a>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  📱 Send to WhatsApp
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  📲 Add to Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Why Choose ProofPort?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🔄',
              title: 'Real-time Verification',
              description: 'Our documents are backed by real API calls to airlines and hotels, ensuring 100% verifiability.'
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Generate complete travel document packages in under 45 seconds, not hours.'
            },
            {
              icon: '🌐',
              title: 'Global Coverage',
              description: 'Support for 500+ airlines and 1M+ hotels worldwide with local payment methods.'
            },
            {
              icon: '📱',
              title: 'Multi-delivery Options',
              description: 'Get documents via email, WhatsApp, wallet pass, or download directly.'
            },
            {
              icon: '🔐',
              title: 'Secure & Private',
              description: 'Bank-level encryption with automatic document expiry for your privacy.'
            },
            {
              icon: '💰',
              title: 'Transparent Pricing',
              description: 'No hidden fees. Pay only for what you need with flexible validity periods.'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
