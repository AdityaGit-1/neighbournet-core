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
