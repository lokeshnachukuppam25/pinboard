## Pinboard (Pinterest-inspired) – Full Stack App

This repo contains a minimal, professional full-stack MVP inspired by Pinterest.

### Tech
- **Web**: Next.js (App Router) + TypeScript + Tailwind
- **API**: Node.js + Express + TypeScript + MongoDB (Mongoose) + JWT Auth
- **Uploads**: local disk (`apps/api/uploads/`) served as static files

---

## Project structure
- `apps/api`: backend REST API
- `apps/web`: frontend Next.js app

---

## Quickstart

### 1) Start MongoDB

If you have Docker:

```bash
docker compose up -d
```

Or run MongoDB locally and set `MONGODB_URI` accordingly.

### 2) Backend (API)

```bash
cd apps/api
cp .env.example .env
npm install
npm run dev
```

API runs on `http://localhost:4000`

### 3) Frontend (Web)

```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Web runs on `http://localhost:3000`

---

## Environment variables

### API – `apps/api/.env`
- `PORT=4000`
- `MONGODB_URI=mongodb://localhost:27017/pinboard`
- `JWT_SECRET=change-me`
- `CORS_ORIGIN=http://localhost:3000`
- `PUBLIC_BASE_URL=http://localhost:4000`

### WEB – `apps/web/.env.local`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

---

## Core features implemented (MVP)
- Auth: register/login/logout, JWT, auth middleware
- Feed: paginated posts, infinite scroll on the frontend
- Posts: create post with image upload, title + description + tags
- Post detail: view, like, save/unsave, comments
- Profile: user page with created posts + saved posts
- Search: basic query + tag filtering

