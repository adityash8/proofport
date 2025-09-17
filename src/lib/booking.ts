interface BookingClient {
  apiKey: string
  baseUrl: string
}

interface HotelSearchParams {
  destination: string
  check_in: string
  check_out: string
  guests: number
  rooms: number
  free_cancellation?: boolean
}

interface HotelOffer {
  id: string
  name: string
  price: {
    amount: number
    currency: string
  }
  cancellation_policy: {
    free_cancellation_until?: string
    cancellation_type: 'free' | 'paid' | 'non_refundable'
  }
  location: {
    address: string
    city: string
    country: string
  }
}

interface HotelReservation {
  confirmation_number: string
  hotel_name: string
  check_in: string
  check_out: string
  guest_name: string
  cancellation_deadline: string
  total_amount: number
  currency: string
}

class BookingAPI {
  private client: BookingClient

  constructor(apiKey: string) {
    this.client = {
      apiKey,
      baseUrl: 'https://api.booking.com' // Mock URL
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.client.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.client.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Booking API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
    // Mock implementation for prototype
    const mockOffers: HotelOffer[] = [
      {
        id: 'hotel_1',
        name: `Hotel in ${params.destination}`,
        price: {
          amount: 89.99,
          currency: 'USD'
        },
        cancellation_policy: {
          free_cancellation_until: params.check_in,
          cancellation_type: 'free'
        },
        location: {
          address: '123 Main St',
          city: params.destination,
          country: 'Various'
        }
      }
    ]

    // In real implementation:
    /*
    const body = {
      destination: params.destination,
      check_in: params.check_in,
      check_out: params.check_out,
      guests: params.guests,
      rooms: params.rooms,
      filters: {
        free_cancellation: params.free_cancellation
      }
    }

    const response = await this.makeRequest('/hotels/search', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    return response.data?.hotels || []
    */

    return mockOffers
  }

  async createReservation(
    hotelId: string,
    guestDetails: {
      first_name: string
      last_name: string
      email: string
      phone: string
    },
    checkIn: string,
    checkOut: string
  ): Promise<HotelReservation> {
    // Mock implementation for prototype
    const mockReservation: HotelReservation = {
      confirmation_number: `BK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      hotel_name: `Hotel in Destination`,
      check_in: checkIn,
      check_out: checkOut,
      guest_name: `${guestDetails.first_name} ${guestDetails.last_name}`,
      cancellation_deadline: checkIn,
      total_amount: 89.99,
      currency: 'USD'
    }

    // In real implementation:
    /*
    const body = {
      hotel_id: hotelId,
      guest: guestDetails,
      check_in: checkIn,
      check_out: checkOut,
      room_type: 'standard',
      cancellation_policy: 'free'
    }

    const response = await this.makeRequest('/hotels/reservations', {
      method: 'POST',
      body: JSON.stringify(body)
    })

    return response.data
    */

    return mockReservation
  }

  async cancelReservation(confirmationNumber: string): Promise<boolean> {
    try {
      // Mock implementation
      console.log(`Cancelling hotel reservation: ${confirmationNumber}`)

      // In real implementation:
      /*
      await this.makeRequest(`/hotels/reservations/${confirmationNumber}/cancel`, {
        method: 'POST'
      })
      */

      return true
    } catch (error) {
      console.error('Failed to cancel hotel reservation:', error)
      return false
    }
  }

  async getReservation(confirmationNumber: string) {
    // Mock implementation
    return {
      confirmation_number: confirmationNumber,
      status: 'confirmed',
      check_in: '2024-01-01',
      check_out: '2024-01-02'
    }

    // In real implementation:
    /*
    const response = await this.makeRequest(`/hotels/reservations/${confirmationNumber}`)
    return response.data
    */
  }
}

export { BookingAPI }
export type { HotelSearchParams, HotelOffer, HotelReservation }