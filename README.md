# Draft Trade Tracker

A modern fantasy hockey league draft order trading system with secure authentication, real-time updates, and a beautiful, responsive UI.

## ✨ Features

### Core Features
- **🔐 Secure Authentication**: Google OAuth with email whitelist protection
- **📊 Modern Dashboard**: Beautiful stats cards with real-time metrics
- **🎯 Draft Pick Management**: Track and manage your 1st, 2nd, and 3rd round picks
- **🤝 Advanced Trade System**: Propose, accept, and reject trades with league members
- **📈 League Standings**: View all league members and their current draft picks
- **⚡ Real-time Updates**: Instant trade status and activity updates
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile

### UI/UX Improvements
- **Modern Glassmorphism Design**: Beautiful gradients and shadow effects
- **Smooth Animations**: Hover effects and transitions throughout
- **Stats Dashboard**: Quick overview of active picks, pending offers, and completed trades
- **Enhanced Trade Cards**: Clear visual indicators for trade status
- **Notification System**: Animated alerts for pending trade offers
- **Color-Coded Status**: Easy-to-understand status badges
- **Professional Navigation**: Clean header with quick access to league standings

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Add your Google OAuth credentials (see SETUP.md)
   - Generate a secret with: `openssl rand -base64 32`

3. **Configure allowed emails**:
   - Edit `prisma/seed.ts`
   - Add league member email addresses

4. **Seed the database**:
   ```bash
   npm run seed
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Full Setup Instructions

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- Google OAuth configuration
- Email whitelist management
- Deployment guide
- Troubleshooting

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: NextAuth.js with Google Provider
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Project Structure

```
trade-track/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and configurations
├── prisma/          # Database schema and migrations
└── types/           # TypeScript definitions
```

## 🎮 Usage

### Dashboard
1. **Sign in** with your Google account (must be on the whitelist)
2. **View stats** at the top of your dashboard:
   - Active Picks (picks you still own)
   - Pending Offers (trades waiting for your response)
   - Completed Trades (successfully executed trades)
   - Trades Sent (proposals you've made)
3. **Manage picks** in the left sidebar
4. **Review trade activity** in the main panel

### Creating a Trade
1. Click "Propose New Trade" button
2. Select a trade partner from the dropdown
3. Choose which of your picks to offer
4. Click "Propose Trade"
5. Wait for the other party to accept or reject

### Reviewing Trade Offers
1. Check the notification banner for pending offers
2. Navigate to "Trade Activity" → "Received" tab
3. Review the trade details (what you give vs. what you get)
4. Click "Accept" or "Reject"

### League Standings
1. Click "League" in the header navigation
2. View all league members and their current picks
3. See who has active picks vs. traded picks
4. Check league statistics

## 🚀 Deployment

Ready to deploy? See our comprehensive [DEPLOYMENT.md](./DEPLOYMENT.md) guide for:
- Step-by-step Vercel deployment
- Database setup (Vercel Postgres, Supabase, or PlanetScale)
- Environment variable configuration
- Production database seeding
- Troubleshooting common issues

## 📝 Support

- **Setup Guide**: [SETUP.md](./SETUP.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: Create an issue on GitHub for bugs or feature requests

## 🎨 Screenshots

### Dashboard
- Modern stats cards showing your league activity
- Color-coded draft picks (active vs. traded)
- Real-time trade notifications

### Trade Management
- Clean, intuitive trade proposal interface
- Clear visual breakdown of trade terms
- Status badges for pending, accepted, and rejected trades

### League Standings
- Complete overview of all league members
- Visual representation of everyone's draft picks
- League-wide statistics

## 🔧 Customization

Want to customize for your league? You can:
- Modify colors in Tailwind config
- Add more draft rounds in the Prisma schema
- Extend trade functionality with additional fields
- Add email notifications (coming soon)
- Implement trade value calculations

## 📄 License

MIT License - feel free to use this for your own fantasy league!