# GRAVITY — FULL SYSTEM DOCUMENTATION
### Trackalways Technologies Pvt Ltd
**Platform:** Family Safety App | **Version:** 2.1.0 | **Last Updated:** June 2026

---

## TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Frontend — Public Website](#4-frontend--public-website)
5. [Frontend — Role-Based Dashboards](#5-frontend--role-based-dashboards)
6. [Frontend — Admin Panel](#6-frontend--admin-panel)
7. [Backend API](#7-backend-api)
8. [Database — All Tables](#8-database--all-tables)
9. [API Endpoints — Complete List](#9-api-endpoints--complete-list)
10. [Authentication System](#10-authentication-system)
11. [Frontend API Client](#11-frontend-api-client)
12. [Design System](#12-design-system)
13. [How to Run — Local](#13-how-to-run--local)
14. [VPS Deployment](#14-vps-deployment)
15. [Credentials — All Roles](#15-credentials--all-roles)
16. [Seed Data](#16-seed-data)

---

## 1. PROJECT OVERVIEW

**Gravity** is a premium family safety platform by Trackalways Technologies. It allows families to stay connected through real-time location sharing, SOS emergency alerts, geofence zone management, health monitoring, driving safety, and family chat.

### Live Production URLs (VPS)
| Service | URL |
|---|---|
| Website + Dashboards | https://gravity.kvlbusinessssolutions.com |
| Parent Dashboard | https://gravity.kvlbusinessssolutions.com/parent |
| Child Dashboard | https://gravity.kvlbusinessssolutions.com/child |
| Super Admin Panel | https://gravity.kvlbusinessssolutions.com/super-admin |
| Login | https://gravity.kvlbusinessssolutions.com/login |

### Local Development URLs
| Service | URL |
|---|---|
| Website | http://localhost:3000 |
| User Dashboard | http://localhost:3000/dashboard |
| Parent Dashboard | http://localhost:3000/parent |
| Child Dashboard | http://localhost:3000/child |
| Moderator Panel | http://localhost:3000/moderator |
| Super Admin Panel | http://localhost:3000/super-admin |
| Admin Panel (legacy) | http://localhost:3000/admin |
| Backend API | http://localhost:8000 |
| API Swagger Docs | http://localhost:8000/docs |

---

## 2. TECH STACK

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.3 | App Router, SSR/SSG framework |
| React | 18.3.0 | UI library |
| TypeScript | 5.4.5 | Type safety |
| Tailwind CSS | 3.4.3 | Utility-first styling |
| Framer Motion | 11.2.0 | Animations, transitions |
| Lucide React | 0.378.0 | Icon library |
| Leaflet / React-Leaflet | 4.2.1 | Interactive map component |
| Next-Themes | 0.4.6 | Dark/Light mode switching |
| GSAP | 3.12.5 | Advanced scroll animations |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.111.0 | REST API framework |
| Python | 3.12 | Language |
| SQLAlchemy | 2.0.30 | ORM, database models |
| SQLite | built-in | Database (dev + production) |
| Alembic | 1.13.1 | Database migrations |
| bcrypt | 4.2.1 | Password hashing |
| python-jose | 3.3.0 | JWT token generation/validation |
| Uvicorn | 0.29.0 | ASGI server |
| Anthropic SDK | 0.25.0 | AI chat integration |
| Pydantic | 2.7.1 | Request/response validation |

---

## 3. PROJECT STRUCTURE

```
TRACKALWAYS GRAVITY 2.0/
├── SYSTEM_INFO.md                    ← This file
└── website/
    ├── frontend/                     ← Next.js 14 app
    │   ├── middleware.ts             ← Route protection (role-based auth)
    │   ├── next.config.js            ← API rewrites: /families → backend:8001
    │   ├── app/                      ← App Router pages
    │   │   ├── layout.tsx            ← Root layout + SEO metadata
    │   │   ├── page.tsx              ← Homepage
    │   │   ├── login/                ← Unified login (all roles)
    │   │   ├── dashboard/            ← User dashboard (premium)
    │   │   ├── parent/               ← Parent monitoring dashboard (real API data)
    │   │   ├── child/                ← Child safety dashboard (real API data)
    │   │   ├── moderator/            ← Moderator panel
    │   │   ├── super-admin/          ← Super Admin command center
    │   │   ├── about/
    │   │   ├── features/
    │   │   ├── pricing/
    │   │   ├── blog/
    │   │   ├── careers/
    │   │   ├── contact/
    │   │   ├── help/
    │   │   ├── press/
    │   │   ├── live-tracking/
    │   │   ├── geofencing/
    │   │   ├── sos-emergency/
    │   │   ├── elderly-care/
    │   │   ├── privacy/
    │   │   ├── terms/
    │   │   ├── cookies/
    │   │   ├── status/
    │   │   └── admin/                ← Legacy Admin panel (17 pages)
    │   │       ├── layout.tsx        ← Sidebar + header + JWT auth
    │   │       ├── page.tsx          ← Dashboard
    │   │       ├── login/
    │   │       ├── families/
    │   │       ├── devices/
    │   │       ├── locations/
    │   │       ├── geofences/
    │   │       ├── alerts/
    │   │       ├── check-ins/
    │   │       ├── journeys/
    │   │       ├── family-chat/
    │   │       ├── driving-safety/
    │   │       ├── health/
    │   │       ├── elderly-care/
    │   │       ├── analytics/
    │   │       ├── notifications/
    │   │       ├── plans/
    │   │       └── settings/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx
    │   │   │   └── Footer.tsx
    │   │   ├── sections/
    │   │   │   ├── HeroSection.tsx
    │   │   │   ├── StatsSection.tsx
    │   │   │   ├── FeaturesSection.tsx
    │   │   │   ├── LiveMapDemoSection.tsx  ← Passes members={MAP_MEMBERS} to MapView
    │   │   │   ├── HowItWorksSection.tsx
    │   │   │   ├── ElderlyCareSection.tsx
    │   │   │   ├── TestimonialsSection.tsx
    │   │   │   ├── PricingSection.tsx
    │   │   │   ├── DownloadCTA.tsx
    │   │   │   ├── MapView.tsx             ← Leaflet map; requires `members` prop
    │   │   │   └── ParentChildSection.tsx
    │   │   ├── parent/
    │   │   │   └── ParentMonitor.tsx       ← Full parent dashboard (real API data)
    │   │   ├── child/
    │   │   │   ├── ChildHome.tsx           ← Child home tab (real API data)
    │   │   │   ├── ChildSOS.tsx            ← SOS, LocationSection, FamilyRadarSection
    │   │   │   └── ChildLife.tsx           ← School, Health, Achievements, Chat, Settings
    │   │   ├── super-admin/
    │   │   │   ├── s1-overview-people-location.tsx          ← Overview, People Mgmt, Location tabs
    │   │   │   ├── s2-child-elder.tsx                       ← School Safety, Health/Elderly (real DB)
    │   │   │   ├── s3-driving-ai.tsx                        ← Driving Safety, AI Center (real DB)
    │   │   │   ├── s4-comms-devices-business-enterprise.tsx ← Comms, Devices, Business, Enterprise
    │   │   │   ├── s5-intelligence-platform.tsx             ← Analytics, Support, Security, Config (real DB)
    │   │   │   └── SUPER_ADMIN_GUIDE.md                     ← Full tab guide (what each does + how to use)
    │   │   └── effects/
    │   │       ├── AIAssistant.tsx
    │   │       ├── ParticleField.tsx
    │   │       └── SOSButton.tsx
    │   ├── lib/
    │   │   ├── api.ts                ← Typed API client (all endpoints)
    │   │   ├── auth.ts               ← Auth utils (setAuth, getUser, getRoleRedirect)
    │   │   ├── useAuth.ts            ← useAuth() React hook
    │   │   ├── useAdminData.ts       ← React hooks for admin data
    │   │   ├── mapData.ts            ← MAP_MEMBERS with randomuser.me portrait photos
    │   │   ├── animations.ts
    │   │   ├── constants.ts
    │   │   └── utils.ts
    │   ├── public/
    │   │   ├── favicon.svg           ← Gold G logo favicon
    │   │   ├── logo.svg              ← Full wordmark
    │   │   ├── og-image.svg          ← 1200×630 social share image
    │   │   └── manifest.json         ← PWA manifest
    │   ├── .env.local
    │   ├── next.config.js
    │   ├── tailwind.config.ts
    │   └── package.json
    │
    └── backend/                      ← FastAPI backend
        ├── main.py                   ← App entry, all routers registered
        ├── database.py               ← SQLAlchemy engine + SessionLocal
        ├── models.py                 ← All 21 ORM table models (incl. Feedback, ContactRequest, AppSetting)
        ├── auth.py                   ← JWT + bcrypt utilities
        ├── seed.py                   ← Database seeding script
        ├── .env                      ← DATABASE_URL, SECRET_KEY, etc.
        ├── gravity.db                ← SQLite database file
        ├── requirements.txt
        ├── venv/                     ← Python virtual environment
        └── routers/
            ├── auth.py               ← /auth/* user + unified login
            ├── admin_router.py       ← /admin-api/* admin CRUD + password change
            ├── admin_data_router.py  ← /admin-api/* 17 real-data endpoints (NEW)
            ├── families.py           ← /families/* family circles (is_online via GPS recency)
            ├── devices.py            ← /devices/* device management
            ├── location.py           ← /location/* GPS tracking
            ├── geofences.py          ← /geofences/* safe zones
            ├── sos_router.py         ← /sos/* emergency alerts
            ├── check_ins.py          ← /check-ins/* check-in system
            ├── journeys.py           ← /journeys/* route sharing
            ├── chat.py               ← /chat/* family messaging
            ├── driving.py            ← /driving/* driving safety + member score
            ├── health.py             ← /health/* health tracking
            ├── notifications.py      ← /notifications/* push alerts
            ├── plans.py              ← /plans/* subscription billing
            └── ai.py                 ← /ai/* Anthropic AI chat
```

---

## 4. FRONTEND — PUBLIC WEBSITE

### Homepage Sections (in order)

| Section | Component | Features |
|---|---|---|
| Hero | `HeroSection.tsx` | Background image slider (4 slides), auto-advance 5s, Ken Burns zoom, dot nav |
| Stats | `StatsSection.tsx` | 4 animated stat cards with SVG progress rings |
| Features | `FeaturesSection.tsx` | 15 feature cards in CSS bento grid (SOS wide, Map extra-wide) |
| Live Map Demo | `LiveMapDemoSection.tsx` | Leaflet map with 5 family pins using randomuser.me photos |
| How It Works | `HowItWorksSection.tsx` | 4-step process with animations |
| Parent / Child | `ParentChildSection.tsx` | Phone mockup with Parent/Child tab switcher |
| Elderly Care | `ElderlyCareSection.tsx` | Senior-focused features |
| Testimonials | `TestimonialsSection.tsx` | Customer reviews |
| Pricing | `PricingSection.tsx` | 3 plans with monthly/annual toggle |
| Download CTA | `DownloadCTA.tsx` | App store download buttons |

### Feature Cards (FeaturesSection — 15 features)
1. Emergency SOS (wide card — red accent)
2. Live Family Map (tall card — blue, animated radar)
3. Smart Alerts (geofence)
4. Safe Check-in
5. Route Sharing
6. Location History
7. Ghost Mode
8. Battery Alerts
9. Activity Status
10. AI Insights
11. Wellness Check
12. Med Reminders
13. Family Chat (indigo)
14. Driving Safety (sky blue)
15. Family Moments (pink)

---

## 5. FRONTEND — ROLE-BASED DASHBOARDS

All dashboards share one login page (`/login`) but redirect to separate panels based on role.

### Login Page (`/login`)
- **File:** `app/login/page.tsx`
- **Tabs:** Email | Phone OTP | Social (Google + Apple)
- **Background:** StarfieldCanvas + FloatingOrb effects
- **On success:** Calls `setAuth()` → sets localStorage + cookies → redirects via `getRoleRedirect(role)`
- **Endpoint:** `POST /auth/login/unified`

### Role → Route Mapping

| Role | Dashboard URL | Accent Color |
|---|---|---|
| `user` | `/dashboard` | Gold `#D4A853` |
| `moderator` | `/moderator` | Amber `#F59E0B` |
| `admin` | `/admin` | Blue `#3B82F6` |
| `super_admin` | `/super-admin` | Purple `#8B5CF6` |

### Family Roles (FamilyMember.role)
| Role | Meaning |
|---|---|
| `owner` | Family creator — treated as "parent" in UI |
| `parent` | Non-owner adult family member |
| `child` | Child/minor in the family |
| ~~`member`~~ | **Removed** — legacy records fall back to "parent" in `_get_family_role()` |

> New joins from `/dashboard` use `role: 'parent'`. New joins from `/choose-dashboard` use `role: 'child'`.

### User Dashboard (`/dashboard`)
- **File:** `app/dashboard/page.tsx`
- **Design:** Premium dark glass UI — deep navy `#050D1A` background, gold accents
- **Layout:**
  - **Header:** Gold G logo, "All Safe" pulsing pill, notification bell, user avatar
  - **Left:** Leaflet map (Carto Voyager tiles, 420px height) + active member overlay + horizontal member strip
  - **Right panel (300px):** 3 gold pill tabs — Family / Alerts / Profile
- **Family Tab:** 5 expandable member cards (color-coded glow, live pulse dot, mini stat grid, journey timeline, Call/SOS/Map buttons)
- **Alerts Tab:** Color-coded severity alerts (safe/warning/sos/info) with left accent bar, dismissable
- **Profile Tab:** Gold user identity card, 4 toggle settings, sign out button
- **Mobile:** Bottom tab bar with gold active underline, Map/Family/Alerts/Profile

### Parent Dashboard (`/parent`)
- **File:** `app/parent/page.tsx` + `components/parent/ParentMonitor.tsx`
- **Data:** 100% real API data — no dummy members
- **Tabs:** Live Map / Children / Elderly / Driving Safety
- **Children Tab:** Real family members from `/families/{id}/members`, expandable cards with live GPS, battery, online status
- **Elderly Tab:** Real members + "Connect Gravity Watch" prompt (no fake HR/BP)
- **Driving Safety Tab:** Full implementation — ScoreRing, trip history, events from `/driving/member/{user_id}`
- **Online detection:** Based on location recency (`recorded_at < 30 min`) not device table
- **Data fetch pattern:**
  ```typescript
  const famRes = await fetch('/families/my', { headers })
  const famsArr = Array.isArray(famData) ? famData : [famData]
  const fid = famsArr[0].id
  const members = await fetch(`/families/${fid}/members`, { headers })
  ```

### Child Dashboard (`/child`)
- **File:** `app/child/page.tsx` + `components/child/ChildHome.tsx`
- **Design:** Dark theme `#0B0D13`, animated safety bubble, pulse rings, floating sparkles
- **All data is real — no hardcoded values:**
  - Greeting: Time-based (Good Morning / Afternoon / Evening)
  - Family avatars: Real member names + initials from `/families/{id}/members`
  - Last location: Real GPS `last_location` from API
  - Geofences: Real count from `/geofences/family/{id}`
  - SOS alerts: Real from `/sos/history/{family_id}`
  - Battery: Real from live family locations
  - Family online count: Real from `/location/live/{family_id}`
- **Tabs (bottom nav):** Home / Safety / School / Health
- **More drawer:** Achievements / Family Chat / Family Radar / My Location / Settings
- **Quick Actions:** Check In Now / Message Family / I'm Safe
- **No fake data:** Heart rate removed (no device), safety score shows `—` until computed

### Moderator Panel (`/moderator`)
- **File:** `app/moderator/page.tsx`
- **Accent:** Amber `#F59E0B`
- **Sections:** Overview / Tickets / Reports / Content / Announcements / Analytics

### Super Admin Panel (`/super-admin`)
- **File:** `app/super-admin/page.tsx` + `components/super-admin/s1–s5.tsx`
- **Accent:** Purple `#8B5CF6`, crown icon
- **19 sidebar categories, 100+ sections** — split across 5 component files (s1–s5)
- **Hero stats:** 2.8M users, ₹48.7L MRR, 99.97% uptime
- **Real DB data in:** Location History, Login Activity, SOS Alerts, Driving Events, Driver Scores, Medications, Wellness Reports, School Management, Family Chat (messages summary), Payments, Security Logs, Audit Logs, Threat Detection, Notifications, Feedback, Contact Requests, all Settings (SMTP/SMS/Push/Maps/AI/Platform)
- **Password change:** All Users tab → Key icon → POST `/admin-api/users/{id}/change-password`
- **Full guide:** `components/super-admin/SUPER_ADMIN_GUIDE.md`
- **Categories:** Overview, People Management, Location, Safety & Emergency, School Safety, Health & Elderly, Driving Safety, AI Center, Communications, Devices & IoT, Business, Enterprise, Intelligence/Analytics, Support, Security, Administration, Developer Hub, System Monitoring, Configuration

### Middleware (Route Protection)
- **File:** `middleware.ts`
- **Protected routes:**
```
/super-admin  → requires: super_admin
/admin        → requires: admin, super_admin
/moderator    → requires: moderator, admin, super_admin
/dashboard    → requires: user, moderator, admin, super_admin
/parent       → requires: user, moderator, admin, super_admin
/child        → requires: user, moderator, admin, super_admin
```
- **Unauthenticated:** redirects → `/login?next=<path>`
- **Wrong role:** redirects → `getRoleRedirect(role)` (their own dashboard)
- **Cookies read:** `gv_token` (auth check), `gv_user` (role check)

---

## 6. FRONTEND — ADMIN PANEL

**Base Route:** `/admin`
**Auth:** JWT token stored in `localStorage.gravity_admin_token`
**Auth Check:** On every page load via `app/admin/layout.tsx`
**Unauthenticated redirect:** → `/admin/login`

### Admin Pages (17 total)

| Route | Page | API Connected |
|---|---|---|
| `/admin/login` | Login | ✅ Real JWT via `/admin-api/login` |
| `/admin` | Dashboard | ✅ Real stats from DB |
| `/admin/families` | Families | ✅ Real family list |
| `/admin/devices` | Devices | ✅ Real device data + battery |
| `/admin/locations` | Live Locations | Simulated map UI |
| `/admin/geofences` | Geofences | ✅ Real trigger events |
| `/admin/alerts` | SOS Alerts | ✅ Real active/resolved alerts |
| `/admin/check-ins` | Check-Ins | ✅ Stats from DB |
| `/admin/journeys` | Journeys | ✅ Active journeys from DB |
| `/admin/family-chat` | Family Chat | ✅ Chat stats |
| `/admin/driving-safety` | Driving Safety | ✅ Real driving events |
| `/admin/health` | Health | ✅ Health stats from DB |
| `/admin/elderly-care` | Elderly Care | Enriched UI |
| `/admin/analytics` | Analytics | ✅ Real user/device counts |
| `/admin/notifications` | Notifications | ✅ Real + send API |
| `/admin/plans` | Plans & Revenue | ✅ Real MRR/plan stats |
| `/admin/settings` | Settings | Team, API keys, security tabs |

---

## 7. BACKEND API

### Server
- **Framework:** FastAPI 0.111.0
- **Server:** Uvicorn (ASGI)
- **Port:** 8000 (local) / 8001 (VPS PM2)
- **Database:** SQLite (`gravity.db`) via SQLAlchemy 2.0
- **Docs:** http://localhost:8000/docs (Swagger UI)
- **CORS:** Allows all origins (configured in main.py)

### Router Modules (16 routers)

| Module | Prefix | Purpose |
|---|---|---|
| `admin_router.py` | `/admin-api` | Admin dashboard, users (CRUD + password change), families, devices, SOS, analytics |
| `admin_data_router.py` | `/admin-api` | 17 real-data endpoints — location, driving, health, school, security logs, settings, feedback, contact requests |
| `auth.py` | `/auth` | User register, login, unified login, profile |
| `families.py` | `/families` | Family circle CRUD, invite codes, online detection via GPS recency |
| `devices.py` | `/devices` | Device registration, battery updates |
| `location.py` | `/location` | GPS updates, history, live family view |
| `geofences.py` | `/geofences` | Zone CRUD, entry/exit event logging |
| `sos_router.py` | `/sos` | Trigger alerts, resolve, history |
| `check_ins.py` | `/check-ins` | Schedule, complete, stats |
| `journeys.py` | `/journeys` | Start, track, complete route sharing |
| `chat.py` | `/chat` | Send messages, fetch history, moderation |
| `driving.py` | `/driving` | Log incidents, member driving score, stats |
| `health.py` | `/health` | Daily records, medication reminders |
| `notifications.py` | `/notifications` | Send push notifications, history |
| `plans.py` | `/plans` | Subscription management, MRR stats |
| `ai.py` | `/ai` | Anthropic AI chat assistant |

### Key Backend Logic

**`families.py` — `is_online` detection:**
```python
# Online = location shared within last 30 minutes
is_online = False
if loc and loc.recorded_at:
    rec = loc.recorded_at if loc.recorded_at.tzinfo else loc.recorded_at.replace(tzinfo=timezone.utc)
    is_online = (datetime.now(timezone.utc) - rec).total_seconds() < 1800
elif device:
    is_online = device.is_online
```

---

## 8. DATABASE — ALL TABLES

Database file: `backend/gravity.db` (SQLite)

### Table 1: users
| Column | Type | Description |
|---|---|---|
| id | Integer PK | Auto increment |
| email | String UNIQUE | Login email |
| phone | String | Phone number |
| name | String | Display name |
| avatar_url | String | Profile photo URL |
| password_hash | String | bcrypt hashed password |
| role | VARCHAR DEFAULT 'user' | user / moderator (added via ALTER TABLE) |
| is_active | Boolean | Account status |
| created_at | DateTime | Registration timestamp |
| updated_at | DateTime | Last update |

> **Note:** `role` column was added via migration: `ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'`

### Table 2: families
| Column | Type | Description |
|---|---|---|
| id | Integer PK | Auto increment |
| name | String | Family circle name |
| owner_id | FK → users | Family creator |
| invite_code | String UNIQUE | 6-char join code |
| plan | String | free / premium / family |
| created_at | DateTime | Creation timestamp |

### Table 3: family_members
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| family_id | FK → families | Which family |
| user_id | FK → users | Which user |
| role | String | owner / child / parent (`member` removed — legacy records still work via fallback) |
| joined_at | DateTime | When joined |

### Table 4: admin_users
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| email | String UNIQUE | Admin login email |
| password_hash | String | bcrypt hashed |
| name | String | Admin name |
| role | String | admin / super_admin / moderator / viewer |
| is_active | Boolean | Account status |
| created_at | DateTime | |
| last_login | DateTime | Last login timestamp |

### Table 5: devices
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | Device owner |
| device_name | String | e.g. "iPhone 14 Pro" |
| os | String | ios / android |
| os_version | String | e.g. "17.2" |
| app_version | String | e.g. "2.4.1" |
| battery_level | Integer | 0–100 |
| is_online | Boolean | Currently online (fallback only) |
| push_token | String | FCM/APNs token |
| last_seen | DateTime | Last heartbeat |
| registered_at | DateTime | When registered |

### Table 6: locations
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | |
| device_id | FK → devices | Which device sent location |
| lat | Float | Latitude |
| lng | Float | Longitude |
| accuracy | Float | GPS accuracy in meters |
| speed | Float | Speed in km/h |
| place_name | String | Reverse-geocoded name |
| recorded_at | DateTime | When captured — used for `is_online` check |

### Table 7: geofences
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| family_id | FK → families | |
| name | String | Zone name (e.g. "Home") |
| type | String | home / school / work / custom |
| center_lat | Float | Zone center latitude |
| center_lng | Float | Zone center longitude |
| radius_meters | Float | Zone radius |
| color | String | Hex color for map display |
| alert_on_enter | Boolean | Notify on entry |
| alert_on_exit | Boolean | Notify on exit |
| is_active | Boolean | Zone enabled |
| created_at | DateTime | |

### Table 8: geofence_events
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| geofence_id | FK → geofences | |
| user_id | FK → users | Who triggered |
| event_type | String | enter / exit |
| lat | Float | Location at trigger |
| lng | Float | |
| occurred_at | DateTime | When triggered |

### Table 9: sos_alerts
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | Who triggered SOS |
| family_id | FK → families | |
| lat | Float | Emergency location |
| lng | Float | |
| place_name | String | Location name |
| message | Text | Optional message |
| status | String | active / resolved / false_alarm |
| triggered_at | DateTime | When SOS was triggered |
| resolved_at | DateTime | When marked safe |
| resolved_by | String | Who resolved it |

### Table 10: check_in_rules
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| family_id | FK → families | |
| name | String | Rule name (e.g. "School Drop-off") |
| frequency | String | daily / weekdays / weekends |
| time_of_day | String | e.g. "08:30" |
| auto_remind | Boolean | Send reminder before |
| remind_minutes_before | Integer | How early to remind |
| is_active | Boolean | Rule enabled |
| created_at | DateTime | |

### Table 11: check_in_events
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | Who checked in |
| family_id | FK → families | |
| rule_id | FK → check_in_rules | Which rule |
| scheduled_at | DateTime | When expected |
| completed_at | DateTime | When completed |
| status | String | pending / completed / missed / late |
| place_name | String | Check-in location |
| notes | Text | Optional note |

### Table 12: journeys
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | Who is travelling |
| from_location | String | Origin name |
| to_location | String | Destination name |
| from_lat/lng | Float | Origin coordinates |
| to_lat/lng | Float | Destination coordinates |
| started_at | DateTime | Journey start |
| arrived_at | DateTime | Journey end |
| distance_km | Float | Total distance |
| status | String | active / completed / cancelled |

### Table 13: journey_points
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| journey_id | FK → journeys | |
| lat | Float | GPS point |
| lng | Float | |
| speed | Float | Speed at this point |
| recorded_at | DateTime | Timestamp |

### Table 14: messages
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| family_id | FK → families | |
| sender_id | FK → users | |
| content | Text | Message text |
| media_url | String | Photo/video URL |
| type | String | text / image / video / voice / location |
| is_reported | Boolean | Flagged for review |
| sent_at | DateTime | |

### Table 15: driving_events
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | |
| journey_id | FK → journeys | |
| type | String | speeding / phone_use / harsh_brake / rapid_accel |
| lat | Float | Where it happened |
| lng | Float | |
| speed | Float | Speed at event |
| severity | String | low / medium / high |
| occurred_at | DateTime | |
| resolved | Boolean | Admin reviewed |

### Table 16: health_records
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | |
| date | String | YYYY-MM-DD |
| steps | Integer | Daily step count |
| sleep_hours | Float | Hours slept |
| heart_rate | Integer | BPM |
| calories | Integer | Calories burned |
| water_ml | Integer | Water intake ml |
| active_minutes | Integer | Exercise minutes |
| created_at | DateTime | |

### Table 17: medication_reminders
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | |
| medication_name | String | Drug name |
| dosage | String | e.g. "500mg" |
| times | JSON | Array e.g. ["08:00", "20:00"] |
| start_date | String | YYYY-MM-DD |
| is_active | Boolean | Reminder enabled |
| last_taken | DateTime | Last acknowledgment |
| created_at | DateTime | |

### Table 18: subscriptions
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| family_id | FK → families UNIQUE | One plan per family |
| plan | String | free / premium / family |
| price_inr | Integer | Monthly price in INR |
| started_at | DateTime | Subscription start |
| expires_at | DateTime | Renewal date |
| status | String | active / expired / cancelled |
| payment_method | String | upi / credit_card / debit_card |

### Table 19: notifications
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | Specific user (optional) |
| family_id | FK → families | Specific family (optional) |
| title | String | Notification title |
| body | Text | Notification body |
| type | String | info / feature / alert / tip |
| target | String | all / premium / android / ios |
| sent_count | Integer | Total sent |
| delivered_count | Integer | Total delivered |
| opened_count | Integer | Total opened |
| sent_at | DateTime | |
| read_at | DateTime | |

### Table 20: feedbacks *(NEW)*
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| user_id | FK → users | Who submitted (optional) |
| name | String | Submitter name |
| email | String | Submitter email |
| rating | Integer | 1–5 star rating |
| category | String | app / support / feature / other |
| message | Text | Feedback message |
| status | String | new / reviewed / actioned |
| created_at | DateTime | |

### Table 21: contact_requests *(NEW)*
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| name | String | Contact person name |
| email | String | Contact email |
| phone | String | Contact phone |
| subject | String | Subject line |
| message | Text | Message body |
| status | String | new / in_progress / closed |
| created_at | DateTime | |

### Table 22: app_settings *(NEW)*
| Column | Type | Description |
|---|---|---|
| id | Integer PK | |
| key | String UNIQUE | Setting key (e.g. `smtp_host`, `fcm_key`, `openai_key`) |
| value | Text | Setting value |
| updated_at | DateTime | Last saved timestamp |

> **Used by:** SMTP, SMS Gateway, Push Notifications, Maps API, AI Settings, Platform Config tabs in Super Admin → Configuration section. Save = upsert by key.

---

## 9. API ENDPOINTS — COMPLETE LIST

### Admin API (`/admin-api`)

**Core admin endpoints (admin_router.py):**
```
POST   /admin-api/login                         Admin login → JWT token
GET    /admin-api/dashboard                     Dashboard stats (families, devices, SOS, MRR)
GET    /admin-api/users                         All users (paginated, search, role filter)
PATCH  /admin-api/users/{id}                    Update user (name, email, phone, role, status)
POST   /admin-api/users/{id}/change-password    Change user password (min 6 chars)
DELETE /admin-api/users/{id}                    Delete user permanently
POST   /admin-api/users                         Create new user
GET    /admin-api/families                      List all families (paginated, filter by plan)
PATCH  /admin-api/families/{id}/role            Change family member role (child/parent/owner)
GET    /admin-api/devices                       List all devices (filter: online/offline/low_battery)
GET    /admin-api/sos-alerts                    List SOS alerts (filter by status)
PATCH  /admin-api/sos-alerts/{id}/resolve       Resolve an alert
GET    /admin-api/notifications                 List all notifications
POST   /admin-api/notifications/send            Send a broadcast notification
GET    /admin-api/analytics                     Analytics overview data
```

**Real data endpoints (admin_data_router.py) — all require admin/super_admin JWT:**
```
GET    /admin-api/location-history              Location records JOIN User
GET    /admin-api/login-activity                SecurityLog WHERE event_type IN (login/logout/login_failed)
GET    /admin-api/notifications-list            All Notification records
GET    /admin-api/driving-events-list           DrivingEvent JOIN User (severity filter optional)
GET    /admin-api/health-records-list           HealthRecord JOIN User
GET    /admin-api/medications-list              MedicationReminder JOIN User
GET    /admin-api/messages-summary              Messages grouped by family_id JOIN Family
GET    /admin-api/payments-list                 Payment JOIN User
GET    /admin-api/security-logs-list            SecurityLog (?severity=high for threat detection)
GET    /admin-api/audit-logs-list               AuditLog ordered by created_at desc
GET    /admin-api/schools-list                  SchoolInfo JOIN User
GET    /admin-api/analytics-summary             Aggregate counts (users/families/SOS/devices/subscriptions)
GET    /admin-api/feedback-list                 Feedback table
POST   /admin-api/feedback-list                 Update feedback status
GET    /admin-api/contact-requests-list         ContactRequest table
GET    /admin-api/settings-config               AppSetting key-value store (all settings)
POST   /admin-api/settings-config               Upsert AppSetting by key
```

### User Auth (`/auth`)
```
POST   /auth/register          Register new user
POST   /auth/login             Login (form-data) → JWT
POST   /auth/login/json        Login (JSON body) → JWT
POST   /auth/login/unified     Unified login — checks users table first, then admin_users
                               Returns: { access_token, token_type, user: { ...fields, role } }
GET    /auth/me                Get current user profile
```

**Unified Login Logic (`/auth/login/unified`):**
1. Check `users` table → role from `users.role` field (user / moderator)
2. Fallback → check `admin_users` table → role from `admin_users.role` (admin / super_admin)
3. Returns `role` in response, which frontend uses for redirect

### Families (`/families`)
```
POST   /families/create           Create new family circle
POST   /families/join/{code}      Join via invite code
GET    /families/my               My family memberships → returns ARRAY (use famsArr[0].id)
GET    /families/{id}/members     Members of a family
                                  Returns: [{ user_id, name, role, last_location, lat, lng, battery, is_online }]
```

> **Important:** `/families/my` always returns an **array**. Always use `Array.isArray(data) ? data : [data]` pattern.

### Devices (`/devices`)
```
POST   /devices/register          Register a new device
PATCH  /devices/{id}/battery      Update battery level + online status
GET    /devices/my                My registered devices
DELETE /devices/{id}              Remove/revoke a device
```

### Location (`/location`)
```
POST   /location/update            Update current GPS location
GET    /location/history/{user_id} Location history (last N points)
GET    /location/live/{family_id}  Live locations of all family members
```

### Geofences (`/geofences`)
```
POST   /geofences/              Create a new geofence zone
GET    /geofences/family/{id}   Get all zones for a family → returns array
POST   /geofences/event         Log an entry/exit event
GET    /geofences/events        Get recent geofence events
DELETE /geofences/{id}          Delete a zone
```

### SOS Alerts (`/sos`)
```
POST   /sos/trigger              Trigger emergency SOS
GET    /sos/active               Get all active alerts
PATCH  /sos/{id}/resolve         Mark alert as resolved
GET    /sos/history/{family_id}  SOS history for a family → returns array
GET    /sos/family/{family_id}   Alias for SOS history (used by child dashboard)
```

### Check-Ins (`/check-ins`)
```
POST   /check-ins/                  Schedule a check-in
PATCH  /check-ins/{id}/complete     Mark as completed
GET    /check-ins/family/{id}       Family check-in history
GET    /check-ins/stats             Aggregate stats
```

### Journeys (`/journeys`)
```
POST   /journeys/start          Start a new journey (notifies family)
POST   /journeys/point          Add GPS point to active journey
PATCH  /journeys/{id}/complete  Mark journey complete (safe arrival)
GET    /journeys/active         All active journeys
GET    /journeys/stats          Journey aggregate stats
```

### Family Chat (`/chat`)
```
POST   /chat/send                Send a message to family
GET    /chat/family/{id}         Get message history for family
POST   /chat/{id}/report         Report a message
DELETE /chat/{id}                Delete a message (admin)
GET    /chat/stats               Chat usage stats
```

### Driving Safety (`/driving`)
```
POST   /driving/event              Log a driving incident (speeding/phone/brake/rapid_accel)
GET    /driving/events             List recent incidents
GET    /driving/stats              Driving safety statistics
GET    /driving/member/{user_id}   Member-specific driving score + trip history
                                   Returns: { score, total_trips, total_km, harsh_brakes,
                                             speeding, phone_use, journeys[], recent_events[] }
                                   score = null if no trips; else 100 - penalties
```

### Health (`/health`)
```
POST   /health/record             Save daily health record
GET    /health/records/{user_id}  Get health history
POST   /health/medication         Add medication reminder
GET    /health/medications/{id}   Get user's medications
GET    /health/stats              Health tracking statistics
```

### Notifications (`/notifications`)
```
POST   /notifications/send   Queue a push notification
GET    /notifications/        List sent notifications
GET    /notifications/stats   Delivery/open rate stats
```

### Plans (`/plans`)
```
GET    /plans/           List all available plans
POST   /plans/subscribe  Subscribe/upgrade family plan
GET    /plans/stats      Revenue and plan distribution stats
```

### AI (`/ai`)
```
POST   /ai/chat          AI safety assistant chat (Anthropic Claude)
POST   /ai/routine       AI routine check analysis
```

---

## 10. AUTHENTICATION SYSTEM

### Unified Auth Flow (Current)

```
1. POST /auth/login/unified { email, password }
   ↓
2. Backend: check users table → fallback admin_users
   ↓
3. Response: { access_token, user: { id, name, email, role, ... } }
   ↓
4. Frontend: setAuth(token, user)
   → localStorage: gv_token, gv_user
   → cookies: gv_token (7 days), gv_user (7 days)
   ↓
5. getRoleRedirect(role) → /dashboard | /moderator | /admin | /super-admin
   ↓
6. middleware.ts: reads gv_token + gv_user cookies on every protected route
   → wrong role → redirected to correct dashboard
```

### Auth Library (`lib/auth.ts`)

```typescript
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'

export interface AuthUser {
  id: number; name: string; email: string
  phone?: string; role: UserRole; is_active: boolean
}

export function setAuth(token: string, user: AuthUser): void  // localStorage + cookies
export function getToken(): string | null
export function getUser(): AuthUser | null
export function getRole(): UserRole | null
export function clearAuth(): void
export function isAuthenticated(): boolean
export function getRoleRedirect(role: UserRole): string
// user→/dashboard, moderator→/moderator, admin→/admin, super_admin→/super-admin
```

### useAuth Hook (`lib/useAuth.ts`)

```typescript
const { user, role, isAuthenticated, logout } = useAuth()
// Hydrates from localStorage on mount
// logout(): clearAuth() + clear cookies + router.push('/login')
```

### Storage Keys
| Key | Storage | Purpose |
|---|---|---|
| `gv_token` | localStorage + cookie | JWT token |
| `gv_user` | localStorage + cookie | JSON stringified AuthUser |
| `gravity_admin_token` | localStorage | Legacy admin panel token |

### Cookie Config
- `gv_token`: `max-age=604800` (7 days), `path=/`, `SameSite=Lax`
- `gv_user`: same, stores URL-encoded JSON of AuthUser

---

## 11. FRONTEND API CLIENT

File: `frontend/lib/api.ts`

All API calls go through a central typed client with automatic token injection.

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

import { adminApi, authApi, familiesApi, sosApi } from '@/lib/api'

const result = await adminApi.login(email, password)
const stats  = await adminApi.dashboard()
const { families } = await adminApi.families(0, 20, 'premium')
await sosApi.trigger(familyId, lat, lng, placeName)
await chatApi.send(familyId, "I'm safe!")
await healthApi.saveRecord({ date: "2025-06-12", steps: 8000, sleep_hours: 7.5 })
```

### Available API Modules
| Module | Endpoints |
|---|---|
| `adminApi` | login, dashboard, families, devices, sosAlerts, resolveSOS, notifications, analytics |
| `authApi` | register, login, me |
| `familiesApi` | create, join, my, members |
| `devicesApi` | register, updateBattery, my, revoke |
| `locationApi` | update, history, liveFamilyLocations |
| `geofencesApi` | create, family, logEvent, events |
| `sosApi` | trigger, active, resolve, history |
| `chatApi` | send, messages, report, delete, stats |
| `healthApi` | saveRecord, records, addMedication, medications, stats |
| `journeysApi` | start, addPoint, complete, active, stats |
| `plansApi` | list, subscribe, stats |
| `drivingApi` | logEvent, events, stats, memberScore |

---

## 12. DESIGN SYSTEM

### CSS Variables (globals.css)

**Dark Mode (default):**
```css
--bg:           #0B0D13   /* Page background */
--bg-surface:   #13161F   /* Cards, sidebar */
--bg-surface2:  #1A1D28   /* Elevated surfaces */
--bg-surface3:  #212535   /* Highest elevation */
--text-primary: #F1EDE4   /* Main text */
--text-secondary:#A89B84  /* Secondary text */
--text-muted:   #6B7280   /* Muted/hint */
--gold:         #D4A853   /* Brand accent */
--gold-rgb:     212,168,83
--border:       rgba(255,255,255,0.07)
--primary:      #4B80F0   /* Blue */
--safe:         #10B981   /* Green */
--sos:          #EF4444   /* Red emergency */
```

**Dashboard Premium Palette:**
```css
background:  #050D1A → #080F20 → #060C18  (gradient)
gold:        #D4A853  (logo, active tabs, toggles)
emerald:     #10B981  (safe status, live indicators)
glass card:  rgba(8,16,32,0.85) + backdrop-blur(24px)
```

**Light Mode:**
```css
--bg:    #F9F7F4
--gold:  #B8720A
--primary: #1A56DB
--safe:  #047857
```

### Map — Tile Layer
- **Provider:** Carto Voyager (colorful, roads clearly visible)
- **URL:** `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`
- **Attribution:** CartoDB + OpenStreetMap

### Map Members (`lib/mapData.ts`)

Live demo map uses 5 family members with randomuser.me portrait photos:

```typescript
type VehicleType = 'car' | 'bus' | 'walk' | 'bike' | 'auto' | 'tempo'
type Gender = 'male' | 'female'

// Photos use randomuser.me (NOT Unsplash — Unsplash caused 404s):
Mom     → women/44.jpg — walk, blue   (#3B82F6), female
Dad     → men/32.jpg   — car,  green  (#10B981), male
Priya   → women/22.jpg — bus,  amber  (#F59E0B), female
Anya    → women/18.jpg — auto, purple (#8B5CF6), female  ← use women/ NOT girls/
Grandpa → men/70.jpg   — tempo, red  (#EF4444), male
```

> **Important:** `randomuser.me/api/portraits/girls/` and `/boys/` do NOT exist (404). Use `women/` and `men/` only.

> **Important:** `MapView` requires `members` prop explicitly passed:
> `<MapView activeId={activeId} onMemberClick={handlePin} members={MAP_MEMBERS} />`

### Key CSS Utility Classes
```css
.gradient-text-gold    /* Gold gradient text */
.btn-gold              /* Gold CTA button */
.glass                 /* Glassmorphism effect */
.card-surface          /* Standard card style */
```

### Animation Patterns (Framer Motion)
- Page entrance: `initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}`
- Hover lift: `whileHover={{ y: -4, scale: 1.02 }}`
- Stagger children: `transition={{ delay: index * 0.07 }}`
- Spring toggle: `type:'spring', stiffness:500, damping:30`
- Live pulse: `animate={{ scale:[1,1.4,1], opacity:[1,0.4,1] }} repeat:Infinity`

---

## 13. HOW TO RUN — LOCAL

### First Time Setup
```bash
# 1. Install backend dependencies
cd "website/backend"
python3 -m venv venv
venv/bin/pip install -r requirements.txt

# 2. Seed database with mock data
venv/bin/python3 seed.py

# 3. Add role column if missing (run once)
sqlite3 gravity.db "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';"

# 4. Install frontend dependencies
cd "../frontend"
npm install
```

### Start Servers (Every Time)
```bash
# Terminal 1 — Backend (port 8000)
cd "website/backend"
venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend (port 3000)
cd "website/frontend"
npm run dev
```

### Environment Files

**`backend/.env`**
```
DATABASE_URL=sqlite:///./gravity.db
SECRET_KEY=gravity-super-secret-key-trackalways-2025-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=http://localhost:3020,http://localhost:3000
ANTHROPIC_API_KEY=<your-key-here>
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
INTERNAL_API_URL=http://127.0.0.1:8000       ← IMPORTANT: used by next.config.js rewrites
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_tXD8cP6NSHvKbR
```

> **Note:** `INTERNAL_API_URL` must be set. The `next.config.js` rewrites default to `INTERNAL_API_URL || 'http://127.0.0.1:8001'`. On VPS it should be `http://127.0.0.1:8001`.

### Reset Database
```bash
cd "website/backend"
rm gravity.db
venv/bin/python3 seed.py
sqlite3 gravity.db "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';"
```

---

## 14. VPS DEPLOYMENT

### Server Info
| Field | Value |
|---|---|
| Provider | Hostinger VPS |
| OS | Ubuntu |
| Project path | `/var/www/gravity/` |
| Frontend port | **3100** (PM2: `gravity-frontend`) |
| Backend port | **8001** (PM2: `gravity-backend`) |
| Live domain | https://gravity.kvlbusinessssolutions.com |
| Git repo | https://github.com/kamaralam1984/GRAVITY |

> **IMPORTANT:** Other projects on the same VPS — DO NOT TOUCH:
> `8rupiya`, `aapkaplot`, `kvl-*`, `restro-*`, `vidyt`

### PM2 Processes
```
id 50 → gravity-backend    (port 8001)
id 51 → gravity-frontend   (port 3100)
```

### Deploy Command (run on VPS)
```bash
cd /var/www/gravity && git pull origin main && cd website/frontend && npm run build && pm2 restart gravity-frontend
```

### Deploy with Backend Restart
```bash
cd /var/www/gravity && git pull origin main
cd website/frontend && npm run build && pm2 restart gravity-frontend
cd ../backend && pm2 restart gravity-backend
```

### VPS Environment (`frontend/.env.local` on VPS)
```
INTERNAL_API_URL=http://127.0.0.1:8001
NEXT_PUBLIC_API_URL=https://gravity.kvlbusinessssolutions.com
```

### next.config.js API Rewrites
All `/families/*`, `/auth/*`, `/location/*`, etc. API calls are rewritten:
```javascript
rewrites: () => [{
  source: '/:path*',
  destination: `${process.env.INTERNAL_API_URL || 'http://127.0.0.1:8001'}/:path*`
}]
```
This means frontend fetches `/families/my` and it proxies to backend automatically.

---

## 15. CREDENTIALS — ALL ROLES

### Unified Login URL
**Production:** https://gravity.kvlbusinessssolutions.com/login
**Local:** http://localhost:3000/login — all roles login here, auto-redirected to their panel

### Role-Based Credentials

| Role | Email | Password | Dashboard |
|---|---|---|---|
| `user` | priya.sharma@gmail.com | Password@123 | `/dashboard` |
| `moderator` | *(set manually in DB)* | *(set manually)* | `/moderator` |
| `admin` | kamaralamjdu@gmail.com | K12345678 | `/admin` |
| `super_admin` | kamaralamjdu@gmail.com | K12345678 | `/super-admin` |

> Admin/Super Admin credentials are in the `admin_users` table. User/Moderator credentials are in the `users` table (with `role` field).

### Legacy Admin Panel
| Field | Value |
|---|---|
| **Email** | kamaralamjdu@gmail.com |
| **Password** | K12345678 |
| **Role** | super_admin |
| **Login URL (prod)** | https://gravity.kvlbusinessssolutions.com/admin/login |
| **Login URL (local)** | http://localhost:3000/admin/login |

### Test User Credentials (seeded in `users` table)
| Name | Email | Password | Role |
|---|---|---|---|
| Priya Sharma | priya.sharma@gmail.com | Password@123 | user |
| Rahul Sharma | rahul.sharma@gmail.com | Password@123 | user |
| Rajesh Mehta | rajesh.mehta@gmail.com | Password@123 | user |
| Arjun Iyer | arjun.iyer@gmail.com | Password@123 | user |

---

## 16. SEED DATA

Running `seed.py` creates the following mock data:

| Entity | Count | Details |
|---|---|---|
| Admin Users | 1 | kamaralamjdu@gmail.com (super_admin) |
| App Users | 15 | Indian names, Gmail accounts |
| Families | 7 | Mix of Free/Premium/Family plans |
| Family Members | 15 | Linked to families |
| Devices | 10 | Mix of iOS/Android, battery levels |
| Locations | 10 | Indian cities (Mumbai, Delhi, Bangalore, etc.) |
| Geofences | 5 | Home, School, Office zones |
| SOS Alerts | 3 | 1 active, 2 resolved |
| Subscriptions | 7 | One per family |
| Check-in Rules | 3 | School drop-off, Work, Evening |
| Notifications | 3 | Feature announcements |

### Sample Cities in Seed Data
- Andheri East, Mumbai
- Connaught Place, Delhi
- Koramangala, Bangalore
- T. Nagar, Chennai
- Banjara Hills, Hyderabad
- Kothrud, Pune

### Subscription Plans
| Plan | Price | Features |
|---|---|---|
| Free | ₹0/month | 5 members, basic tracking, 7-day history |
| Premium | ₹299/month | 10 members, all features, 30-day history |
| Family Plus | ₹499/month | 25 members, all features, 90-day history, priority support |

---

## QUICK REFERENCE CHEAT SHEET

```
─── PRODUCTION (VPS) ─────────────────────────────────────────────
WEBSITE:       https://gravity.kvlbusinessssolutions.com
PARENT:        https://gravity.kvlbusinessssolutions.com/parent
CHILD:         https://gravity.kvlbusinessssolutions.com/child
SUPER ADMIN:   https://gravity.kvlbusinessssolutions.com/super-admin
LOGIN:         https://gravity.kvlbusinessssolutions.com/login
VPS PATH:      /var/www/gravity/
FRONTEND PORT: 3100 (PM2: gravity-frontend, id 51)
BACKEND PORT:  8001 (PM2: gravity-backend, id 50)

─── LOCAL DEV ────────────────────────────────────────────────────
WEBSITE:       http://localhost:3000
DASHBOARD:     http://localhost:3000/dashboard
PARENT:        http://localhost:3000/parent
CHILD:         http://localhost:3000/child
SUPER ADMIN:   http://localhost:3000/super-admin
LEGACY ADMIN:  http://localhost:3000/admin
LOGIN:         http://localhost:3000/login
API:           http://localhost:8000
API DOCS:      http://localhost:8000/docs

─── CREDENTIALS ──────────────────────────────────────────────────
User:     priya.sharma@gmail.com / Password@123
Admin:    kamaralamjdu@gmail.com / K12345678

─── DEPLOY TO VPS ────────────────────────────────────────────────
# Frontend only:
cd /var/www/gravity && git pull origin main && cd website/frontend && npm run build && pm2 restart gravity-frontend

# Frontend + Backend:
cd /var/www/gravity && git pull origin main
cd website/frontend && npm run build && pm2 restart gravity-frontend
cd ../backend && pm2 restart gravity-backend

─── START LOCAL ──────────────────────────────────────────────────
# Backend (port 8000)
cd website/backend && venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (port 3000)
cd website/frontend && npm run dev

─── RESET DATABASE ───────────────────────────────────────────────
cd website/backend
rm gravity.db && venv/bin/python3 seed.py
sqlite3 gravity.db "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';"

─── API TEST ─────────────────────────────────────────────────────
curl http://localhost:8000/
curl -X POST http://localhost:8000/auth/login/unified \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@gmail.com","password":"Password@123"}'
```

---

*Gravity — What Pulls You Together*
*© 2026 Trackalways Technologies Pvt Ltd*
