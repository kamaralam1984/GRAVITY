# GRAVITY — FULL SYSTEM DOCUMENTATION
### Trackalways Technologies Pvt Ltd
**Platform:** Family Safety App | **Version:** 2.0.0 | **Last Updated:** June 2025

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
13. [How to Run](#13-how-to-run)
14. [Credentials — All Roles](#14-credentials--all-roles)
15. [Seed Data](#15-seed-data)

---

## 1. PROJECT OVERVIEW

**Gravity** is a premium family safety platform by Trackalways Technologies. It allows families to stay connected through real-time location sharing, SOS emergency alerts, geofence zone management, health monitoring, driving safety, and family chat.

**Live URLs (Local Development)**
| Service | URL |
|---|---|
| Website | http://localhost:3020 |
| User Dashboard | http://localhost:3020/dashboard |
| Moderator Panel | http://localhost:3020/moderator |
| Super Admin Panel | http://localhost:3020/super-admin |
| Admin Panel (legacy) | http://localhost:3020/admin |
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
| SQLite | built-in | Database (dev) |
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
    │   ├── app/                      ← App Router pages
    │   │   ├── layout.tsx            ← Root layout + SEO metadata
    │   │   ├── page.tsx              ← Homepage
    │   │   ├── login/                ← Unified login (all roles)
    │   │   ├── dashboard/            ← User dashboard (premium)
    │   │   ├── moderator/            ← Moderator panel
    │   │   ├── super-admin/          ← Super Admin command center
    │   │   ├── parent/               ← Parent tracking dashboard
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
    │   │   │   ├── LiveMapDemoSection.tsx
    │   │   │   ├── HowItWorksSection.tsx
    │   │   │   ├── ElderlyCareSection.tsx
    │   │   │   ├── TestimonialsSection.tsx
    │   │   │   ├── PricingSection.tsx
    │   │   │   ├── DownloadCTA.tsx
    │   │   │   ├── MapView.tsx       ← Interactive Leaflet map (family pins + vehicles)
    │   │   │   └── ParentChildSection.tsx ← Homepage parent/child feature section
    │   │   └── effects/
    │   │       ├── AIAssistant.tsx
    │   │       ├── ParticleField.tsx
    │   │       └── SOSButton.tsx
    │   ├── lib/
    │   │   ├── api.ts                ← Typed API client (all endpoints)
    │   │   ├── auth.ts               ← Auth utils (setAuth, getUser, getRoleRedirect)
    │   │   ├── useAuth.ts            ← useAuth() React hook
    │   │   ├── useAdminData.ts       ← React hooks for admin data
    │   │   ├── mapData.ts            ← MAP_MEMBERS, VehicleType, Gender types
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
        ├── models.py                 ← All 18 ORM table models
        ├── auth.py                   ← JWT + bcrypt utilities
        ├── seed.py                   ← Database seeding script
        ├── .env                      ← DATABASE_URL, SECRET_KEY, etc.
        ├── gravity.db                ← SQLite database file
        ├── requirements.txt
        ├── venv/                     ← Python virtual environment
        └── routers/
            ├── auth.py               ← /auth/* user + unified login
            ├── admin_router.py       ← /admin-api/* admin endpoints
            ├── families.py           ← /families/* family circles
            ├── devices.py            ← /devices/* device management
            ├── location.py           ← /location/* GPS tracking
            ├── geofences.py          ← /geofences/* safe zones
            ├── sos_router.py         ← /sos/* emergency alerts
            ├── check_ins.py          ← /check-ins/* check-in system
            ├── journeys.py           ← /journeys/* route sharing
            ├── chat.py               ← /chat/* family messaging
            ├── driving.py            ← /driving/* driving safety
            ├── health.py             ← /health/* health tracking
            ├── notifications.py      ← /notifications/* push alerts
            ├── plans.py              ← /plans/* subscription billing
            └── ai.py                 ← /ai/* Anthropic AI chat
```

---

## 4. FRONTEND — PUBLIC WEBSITE

### Pages (17 total)

| Route | Page | Description |
|---|---|---|
| `/` | Homepage | Full landing page with all sections |
| `/about` | About Us | Team, mission, company values |
| `/features` | Features | All 15 features detailed |
| `/pricing` | Pricing | 3 plans, FAQs, regional pricing |
| `/live-tracking` | Live Tracking | GPS tracking feature page |
| `/geofencing` | Geofencing | Safe zones feature page |
| `/sos-emergency` | SOS Emergency | Emergency alert feature page |
| `/elderly-care` | Elderly Care | Senior monitoring feature page |
| `/blog` | Blog | Editorial grid, 6 post cards |
| `/careers` | Careers | Job listings, culture, benefits |
| `/press` | Press | Media room, press coverage |
| `/contact` | Contact | Form + FAQ + office info |
| `/help` | Help Center | Search, FAQ accordion |
| `/privacy` | Privacy Policy | 12-section policy |
| `/terms` | Terms of Service | 12-section ToS |
| `/cookies` | Cookie Policy | Cookie types, browser controls |
| `/status` | System Status | 8 service status indicators |

### Homepage Sections (in order)

| Section | Component | Features |
|---|---|---|
| Hero | `HeroSection.tsx` | Background image slider (4 slides), auto-advance 5s, Ken Burns zoom, dot nav |
| Stats | `StatsSection.tsx` | 4 animated stat cards with SVG progress rings |
| Features | `FeaturesSection.tsx` | 15 feature cards in CSS bento grid (SOS wide, Map extra-wide) |
| Live Map Demo | `LiveMapDemoSection.tsx` | Interactive Leaflet map with family member pins |
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
- **On success:** Calls `setAuth()` → sets cookies → redirects via `getRoleRedirect(role)`
- **Endpoint:** `POST /auth/login/unified`

### Role → Route Mapping

| Role | Dashboard URL | Accent Color |
|---|---|---|
| `user` | `/dashboard` | Gold `#D4A853` |
| `moderator` | `/moderator` | Amber `#F59E0B` |
| `admin` | `/admin` | Blue `#3B82F6` |
| `super_admin` | `/super-admin` | Purple `#8B5CF6` |

### User Dashboard (`/dashboard`)
- **File:** `app/dashboard/page.tsx`
- **Design:** Premium dark glass UI — deep navy `#050D1A` background, gold accents
- **Layout:**
  - **Header:** Gold G logo, "All Safe" pulsing pill, notification bell with dropdown, user avatar
  - **Left:** Leaflet map (Carto Voyager tiles, 420px height) + active member overlay + horizontal member strip
  - **Right panel (300px):** 3 gold pill tabs — Family / Alerts / Profile
- **Family Tab:** 5 expandable member cards (color-coded glow, live pulse dot, mini stat grid, journey timeline, Call/SOS/Map buttons)
- **Alerts Tab:** Color-coded severity alerts (safe/warning/sos/info) with left accent bar, dismissable
- **Profile Tab:** Gold user identity card, 4 toggle settings (Location/Notifications/SOS Auto-Call/Battery), sign out button
- **Member Strip:** Per-member color glow cards with photo, vehicle emoji badge, battery bar
- **Mobile:** Bottom tab bar with gold active underline, Map/Family/Alerts/Profile

### Moderator Panel (`/moderator`)
- **File:** `app/moderator/page.tsx`
- **Accent:** Amber `#F59E0B`
- **Layout:** Left sidebar + main content area
- **Sections:** Overview / Tickets / Reports / Content / Announcements / Analytics

### Super Admin Panel (`/super-admin`)
- **File:** `app/super-admin/page.tsx`
- **Accent:** Purple `#8B5CF6`, crown 👑 icon
- **Sections:** 8 sidebar sections including Command Center
- **Hero stats:** 2.8M users, ₹48.7L MRR, 99.97% uptime

### Parent Dashboard (`/parent`)
- **File:** `app/parent/page.tsx`
- **Layout:** Full Leaflet map (left) + panel (right)
- **Tabs:** Live Map / Children / Alerts / Settings
- **Children Panel:** Expandable child cards with journey timeline

### Middleware (Route Protection)
- **File:** `middleware.ts`
- **Protected routes:**

```
/super-admin  → requires: super_admin
/admin        → requires: admin, super_admin
/moderator    → requires: moderator, admin, super_admin
/dashboard    → requires: user, moderator, admin, super_admin
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
- **Port:** 8000
- **Database:** SQLite (`gravity.db`) via SQLAlchemy 2.0
- **Docs:** http://localhost:8000/docs (Swagger UI)
- **CORS:** Allows http://localhost:3020 and http://localhost:3000

### Router Modules (15 routers)

| Module | Prefix | Purpose |
|---|---|---|
| `admin_router.py` | `/admin-api` | Admin dashboard, families, devices, SOS, analytics |
| `auth.py` | `/auth` | User register, login, unified login, profile |
| `families.py` | `/families` | Family circle CRUD, invite codes |
| `devices.py` | `/devices` | Device registration, battery updates |
| `location.py` | `/location` | GPS updates, history, live family view |
| `geofences.py` | `/geofences` | Zone CRUD, entry/exit event logging |
| `sos_router.py` | `/sos` | Trigger alerts, resolve, history |
| `check_ins.py` | `/check-ins` | Schedule, complete, stats |
| `journeys.py` | `/journeys` | Start, track, complete route sharing |
| `chat.py` | `/chat` | Send messages, fetch history, moderation |
| `driving.py` | `/driving` | Log incidents, stats |
| `health.py` | `/health` | Daily records, medication reminders |
| `notifications.py` | `/notifications` | Send push notifications, history |
| `plans.py` | `/plans` | Subscription management, MRR stats |
| `ai.py` | `/ai` | Anthropic AI chat assistant |

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
| role | String | owner / member / child |
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
| is_online | Boolean | Currently online |
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
| recorded_at | DateTime | When captured |

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

---

## 9. API ENDPOINTS — COMPLETE LIST

### Admin API (`/admin-api`)
```
POST   /admin-api/login                    Admin login → JWT token
GET    /admin-api/dashboard                Dashboard stats (families, devices, SOS, MRR)
GET    /admin-api/families                 List all families (paginated, filter by plan)
GET    /admin-api/devices                  List all devices (filter: online/offline/low_battery)
GET    /admin-api/sos-alerts               List SOS alerts (filter by status)
PATCH  /admin-api/sos-alerts/{id}/resolve  Resolve an alert
GET    /admin-api/notifications            List all notifications
POST   /admin-api/notifications/send       Send a broadcast notification
GET    /admin-api/analytics                Analytics overview data
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
GET    /families/my               My family memberships
GET    /families/{id}/members     Members of a family
```

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
POST   /geofences/            Create a new geofence zone
GET    /geofences/family/{id} Get all zones for a family
POST   /geofences/event       Log an entry/exit event
GET    /geofences/events      Get recent geofence events
DELETE /geofences/{id}        Delete a zone
```

### SOS Alerts (`/sos`)
```
POST   /sos/trigger              Trigger emergency SOS
GET    /sos/active               Get all active alerts
PATCH  /sos/{id}/resolve         Mark alert as resolved
GET    /sos/history/{family_id}  SOS history for a family
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
POST   /driving/event    Log a driving incident (speeding/phone/brake)
GET    /driving/events   List recent incidents
GET    /driving/stats    Driving safety statistics
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

### Password Hashing (Backend)
```python
bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()  # Hash
bcrypt.checkpw(plain.encode(), hashed.encode())               # Verify
```

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
| `drivingApi` | logEvent, events, stats |

### React Hooks (`lib/useAdminData.ts`)
```typescript
import { useDashboard, useFamilies, useDevices, useSosAlerts } from '@/lib/useAdminData'

const { data, loading, error, refetch } = useDashboard()
const { families, total, loading, setPlan } = useFamilies()
const { devices, total, setStatus } = useDevices()
const { alerts, resolve } = useSosAlerts('active')
```

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
member colors:
  Mom:     #3B82F6  (blue)
  Dad:     #10B981  (green)
  Priya:   #F59E0B  (amber)
  Anya:    #8B5CF6  (purple)
  Grandpa: #EF4444  (red)
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

```typescript
type VehicleType = 'car' | 'bus' | 'walk' | 'bike' | 'auto' | 'tempo'
type Gender = 'male' | 'female'

interface MapMember {
  id, name, photo, location, lat, lng
  vehicle: VehicleType
  vehicleLat?, vehicleLng?   // vehicle marker position on road
  speed, battery, color
  gender: Gender
}

// 5 members:
Mom      → walk, blue   (#3B82F6), female
Dad      → car,  green  (#10B981), male
Priya    → bus,  amber  (#F59E0B), female
Anya     → auto, purple (#8B5CF6), female
Grandpa  → tempo, red  (#EF4444), male
```

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

## 13. HOW TO RUN

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

# Terminal 2 — Frontend (port 3020)
cd "website/frontend"
npm run dev
```

### Kill / Restart Servers
```bash
# Kill frontend
fuser -k 3020/tcp

# Kill backend
pkill -f uvicorn
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
NEXT_PUBLIC_APP_URL=http://localhost:3020
NEXT_PUBLIC_WS_URL=ws://localhost:8000
INTERNAL_API_URL=http://127.0.0.1:8000       ← IMPORTANT: used by next.config.js rewrites
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_tXD8cP6NSHvKbR
```

> **Note:** `INTERNAL_API_URL` must be set to avoid ECONNREFUSED on port 8001. The `next.config.js` rewrites default to `INTERNAL_API_URL || 'http://127.0.0.1:8001'`.

### Reset Database
```bash
cd "website/backend"
rm gravity.db
venv/bin/python3 seed.py
sqlite3 gravity.db "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';"
```

---

## 14. CREDENTIALS — ALL ROLES

### Unified Login URL
`http://localhost:3020/login` — all roles login here, auto-redirected to their panel

### Role-Based Credentials

| Role | Email | Password | Dashboard |
|---|---|---|---|
| `user` | priya.sharma@gmail.com | Password@123 | `/dashboard` |
| `moderator` | *(set manually in DB)* | *(set manually)* | `/moderator` |
| `admin` | kamaralamjdu@gmail.com | K12345678 | `/admin` |
| `super_admin` | kamaralamjdu@gmail.com | K12345678 | `/super-admin` |

> Admin/Super Admin credentials are in the `admin_users` table. User/Moderator credentials are in the `users` table (with `role` field).

### Legacy Admin Panel (direct)
| Field | Value |
|---|---|
| **Email** | kamaralamjdu@gmail.com |
| **Password** | K12345678 |
| **Role** | super_admin |
| **Login URL** | http://localhost:3020/admin/login |

### Test User Credentials (seeded in `users` table)
| Name | Email | Password | Role |
|---|---|---|---|
| Priya Sharma | priya.sharma@gmail.com | Password@123 | user |
| Rahul Sharma | rahul.sharma@gmail.com | Password@123 | user |
| Rajesh Mehta | rajesh.mehta@gmail.com | Password@123 | user |
| Arjun Iyer | arjun.iyer@gmail.com | Password@123 | user |

---

## 15. SEED DATA

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
WEBSITE:       http://localhost:3020
DASHBOARD:     http://localhost:3020/dashboard
MODERATOR:     http://localhost:3020/moderator
SUPER ADMIN:   http://localhost:3020/super-admin
LEGACY ADMIN:  http://localhost:3020/admin
LOGIN:         http://localhost:3020/login
API:           http://localhost:8000
API DOCS:      http://localhost:8000/docs

LOGIN (all roles):
  URL:      http://localhost:3020/login
  User:     priya.sharma@gmail.com / Password@123
  Admin:    kamaralamjdu@gmail.com / K12345678

START BACKEND:
  cd website/backend
  venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

START FRONTEND:
  cd website/frontend
  npm run dev    (runs on port 3020)

KILL SERVERS:
  fuser -k 3020/tcp   (frontend)
  pkill -f uvicorn    (backend)

RESET DATABASE:
  cd website/backend
  rm gravity.db
  venv/bin/python3 seed.py
  sqlite3 gravity.db "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';"

API TEST:
  curl http://localhost:8000/
  curl -X POST http://localhost:8000/auth/login/unified \
    -H "Content-Type: application/json" \
    -d '{"email":"priya.sharma@gmail.com","password":"Password@123"}'
```

---

*Gravity — What Pulls You Together*
*© 2025 Trackalways Technologies Pvt Ltd*
