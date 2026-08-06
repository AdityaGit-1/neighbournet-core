# 🏘️ NeighbourNet — Hyperlocal Community Intelligence Platform

> **Engineered for High-Concurrency Locality Networks, Real-Time Geo-Routing, and AI-Driven Community Synthesis.**

NeighbourNet is an end-to-end full-stack geospatial platform designed to solve urban community fragmentation. It connects residents within specific geographical radiuses (1km - 10km) and pincodes, providing real-time emergency alerts, automated daily locality summaries, civic issue lifecycle tracking, and dynamic gamified leaderboards.

---

## 🏗️ System Architecture Overview

```text
               +-------------------------------------------+
               |            React / Leaflet UI             |
               +--------------------+----------------------+
                                    |
                            [REST / WebSockets]
                                    |
                                    v
               +-------------------------------------------+
               |        Express.js Core Application        |
               +--+-----------------+-------------------+--+
                  |                 |                   |
                  v                 v                   v
        +-------------------+ +-----------+ +-------------------+
        |  MongoDB Atlas    | | Redis     | | Claude API        |
        |  (2dsphere Index) | | (Cache/   | | (Auto-Category &  |
        |                   | |  ZSETs)   | |  Daily Digest)    |
        +-------------------+ +-----------+ +-------------------+

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