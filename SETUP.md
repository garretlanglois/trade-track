# Draft Trade Tracker - Setup Guide

## Overview
This is a hockey fantasy league draft order trading system built with Next.js, NextAuth, and Prisma. It features:
- Google OAuth authentication with email whitelist
- Draft pick management (Rounds 1, 2, 3)
- Trade proposal and acceptance system
- Yahoo Fantasy-inspired design

## Prerequisites
- Node.js 18.19.1 or higher (20.9.0+ recommended)
- npm or yarn
- Google Cloud Platform account (for OAuth)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. For "Authorized redirect URIs", add:
   - `http://localhost:3000/api/auth/callback/google`
   - (Add your production URL when deploying)
7. Copy the Client ID and Client Secret

### 3. Set Up Environment Variables

Update the `.env.local` file with your credentials:

```env
DATABASE_URL="file:./dev.db"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Configure Allowed Emails

Edit `prisma/seed.ts` and add the email addresses of league members who should have access:

```typescript
const allowedEmails = [
  'member1@gmail.com',
  'member2@gmail.com',
  'member3@gmail.com',
  // Add all your league members here
];
```

### 5. Initialize the Database

```bash
# Run the seed script to populate allowed emails
npm run seed
```

The migration has already been created, so the database is ready to use.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For League Members

1. **Sign In**: Click "Get Started" and sign in with your Google account
2. **View Your Picks**: See your draft picks (Rounds 1, 2, 3) on the dashboard
3. **Propose a Trade**:
   - Click "Propose New Trade"
   - Select a trade partner
   - Choose which of your picks to trade
   - Submit the proposal
4. **Review Trades**: Accept or reject trade offers from other members

### For League Commissioners

1. **Add New Members**: Add their email to `prisma/seed.ts` and run `npm run seed`
2. **Remove Members**: Remove from the AllowedEmail table in the database
3. **Monitor Trades**: All trade activity is visible in the database

## Database Schema

- **User**: League members (authenticated via Google)
- **AllowedEmail**: Whitelist of approved email addresses
- **DraftPick**: Individual draft picks (Round 1, 2, or 3) for each user
- **Trade**: Trade proposals between users
- **TradeItem**: Items involved in each trade

## Deployment

### Environment Variables for Production

1. Update `NEXTAUTH_URL` to your production URL
2. Generate a new `NEXTAUTH_SECRET` for production
3. Update Google OAuth redirect URIs to include your production URL

### Deploy to Vercel

```bash
npm run build
```

Then deploy to Vercel or your preferred hosting platform.

## Troubleshooting

### "Access Denied" Error
- Make sure your Google account email is in the allowed emails list
- Run `npm run seed` after updating the seed file

### Database Issues
- Delete `prisma/dev.db` and run `npx prisma migrate dev` to reset
- Run `npm run seed` to repopulate allowed emails

### OAuth Issues
- Verify your Google OAuth credentials are correct
- Check that redirect URIs are properly configured in Google Cloud Console
- Make sure `NEXTAUTH_URL` matches your current URL

## File Structure

```
trade-track/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth API routes
│   │   └── trades/                # Trade management API
│   ├── auth/                      # Authentication pages
│   ├── dashboard/                 # Main dashboard
│   └── page.tsx                   # Landing page
├── components/                    # React components
├── lib/                          # Utilities and configurations
├── prisma/                       # Database schema and migrations
└── types/                        # TypeScript type definitions
```

## Support

For issues or questions, contact your league commissioner.
