import puppeteer, { Browser, Page } from 'puppeteer'

interface VerificationResult {
  success: boolean
  screenshot?: string
  error?: string
  verification_url?: string
}

interface FlightVerificationParams {
  pnr: string
  airline_code?: string
  last_name?: string
}

interface HotelVerificationParams {
  confirmation_number: string
  last_name?: string
  hotel_website?: string
}

class PuppeteerVerifier {
  private browser: Browser | null = null

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      })
    }
    return this.browser
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async verifyFlight(params: FlightVerificationParams): Promise<VerificationResult> {
    try {
      const browser = await this.init()
      const page = await browser.newPage()

      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 720 })
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

      // Generic airline verification URLs (examples)
      const verificationUrls = {
        'AA': 'https://www.aa.com/reservation/find',
        'DL': 'https://www.delta.com/us/en/my-trips/find-trip',
        'UA': 'https://www.united.com/ual/en/us/flight-search/book-a-flight/flightstatus/search-results',
        'default': 'https://www.google.com/flights'
      }

      const airlineCode = params.airline_code || 'default'
      const verificationUrl = verificationUrls[airlineCode] || verificationUrls.default

      // Navigate to verification page
      await page.goto(verificationUrl, { waitUntil: 'networkidle2', timeout: 30000 })

      // Wait for page to load
      await page.waitForTimeout(2000)

      // Try to find and fill PNR field (generic selectors)
      try {
        const pnrSelectors = [
          'input[name*="confirmation"]',
          'input[name*="pnr"]',
          'input[placeholder*="confirmation"]',
          'input[placeholder*="PNR"]',
          '#confirmation-number',
          '#pnr'
        ]

        let pnrFilled = false
        for (const selector of pnrSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 })
            await page.type(selector, params.pnr)
            pnrFilled = true
            break
          } catch (e) {
            continue
          }
        }

        if (params.last_name && pnrFilled) {
          const nameSelectors = [
            'input[name*="last"]',
            'input[name*="name"]',
            'input[placeholder*="last"]',
            'input[placeholder*="name"]'
          ]

          for (const selector of nameSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 })
              await page.type(selector, params.last_name)
              break
            } catch (e) {
              continue
            }
          }
        }
      } catch (error) {
        console.log('Could not fill form fields, taking screenshot anyway')
      }

      // Take screenshot
      const screenshot = await page.screenshot({
        encoding: 'base64',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      })

      await page.close()

      return {
        success: true,
        screenshot: `data:image/png;base64,${screenshot}`,
        verification_url: verificationUrl
      }

    } catch (error) {
      console.error('Flight verification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async verifyHotel(params: HotelVerificationParams): Promise<VerificationResult> {
    try {
      const browser = await this.init()
      const page = await browser.newPage()

      await page.setViewport({ width: 1280, height: 720 })
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

      // Default to booking.com for verification
      const verificationUrl = params.hotel_website || 'https://www.booking.com/myreservations.html'

      await page.goto(verificationUrl, { waitUntil: 'networkidle2', timeout: 30000 })
      await page.waitForTimeout(2000)

      // Try to find confirmation number field
      try {
        const confirmationSelectors = [
          'input[name*="confirmation"]',
          'input[name*="booking"]',
          'input[placeholder*="confirmation"]',
          'input[placeholder*="booking"]',
          '#confirmation-number'
        ]

        for (const selector of confirmationSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 })
            await page.type(selector, params.confirmation_number)
            break
          } catch (e) {
            continue
          }
        }

        if (params.last_name) {
          const nameSelectors = [
            'input[name*="last"]',
            'input[name*="name"]',
            'input[placeholder*="last"]'
          ]

          for (const selector of nameSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 })
              await page.type(selector, params.last_name)
              break
            } catch (e) {
              continue
            }
          }
        }
      } catch (error) {
        console.log('Could not fill hotel form fields')
      }

      const screenshot = await page.screenshot({
        encoding: 'base64',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      })

      await page.close()

      return {
        success: true,
        screenshot: `data:image/png;base64,${screenshot}`,
        verification_url: verificationUrl
      }

    } catch (error) {
      console.error('Hotel verification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async verifyBoth(
    flightParams: FlightVerificationParams,
    hotelParams: HotelVerificationParams
  ): Promise<{ flight: VerificationResult; hotel: VerificationResult }> {
    const [flightResult, hotelResult] = await Promise.all([
      this.verifyFlight(flightParams),
      this.verifyHotel(hotelParams)
    ])

    return {
      flight: flightResult,
      hotel: hotelResult
    }
  }
}

export { PuppeteerVerifier }
export type { VerificationResult, FlightVerificationParams, HotelVerificationParams }