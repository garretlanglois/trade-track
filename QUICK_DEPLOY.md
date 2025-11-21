# Quick Deploy to Vercel - Cheat Sheet

## Prerequisites Checklist
- [ ] GitHub account
- [ ] Vercel account ([vercel.com/signup](https://vercel.com/signup))
- [ ] Google OAuth Client ID and Secret
- [ ] Generated NEXTAUTH_SECRET (`openssl rand -base64 32`)

## 5-Minute Deployment

### Step 1: Push to GitHub (2 minutes)
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/draft-trade-tracker.git
git push -u origin main
```

### Step 2: Deploy on Vercel (3 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import" on your repository
3. Add these environment variables:

```env
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_OPTIONS=--dns-result-order=ipv4first
```

4. Click "Deploy"
5. Wait 2-3 minutes

### Step 3: Configure Google OAuth (1 minute)

Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials):

**Add to Authorized redirect URIs:**
```
https://your-app-name.vercel.app/api/auth/callback/google
```

**Add to Authorized JavaScript origins:**
```
https://your-app-name.vercel.app
```

### Step 4: Update NEXTAUTH_URL

1. Copy your Vercel URL (e.g., `draft-trade-tracker.vercel.app`)
2. Go to Vercel Dashboard → Settings → Environment Variables
3. Update `NEXTAUTH_URL` to `https://your-actual-url.vercel.app`
4. Redeploy (Deployments tab → ⋯ → Redeploy)

## Database for Production

⚠️ **SQLite won't work on Vercel!** Choose one:

### Option A: Vercel Postgres (Easiest)
1. Project → Storage → Create Database → Postgres
2. Update schema: `provider = "postgresql"`
3. Vercel auto-adds `DATABASE_URL`

### Option B: Supabase (Free)
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string
3. Update `DATABASE_URL` in Vercel
4. Update schema: `provider = "postgresql"`

### Option C: PlanetScale (Serverless MySQL)
1. Create database at [planetscale.com](https://planetscale.com)
2. Get connection string
3. Update `DATABASE_URL` in Vercel
4. Update schema: `provider = "mysql"` + `relationMode = "prisma"`

## Seed Production Database

After setting up database:

```bash
# Pull environment variables
vercel env pull .env.local

# Update seed file with real emails
# Edit prisma/seed.ts

# Run seed
npm run seed
```

## Troubleshooting

### "Configuration Error" on sign in
- ✅ Check Google OAuth redirect URIs match Vercel URL
- ✅ Verify NEXTAUTH_URL is set correctly
- ✅ Ensure GOOGLE_CLIENT_ID and SECRET are correct

### Database errors
- ✅ Verify DATABASE_URL is correct
- ✅ Check database is accessible
- ✅ Ensure `prisma generate` runs in build

### Build fails
- ✅ Run `npm run build` locally first
- ✅ Check build logs in Vercel
- ✅ Verify all dependencies are in package.json

## Post-Deployment Checklist

- [ ] Can sign in with Google
- [ ] Dashboard loads correctly
- [ ] Can create a trade
- [ ] Can view league page
- [ ] Stats cards show data
- [ ] Mobile view works
- [ ] Profile image loads

## Environment Variables Reference

Copy this template:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# Node
NODE_OPTIONS="--dns-result-order=ipv4first"
```

## Useful Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# Link to project
vercel link

# Check deployment status
vercel inspect <deployment-url>
```

## Custom Domain

1. Vercel Dashboard → Domains
2. Add your domain
3. Update DNS records
4. Update Google OAuth URIs
5. Update NEXTAUTH_URL

## Getting Help

- 📚 [Full Deployment Guide](./DEPLOYMENT.md)
- 🔧 [Setup Guide](./SETUP.md)
- 📖 [README](./README.md)
- 🆕 [What's New](./UPGRADE_SUMMARY.md)

---

**Your app will be live at:** `https://your-app-name.vercel.app`

**Deployment time:** ~5 minutes
**Cost:** Free tier is usually sufficient
