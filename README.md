# NeighbourNet — Hyperlocal Community Intelligence Platform

Full-stack + AI + real-time project. Built incrementally, day by day, over an **8-week** schedule (2-3 hrs/day) — see note on pace below.

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), Redis (ioredis), Socket.io, Passport (Google OAuth), JWT, Claude API (`@anthropic-ai/sdk`), Cloudinary, node-cron, Helmet

**Frontend:** React 18, Vite, Tailwind CSS + Ant Design, Leaflet.js, Zustand, Axios, Socket.io-client

**Infra:** MongoDB Atlas (M0), Redis Cloud, Render (backend), Vercel (frontend)

---

## Architecture

### Repo layout (monorepo, sibling folders)

```
neighbournet-core/
├── neighbournet-backend/
└── neighbournet-frontend/
```

### Backend — `neighbournet-backend/`

```
neighbournet-backend/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── redis.js            # Redis client setup
│   │   └── passport.js         # Google OAuth strategy
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js             # includes 2dsphere index
│   │   ├── Comment.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth/*
│   │   ├── post.routes.js      # /api/posts/*
│   │   ├── user.routes.js      # /api/users/*
│   │   ├── feed.routes.js      # /api/feed/*
│   │   └── digest.routes.js    # /api/digest/*
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   ├── feed.controller.js
│   │   └── digest.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validate.middleware.js
│   ├── services/
│   │   ├── ai.service.js       # Claude API calls
│   │   ├── cache.service.js    # Redis cache-aside
│   │   ├── socket.service.js   # Socket.io logic
│   │   └── cron.service.js     # Daily digest cron
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   └── geo.utils.js
│   └── app.js
├── server.js
├── .env                        # not committed
├── .env.example
├── .gitignore
└── package.json
```

### Frontend — `neighbournet-frontend/`

```
neighbournet-frontend/
├── src/
│   ├── components/
│   │   ├── Feed/           # PostCard, FeedFilter
│   │   ├── Map/            # LocalityMap, IssuePin
│   │   ├── Auth/           # LoginForm, RegisterForm
│   │   ├── Notifications/  # Bell, NotifDropdown
│   │   ├── Digest/         # DigestCard, DigestList
│   │   └── shared/         # Navbar, Sidebar, Loader
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── PostDetail.jsx
│   │   ├── Profile.jsx
│   │   ├── CivicTracker.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── store/
│   │   ├── authStore.js    # Zustand
│   │   └── notifStore.js
│   ├── services/
│   │   ├── api.js          # Axios instance
│   │   └── socket.js
│   ├── hooks/
│   │   ├── useGeolocation.js
│   │   └── useSocket.js
│   └── utils/
│       └── formatters.js
├── index.html
└── package.json
```

---

## Build Log

| Day | Status | What was built |
|-----|--------|-----------------|
| Day 1 | ✅ Done | Backend init, dependencies, `src/config/db.js`, `src/config/redis.js`, `src/app.js`, `server.js`, `.env` setup, MongoDB Atlas + Redis Cloud connected, `/api/health` verified |
| Day 2 | ⏳ Next | User & Post Mongoose schemas, `2dsphere` geospatial index verified in Atlas |

*(This table gets updated as each day is completed.)*

---

## Notes on pace

The original blueprint scoped this project at **8 weeks** (2-3 hrs/day). We're sticking to that pace rather than a compressed 4-week version — Day 1 alone surfaced several real environment/config issues (file paths, dotenv resolution, URL-encoding a Redis password) that were worth debugging properly rather than rushing past. Any deviation from the structure or schedule above will be called out explicitly when it happens.

---

## Environment Variables

See `.env.example` in `neighbournet-backend/` for the full list. Never commit `.env`.

## Setup

```bash
# Backend
cd neighbournet-backend
npm install
npm run dev

# Frontend (from Week 1, Days 5-7 onward)
cd neighbournet-frontend
npm install
npm run dev
```
