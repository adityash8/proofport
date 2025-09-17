# 🛂 ProofPort - Proof of Travel, Zero Headache

Generate flight & hotel confirmations, wallet passes, and visa insurance in seconds. No hidden fees. No sketchy PDFs—just verifiable reservations.

## 🚀 Features

- **⚡ Lightning Fast**: Generate documents in <45 seconds
- **🔐 100% Verifiable**: Real PNR confirmations and hotel bookings
- **📱 Multi-delivery**: Email, WhatsApp, and wallet pass delivery
- **⏳ Flexible TTL**: 1-14 day validity periods
- **🌐 Global Coverage**: 500+ airlines, 1M+ hotels worldwide
- **💳 Multiple Payments**: Stripe, Razorpay, Coinbase Commerce
- **🤖 AI-Powered**: Route optimization using Claude AI
- **📊 Real-time Dashboard**: Manage and extend your documents

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with magic links
- **Payments**: Stripe, Razorpay, Coinbase Commerce
- **External APIs**: Duffel (flights), Booking.com (hotels), Claude AI
- **PDF Generation**: Puppeteer
- **Communication**: Resend (email), Twilio (WhatsApp)
- **Analytics**: PostHog
- **Deployment**: Vercel
- **File Storage**: Cloudflare R2

## 🛠️ Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🗃️ Database Setup

1. Create a new Supabase project
2. Run the SQL from `supabase-schema.sql` in your Supabase SQL editor
3. Update your `.env.local` with Supabase credentials

## 📡 API Endpoints

### Core Features
- `POST /api/orders/generate` - Generate travel documents
- `GET /api/dashboard` - User order management
- `POST /api/auth/magic-link` - Passwordless authentication
- `POST /api/payments/stripe` - Payment processing
- `GET /api/orders/auto-cancel` - Cron job for expired orders

## 🔧 Configuration

Key environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
DUFFEL_KEY=your_duffel_api_key
CLAUDE_API_KEY=your_claude_api_key
```

See `.env.example` for the complete configuration.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

The app includes:
- Auto-scaling serverless functions
- Cron jobs for order management
- Edge optimization

## 💰 Pricing Structure

- **Flight Hold**: $15 (24-72h validity)
- **Hotel Booking**: $12 (free cancellation)
- **Travel Insurance**: $7 (certificate)
- **Extended TTL**: +$2/day beyond 3 days

## 🔒 Security Features

- Row Level Security (RLS) with Supabase
- Fraud detection with FingerprintJS
- Encrypted PII storage
- Automatic document expiry
- GDPR-compliant data handling

## 📱 User Experience

### Landing Page
- Hero section with value proposition
- Interactive trip form with real-time pricing
- Service bundle selection (flight/hotel/insurance)
- TTL slider for document validity

### Dashboard
- Real-time order management
- TTL countdown timers
- One-click document extension
- Multi-format downloads (PDF, WhatsApp, Wallet)

## 🤖 AI Integration

- **Route Optimization**: Claude AI suggests optimal routes
- **Fraud Detection**: ML-powered risk scoring
- **Price Optimization**: Dynamic pricing based on demand

## 📊 Analytics & Monitoring

- User behavior tracking with PostHog
- Payment flow optimization
- Fraud detection metrics
- Performance monitoring

## 🧪 Testing

```bash
npm run lint          # Code linting
npm run type-check    # TypeScript validation
npm run build         # Production build test
```

## 📋 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   └── auth/           # Auth callbacks
├── lib/                # Utility libraries
│   ├── supabase.ts     # Database client
│   ├── duffel.ts       # Flight API
│   ├── booking.ts      # Hotel API
│   ├── pdf-gen.ts      # Document generation
│   └── fraud.ts        # Security & fraud detection
└── components/         # Reusable UI components
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Create a GitHub issue
- Check the documentation
- Contact support@proofport.com

---

**ProofPort** - Making travel documentation effortless for digital nomads, visa applicants, and travelers worldwide. 🌍✈️
