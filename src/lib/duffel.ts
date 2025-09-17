interface DuffelClient {
  apiKey: string
  baseUrl: string
}

interface FlightSearchParams {
  origin: string
  destination: string
  departure_date: string
  passengers: Array<{ type: 'adult' | 'child' | 'infant' }>
  cabin_class?: 'economy' | 'premium_economy' | 'business' | 'first'
}

interface FlightOffer {
  id: string
  total_amount: string
  total_currency: string
  slices: Array<{
    segments: Array<{
      operating_carrier: {
        iata_code: string
        name: string
      }
      flight_number: string
      departure_datetime: string
      arrival_datetime: string
    }>
  }>
}

interface HoldResponse {
  id: string
  booking_reference: string
  expires_at: string
  passengers: Array<{
    id: string
    booking_reference: string
  }>
}

class DuffelAPI {
  private client: DuffelClient

  constructor(apiKey: string) {
    this.client = {
      apiKey,
      baseUrl: 'https://api.duffel.com'
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.client.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.client.apiKey}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v1',
        'Accept': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Duffel API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async searchOffers(params: FlightSearchParams): Promise<FlightOffer[]> {
    const body = {
      slices: [{
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departure_date
      }],
      passengers: params.passengers,
      cabin_class: params.cabin_class || 'economy'
    }

    const response = await this.makeRequest('/air/offer_requests', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    return response.data?.offers || []
  }

  async createHold(offerId: string, passengers: Array<{
    title: string
    given_name: string
    family_name: string
    born_on: string
    email: string
    phone_number: string
  }>): Promise<HoldResponse> {
    const body = {
      selected_offers: [offerId],
      passengers: passengers.map(p => ({
        title: p.title,
        given_name: p.given_name,
        family_name: p.family_name,
        born_on: p.born_on,
        email: p.email,
        phone_number: p.phone_number
      })),
      type: 'hold'
    }

    const response = await this.makeRequest('/air/orders', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    return response.data
  }

  async cancelHold(orderId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/air/orders/${orderId}/actions/cancel`, {
        method: 'POST'
      })
      return true
    } catch (error) {
      console.error('Failed to cancel Duffel hold:', error)
      return false
    }
  }

  async getOrder(orderId: string) {
    const response = await this.makeRequest(`/air/orders/${orderId}`)
    return response.data
  }
}

export { DuffelAPI }
export type { FlightSearchParams, FlightOffer, HoldResponse }