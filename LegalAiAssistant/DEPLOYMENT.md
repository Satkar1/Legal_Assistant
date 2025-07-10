# LexiBot Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Database**: Set up a PostgreSQL database (Neon is recommended)

## Step 1: Prepare Your Repository

1. Make sure all your code is committed to GitHub
2. Ensure your repository has these files:
   - `vercel.json` (already created)
   - `api/index.js` (already created)
   - `package.json` with correct build scripts

## Step 2: Environment Variables

You'll need to set these environment variables in Vercel:

### Required Variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A random secret key for sessions
- `REPL_ID` - Your Replit app ID (if using Replit Auth)
- `ISSUER_URL` - OAuth issuer URL (default: https://replit.com/oidc)
- `REPLIT_DOMAINS` - Your Vercel app domain (e.g., your-app.vercel.app)

### Optional Variables (for enhanced features):
- `GOOGLE_TRANSLATE_API_KEY` - For better translation quality
- `OPENAI_API_KEY` - If you want to use OpenAI instead of free models
- `ANTHROPIC_API_KEY` - If you want to use Claude instead of free models

## Step 3: Database Setup

### Option 1: Neon Database (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel

### Option 2: Other PostgreSQL providers
- Supabase
- PlanetScale
- Railway
- Any PostgreSQL instance

## Step 4: Deploy to Vercel

### Method 1: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it as a Node.js project
5. Add your environment variables in the "Environment Variables" section
6. Click "Deploy"

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: lexibot
# - Which directory? ./
# - Want to override settings? Yes
# - Output directory: dist/public
# - Build command: npm run build
```

## Step 5: Configure Environment Variables

After deployment, add environment variables:

```bash
# Using Vercel CLI
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add REPL_ID
vercel env add REPLIT_DOMAINS
vercel env add ISSUER_URL

# Then redeploy
vercel --prod
```

Or use the Vercel dashboard:
1. Go to your project settings
2. Click "Environment Variables"
3. Add each variable for Production, Preview, and Development

## Step 6: Database Migration

After deployment, run database migrations:

```bash
# If using Vercel CLI with database access
npx drizzle-kit push
```

Or run the migration from your local environment pointing to the production database.

## Step 7: Configure Authentication

### For Replit Auth:
1. Update your OAuth app settings to include your Vercel domain
2. Set `REPLIT_DOMAINS` to your Vercel app URL (e.g., `your-app.vercel.app`)

### For other auth providers:
Update the callback URLs in your OAuth provider settings.

## Step 8: Test Your Deployment

1. Visit your Vercel app URL
2. Test the landing page
3. Try logging in
4. Test the AI chat functionality
5. Verify database operations work

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Verify build command is correct: `npm run build`

2. **Database Connection Fails**:
   - Verify `DATABASE_URL` is set correctly
   - Ensure database allows connections from Vercel IPs

3. **Authentication Issues**:
   - Check OAuth callback URLs
   - Verify `REPLIT_DOMAINS` matches your Vercel domain
   - Ensure `SESSION_SECRET` is set

4. **API Routes Not Working**:
   - Check that `api/index.js` is properly configured
   - Verify routing in `vercel.json`

5. **Static Files Not Loading**:
   - Ensure build output is in `dist/public`
   - Check Vercel build logs

### Performance Optimization:

1. **Enable Caching**:
   ```json
   {
     "headers": [
       {
         "source": "/static/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

2. **Configure Functions**:
   ```json
   {
     "functions": {
       "api/index.js": {
         "maxDuration": 30
       }
     }
   }
   ```

## Production Checklist

- [ ] All environment variables set
- [ ] Database connected and migrated
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Static assets loading
- [ ] Error handling working
- [ ] Performance monitoring set up

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Review build logs for errors
3. Test API endpoints directly
4. Verify environment variables are set correctly

Your LexiBot legal assistant will be live at: `https://your-project-name.vercel.app`