# Pinboard Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Pinboard application to production. The application consists of:
- **Frontend**: Next.js 15 app (React with TypeScript)
- **Backend**: Express.js API (Node.js with TypeScript)
- **Database**: MongoDB Atlas (free tier M0 cluster)

## Current Status
✅ **Frontend**: Code deployed to Vercel (URL: https://pinboard-hgzy4hou4-lokeshnachukuppam25s-projects.vercel.app)
✅ **Backend**: Code ready for deployment
✅ **Database**: MongoDB Atlas configured and seeded with sample data
✅ **GitHub**: All code pushed to https://github.com/lokeshnachukuppam25/pinboard

## Prerequisites
- GitHub account (already set up)
- MongoDB Atlas account with connection string: `mongodb+srv://lokesh:Lokesh123@cluster0.yjgkm4r.mongodb.net/pinboard?retryWrites=true&w=majority&appName=Cluster0`
- Deployment service account (Vercel for frontend, Railway/Render/Fly.io for backend)

---

## Part 1: Frontend Deployment (Vercel)

### Current Status
✅ Already deployed to Vercel at: https://pinboard-hgzy4hou4-lokeshnachukuppam25s-projects.vercel.app

### If Re-deploying or Troubleshooting:

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Log in with GitHub account

2. **Connect Your GitHub Repository**
   - Click "Add New" → "Project"
   - Select "lokeshnachukuppam25/pinboard" repository
   - Framework: Next.js (auto-detected)

3. **Configure Project Settings**
   - Root Directory: `apps/web`
   - Build Command: `npm install && npm run build`
   - Output Directory: `.next`

4. **Set Environment Variables**
   - `NEXT_PUBLIC_API_BASE_URL`: Backend URL (will add after backend deployment)
   
5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (5-15 minutes)

### Frontend Configuration File
The `vercel.json` file is already configured:
```json
{
  "root": "apps/web",
  "buildCommand": "npm install && npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

---

## Part 2: Backend Deployment

### Option A: Railway (Recommended - Simplest)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose "lokeshnachukuppam25/pinboard"

3. **Configure Backend Service**
   - In Railway dashboard, add a new service
   - Service Type: "GitHub"
   - Select the repository
   - Root Directory: `apps/api`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`

4. **Set Environment Variables**
   - Click "Variables" tab
   - Add:
     ```
     MONGODB_URI=mongodb+srv://lokesh:Lokesh123@cluster0.yjgkm4r.mongodb.net/pinboard?retryWrites=true&w=majority&appName=Cluster0
     JWT_SECRET=your-secret-key-change-this
     CORS_ORIGIN=https://your-vercel-frontend-url
     PUBLIC_BASE_URL=https://your-railway-backend-url
     ```

5. **Deploy**
   - Click "Deploy"
   - Copy the generated domain URL for backend

### Option B: Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Repository: "pinboard"
   - Select "Connect"

3. **Configure Service**
   - **Name**: `pinboard-api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Instance Type**: Free
   - **Region**: Choose closest to you

4. **Set Environment Variables**
   - Add the same environment variables as Railway (see above)

5. **Create**
   - Click "Create Web Service"
   - Render will auto-deploy; copy the generated URL

### Option C: Fly.io

1. **Install Fly CLI**
   ```bash
   npm install -g flyctl
   ```

2. **Authenticate**
   ```bash
   fly auth login
   ```

3. **Create and Deploy**
   ```bash
   cd apps/api
   fly launch
   ```
   - Choose app name: `pinboard-api`
   - Select region closest to you
   - Answer no to database setup

4. **Set Secrets**
   ```bash
   fly secrets set MONGODB_URI="mongodb+srv://lokesh:Lokesh123@cluster0.yjgkm4r.mongodb.net/pinboard?retryWrites=true&w=majority&appName=Cluster0"
   fly secrets set JWT_SECRET="your-secret-key"
   fly secrets set CORS_ORIGIN="https://your-vercel-url"
   fly secrets set PUBLIC_BASE_URL="https://pinboard-api.fly.dev"
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

---

## Part 3: Connect Frontend to Backend

After backend is deployed:

1. **Get Backend URL** from your deployment service (Railway/Render/Fly.io)

2. **Update Backend Environment Variable**
   - Set `CORS_ORIGIN` to your Vercel frontend URL
   - Example: `https://pinboard-hgzy4hou4-lokeshnachukuppam25s-projects.vercel.app`

3. **Update Frontend Environment Variable in Vercel**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend-url`
   - Trigger a redeploy: "Deployments" → Latest → "Redeploy"

---

## Part 4: Verify Deployment

1. **Frontend**
   - Visit your Vercel URL
   - Should see login/register page
   - App should load without errors

2. **Backend**
   - Visit `https://your-backend-url/api/health` (if endpoint exists)
   - Or try making a search request from frontend
   - Check browser console for API errors

3. **Database**
   - Should have 50 seed posts already in MongoDB
   - Search should return results
   - User authentication should work

---

## Environment Variables Reference

### Backend (.env in apps/api)
```
MONGODB_URI=mongodb+srv://lokesh:Lokesh123@cluster0.yjgkm4r.mongodb.net/pinboard?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=change-this-to-secure-random-string
CORS_ORIGIN=https://your-vercel-frontend-url
PUBLIC_BASE_URL=https://your-railway-backend-url
```

### Frontend (Vercel Environment Variables)
```
NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend-url
```

---

## Troubleshooting

### Frontend shows 401 Unauthorized
- Wait 10-15 minutes for Vercel build to complete
- Check Vercel dashboard for build errors
- Verify `vercel.json` is in repository root
- Ensure `apps/web` directory exists with package.json

### Backend API not responding
- Check environment variables are set correctly
- Verify MongoDB connection string is valid
- Ensure CORS_ORIGIN matches frontend URL exactly
- Check backend service logs for errors

### Search returns no results
- Database may be empty; run seed script:
  ```bash
  cd apps/api
  npm run seed
  ```

### "Cannot find module" errors
- Dependencies might not be installed
- Redeploy from your service dashboard
- Check that Build Command includes `npm install`

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/search?q=query` - Search posts
- `POST /api/posts` - Create new post (authenticated)
- `POST /api/posts/:id/like` - Like a post (authenticated)

### Users
- `GET /api/users/:username` - Get user profile
- `GET /api/users/:username/posts` - Get user's posts

---

## Local Development

To run locally during testing:

```bash
# Install dependencies
npm install

# Start backend (terminal 1)
cd apps/api
npm run dev

# Start frontend (terminal 2)
cd apps/web
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:4000

---

## Next Steps

1. Choose a backend deployment service (Railway recommended)
2. Follow the deployment steps for that service
3. Update environment variables to connect frontend and backend
4. Test the full application flow
5. Share your deployed URL!

---

## Support

- GitHub Repository: https://github.com/lokeshnachukuppam25/pinboard
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
