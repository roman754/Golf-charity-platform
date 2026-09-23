# Golf Charity Platform

A full-stack web application where golfers track scores, participate in prize draws, and support charities.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Supabase** - PostgreSQL database & authentication
- **Stripe** - Payment processing
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety

## Features

- 🏌️ Golf score tracking (Stableford format)
- 🎯 Monthly prize draws
- 💳 Subscription management ($29.99/month or $299.99/year)
- ❤️ Charity donations (20% of proceeds)
- 👨‍💼 Admin dashboard
- 🌓 Dark/light mode

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Supabase (get from supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (get from stripe.com/dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

1. Create a Supabase project
2. Run `supabase-schema.sql` in SQL Editor
3. Activate charities: `UPDATE charities SET is_active = true;`
4. Disable email confirmation: Auth > Settings > uncheck "Enable email confirmations"

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing

### Create Admin Account
1. Sign up with email/password
2. Select "Admin" role during signup
3. Access admin dashboard at `/admin`

### Test Subscription (Local)
1. Use Stripe test card: `4242 4242 4242 4242`
2. After payment, click "Verify Subscription" on success page
3. Or run Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Project Structure

```
app/
├── (auth)/          # Login & signup
├── admin/           # Admin dashboard
├── api/             # API routes
├── dashboard/       # User dashboard
└── subscribe/       # Subscription flow

components/          # Reusable components
lib/                 # Utilities & clients
├── supabase/       # Database clients
├── auth.ts         # Auth helpers
├── draw-engine.ts  # Prize draw logic
└── stripe.ts       # Payment integration
```

## How It Works

### For Users
1. Sign up and select a charity
2. Subscribe (monthly/yearly)
3. Submit 5 golf scores
4. Automatically entered in monthly draws
5. Win prizes, support charities

### For Admins
1. Create monthly draw
2. Execute draw (generates winners)
3. Verify winners
4. Mark payments as completed

### Prize Distribution
- **5 matches**: 40% of pool + jackpot
- **4 matches**: 35% of pool
- **3 matches**: 25% of pool

## Deployment

### Vercel
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

Update `NEXT_PUBLIC_APP_URL` and configure Stripe webhook with production URL.

## Common Issues

**Subscription not activating?**
- Ensure Stripe webhook is configured
- Use Stripe CLI for local testing
- Or click "Verify Subscription" button

**Scores not in draw?**
- Must have exactly 5 scores
- Scores must be 1-45
- Active subscription required

**Dark mode not working?**
- Clear browser localStorage
- Check ThemeProvider in app

## License

Private and proprietary.
