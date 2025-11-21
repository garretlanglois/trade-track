# Vercel Deployment Guide - Draft Trade Tracker

This guide will walk you through deploying your Draft Trade Tracker application to Vercel.

## Prerequisites

Before you begin, make sure you have:
- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your Google OAuth credentials ready
- A generated NEXTAUTH_SECRET

## Step 1: Push Your Code to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```

2. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name it `draft-trade-tracker` (or any name you prefer)
   - Don't initialize with README, .gitignore, or license (you already have these)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/draft-trade-tracker.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Prepare for Production

### 1. Generate a Secure NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output - you'll need it for Vercel environment variables.

### 2. Update Google OAuth Settings

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Select your OAuth 2.0 Client ID
2. Add your Vercel deployment URL to **Authorized JavaScript origins**:
   ```
   https://your-app-name.vercel.app
   ```
3. Add the callback URL to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

   *Note: Replace `your-app-name` with your actual Vercel deployment URL*

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub account

2. **Import Your Repository**:
   - Click "Import Project"
   - Select your `draft-trade-tracker` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Add Environment Variables**:
   Click on "Environment Variables" and add the following:

   | Name | Value | Notes |
   |------|-------|-------|
   | `DATABASE_URL` | `file:./dev.db` | For development; see Step 4 for production database |
   | `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Your Vercel deployment URL |
   | `NEXTAUTH_SECRET` | `your-generated-secret` | The secret you generated in Step 2.1 |
   | `GOOGLE_CLIENT_ID` | `your-google-client-id` | From Google Cloud Console |
   | `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` | From Google Cloud Console |
   | `NODE_OPTIONS` | `--dns-result-order=ipv4first` | Fixes network issues |

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (2-5 minutes)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? draft-trade-tracker
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NODE_OPTIONS

# Deploy to production
vercel --prod
```

## Step 4: Set Up Production Database

⚠️ **Important**: SQLite is not suitable for Vercel production deployments because Vercel uses ephemeral filesystem.

### Option A: Use Vercel Postgres (Recommended)

1. **Add Vercel Postgres**:
   - Go to your project dashboard on Vercel
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a region close to your users
   - Click "Create"

2. **Update Environment Variables**:
   - Vercel will automatically add `POSTGRES_URL` and other variables
   - Update your `DATABASE_URL` in Vercel environment variables to use the Postgres connection string
   - Remove the old `DATABASE_URL` value

3. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

4. **Update Prisma Models** (if needed):
   - Remove `@default(cuid())` and use Postgres UUID generators
   - Test your schema locally with a Postgres database first

5. **Run Migrations on Vercel**:
   - After deploying, Vercel will run `prisma generate` automatically
   - You'll need to run migrations manually or in a build script

### Option B: Use Supabase (Free Alternative)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your database connection string

2. **Update Environment Variables in Vercel**:
   - Add `DATABASE_URL` with your Supabase connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

3. **Update Prisma Schema** (same as Option A)

### Option C: Use PlanetScale (Serverless MySQL)

1. **Create PlanetScale Database**:
   - Go to [planetscale.com](https://planetscale.com)
   - Create a new database
   - Get your connection string

2. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

## Step 5: Seed Your Production Database

After setting up your production database:

1. **Add Allowed Emails**:
   - Connect to your production database
   - Run the seed script or manually insert allowed emails

2. **Via Vercel CLI**:
   ```bash
   # Connect to your Vercel project
   vercel link

   # Run seed command (if you have a seed script configured)
   vercel env pull .env.local
   npm run seed
   ```

3. **Via Prisma Studio** (if using Vercel Postgres):
   ```bash
   # Pull environment variables
   vercel env pull .env.local

   # Open Prisma Studio
   npx prisma studio

   # Add allowed emails through the UI
   ```

## Step 6: Final Configuration

1. **Update Google OAuth Redirect URIs**:
   - Go back to Google Cloud Console
   - Update the authorized redirect URI to your actual Vercel URL
   - Example: `https://draft-trade-tracker.vercel.app/api/auth/callback/google`

2. **Update NEXTAUTH_URL**:
   - In Vercel dashboard, go to Settings > Environment Variables
   - Update `NEXTAUTH_URL` to match your production URL

3. **Redeploy**:
   ```bash
   vercel --prod
   ```
   Or push a new commit to trigger automatic deployment

## Step 7: Test Your Deployment

1. Visit your Vercel URL
2. Try signing in with Google
3. Check if the database is working
4. Test creating a trade
5. Verify all pages load correctly

## Common Issues & Solutions

### Issue: "Configuration Error" on Sign In

**Solution**:
- Verify Google OAuth credentials are correct
- Check that redirect URIs in Google Console match your Vercel URL exactly
- Ensure `NEXTAUTH_URL` environment variable is set correctly

### Issue: Database Connection Error

**Solution**:
- Check `DATABASE_URL` is correct
- For Postgres: Ensure connection string includes SSL parameters
- Verify database is accessible from Vercel's regions

### Issue: Build Fails

**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally

### Issue: "Prisma Client Not Generated"

**Solution**:
- Ensure `prisma generate` runs in build script
- Add to `package.json` scripts:
  ```json
  {
    "scripts": {
      "build": "prisma generate && next build"
    }
  }
  ```

## Continuous Deployment

Once set up, Vercel will automatically deploy:
- Every push to `main` branch → Production
- Every push to other branches → Preview deployments

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update Google OAuth and `NEXTAUTH_URL` to use custom domain

## Environment Variables Reference

Here's a complete list of required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."  # Your production database URL

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"  # Your production URL
NEXTAUTH_SECRET="your-generated-secret"  # openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Node Options
NODE_OPTIONS="--dns-result-order=ipv4first"
```

## Security Checklist

Before going live:

- [ ] NEXTAUTH_SECRET is strong and unique (32+ characters)
- [ ] Google OAuth credentials are from production project
- [ ] Database has proper access controls
- [ ] Environment variables are set in Vercel (not committed to Git)
- [ ] `.env.local` is in `.gitignore`
- [ ] Sensitive data is not exposed in client-side code
- [ ] CORS settings are configured if needed
- [ ] Rate limiting is considered for API routes

## Monitoring & Maintenance

1. **Check Vercel Analytics**:
   - View traffic and performance
   - Monitor build times
   - Check for errors

2. **Database Backups**:
   - Set up automatic backups for your database
   - Test restore procedures

3. **Update Dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

## Getting Help

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

## Next Steps

After successful deployment:

1. Add more league members via the allowed emails list
2. Customize the app for your league
3. Consider adding features like:
   - Email notifications
   - Trade history analytics
   - Draft pick valuations
   - Mobile app (PWA)

---

**Congratulations!** 🎉 Your Draft Trade Tracker is now live on Vercel!

Your live URL: `https://your-app-name.vercel.app`
