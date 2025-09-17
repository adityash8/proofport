import puppeteer from 'puppeteer'

interface DocumentData {
  order_id: string
  passenger_name: string
  pnr?: string
  flight_details?: {
    origin: string
    destination: string
    departure_date: string
    airline: string
    flight_number: string
  }
  hotel_confirmation?: string
  hotel_details?: {
    name: string
    check_in: string
    check_out: string
    address: string
  }
  insurance_data?: {
    policy_number: string
    coverage: string
    amount: string
  }
  screenshots?: string[]
  expiry: string
}

class PDFGenerator {
  async generateTravelDocumentsPDF(data: DocumentData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()

      const html = this.generateHTML(data)

      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      })

      return pdf
    } finally {
      await browser.close()
    }
  }

  private generateHTML(data: DocumentData): string {
    const currentDate = new Date().toLocaleDateString()
    const expiryDate = new Date(data.expiry).toLocaleDateString()

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>ProofPort - Travel Documents</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
          }

          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 30px;
          }

          .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 5px;
          }

          .header p {
            color: #666;
            font-size: 14px;
          }

          .document-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
          }

          .section-title {
            color: #1f2937;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .info-item {
            display: flex;
            flex-direction: column;
          }

          .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }

          .info-value {
            color: #1f2937;
            font-size: 16px;
          }

          .verification-box {
            background: #dbeafe;
            border: 1px solid #2563eb;
            border-radius: 6px;
            padding: 15px;
            margin-top: 15px;
          }

          .verification-title {
            color: #1e40af;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .verification-text {
            color: #1e40af;
            font-size: 14px;
          }

          .screenshot {
            margin-top: 20px;
            text-align: center;
          }

          .screenshot img {
            max-width: 100%;
            height: auto;
            border: 1px solid #d1d5db;
            border-radius: 4px;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }

          .expiry-warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 10px;
            margin: 20px 0;
            text-align: center;
          }

          .expiry-warning strong {
            color: #92400e;
          }

          @media print {
            .document-section {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛂 ProofPort</h1>
          <p>Travel Document Verification Service</p>
          <p>Generated on ${currentDate} • Order ID: ${data.order_id}</p>
        </div>

        ${data.pnr ? `
        <div class="document-section">
          <h2 class="section-title">✈️ Flight Reservation</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Passenger Name</span>
              <span class="info-value">${data.passenger_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Booking Reference (PNR)</span>
              <span class="info-value">${data.pnr}</span>
            </div>
            ${data.flight_details ? `
            <div class="info-item">
              <span class="info-label">Route</span>
              <span class="info-value">${data.flight_details.origin} → ${data.flight_details.destination}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Departure Date</span>
              <span class="info-value">${data.flight_details.departure_date}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Airline</span>
              <span class="info-value">${data.flight_details.airline}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Flight Number</span>
              <span class="info-value">${data.flight_details.flight_number}</span>
            </div>
            ` : ''}
          </div>
          <div class="verification-box">
            <div class="verification-title">Verification Instructions</div>
            <div class="verification-text">
              Visit your airline's website and enter PNR: <strong>${data.pnr}</strong> with passenger name: <strong>${data.passenger_name}</strong>
            </div>
          </div>
        </div>
        ` : ''}

        ${data.hotel_confirmation ? `
        <div class="document-section">
          <h2 class="section-title">🏨 Hotel Reservation</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Guest Name</span>
              <span class="info-value">${data.passenger_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Confirmation Number</span>
              <span class="info-value">${data.hotel_confirmation}</span>
            </div>
            ${data.hotel_details ? `
            <div class="info-item">
              <span class="info-label">Hotel Name</span>
              <span class="info-value">${data.hotel_details.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Check-in Date</span>
              <span class="info-value">${data.hotel_details.check_in}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Check-out Date</span>
              <span class="info-value">${data.hotel_details.check_out}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Address</span>
              <span class="info-value">${data.hotel_details.address}</span>
            </div>
            ` : ''}
          </div>
          <div class="verification-box">
            <div class="verification-title">Verification Instructions</div>
            <div class="verification-text">
              Visit the hotel's website or booking platform and enter confirmation: <strong>${data.hotel_confirmation}</strong>
            </div>
          </div>
        </div>
        ` : ''}

        ${data.insurance_data ? `
        <div class="document-section">
          <h2 class="section-title">🛡️ Travel Insurance Certificate</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Insured Name</span>
              <span class="info-value">${data.passenger_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Policy Number</span>
              <span class="info-value">${data.insurance_data.policy_number}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Coverage Type</span>
              <span class="info-value">${data.insurance_data.coverage}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Coverage Amount</span>
              <span class="info-value">${data.insurance_data.amount}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="expiry-warning">
          <strong>⚠️ Important:</strong> These documents expire on <strong>${expiryDate}</strong>.
          Please use them before this date for visa applications or border crossings.
        </div>

        ${data.screenshots && data.screenshots.length > 0 ? `
        <div class="document-section">
          <h2 class="section-title">📸 Verification Screenshots</h2>
          ${data.screenshots.map((screenshot, index) => `
            <div class="screenshot">
              <img src="${screenshot}" alt="Verification Screenshot ${index + 1}" />
              <p style="margin-top: 10px; color: #6b7280; font-size: 12px;">
                Screenshot ${index + 1} - Taken on ${currentDate}
              </p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="footer">
          <p><strong>ProofPort</strong> - Proof of Travel, Zero Headache</p>
          <p>This document was generated electronically and is valid for verification purposes.</p>
          <p>For support, visit proofport.com or contact support@proofport.com</p>
        </div>
      </body>
    </html>
    `
  }

  async generateWalletPass(data: DocumentData): Promise<string> {
    // Mock wallet pass generation - in real implementation, use PassKit or similar
    const passData = {
      description: "ProofPort Travel Documents",
      formatVersion: 1,
      organizationName: "ProofPort",
      passTypeIdentifier: "pass.com.proofport.travel",
      serialNumber: data.order_id,
      teamIdentifier: "PROOFPORT",
      relevantDate: data.expiry,
      expirationDate: data.expiry,
      generic: {
        primaryFields: [
          {
            key: "pnr",
            label: "PNR",
            value: data.pnr || "N/A"
          }
        ],
        secondaryFields: [
          {
            key: "passenger",
            label: "Passenger",
            value: data.passenger_name
          },
          {
            key: "hotel",
            label: "Hotel Conf",
            value: data.hotel_confirmation || "N/A"
          }
        ]
      }
    }

    // Return mock wallet pass URL
    return `https://api.proofport.com/wallet-pass/${data.order_id}`
  }
}

export { PDFGenerator }
export type { DocumentData }