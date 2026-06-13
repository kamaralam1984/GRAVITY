# GRAVITY — FULL SYSTEM DOCUMENTATION
### Trackalways Technologies Pvt Ltd
**Platform:** Family Safety App | **Version:** 2.0.0 | **Last Updated:** June 2025

---

## TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Frontend — Public Website](#4-frontend--public-website)
5. [Frontend — Admin Panel](#5-frontend--admin-panel)
6. [Backend API](#6-backend-api)
7. [Database — All Tables](#7-database--all-tables)
8. [API Endpoints — Complete List](#8-api-endpoints--complete-list)
9. [Authentication System](#9-authentication-system)
10. [Frontend API Client](#10-frontend-api-client)
11. [Design System](#11-design-system)
12. [How to Run](#12-how-to-run)
13. [Admin Credentials](#13-admin-credentials)
14. [Seed Data](#14-seed-data)

---

## 1. PROJECT OVERVIEW

**Gravity** is a premium family safety platform by Trackalways Technologies. It allows families to stay connected through real-time location sharing, SOS emergency alerts, geofence zone management, health monitoring, driving safety, and family chat.

**Live URLs (Local Development)**
| Service | URL |
|---|---|
| Website | http://localhost:3020 |
| Backend API | http://localhost:8000 |
| API Swagger Docs | http://localhost:8000/docs |
| Admin Panel | http://localhost:3020/admin |

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
├── SYSTEM_INFO.md              ← This file
└── website/
    ├── frontend/               ← Next.js 14 app
    │   ├── app/                ← App Router pages
    │   │   ├── layout.tsx      ← Root layout + SEO metadata
    │   │   ├── page.tsx        ← Homepage
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
    │   │   └── admin/          ← Admin panel (17 pages)
    │   │       ├── layout.tsx  ← Sidebar + header + JWT auth
    │   │       ├── page.tsx    ← Dashboard
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
    │   │   │   └── DownloadCTA.tsx
    │   │   └── effects/
    │   │       ├── AIAssistant.tsx
    │   │       ├── ParticleField.tsx
    │   │       └── SOSButton.tsx
    │   ├── lib/
    │   │   ├── api.ts          ← Typed API client (all endpoints)
    │   │   ├── useAdminData.ts ← React hooks for admin data
    │   │   ├── animations.ts
    │   │   ├── constants.ts
    │   │   ├── mapData.ts
    │   │   └── utils.ts
    │   ├── public/
    │   │   ├── favicon.svg     ← Gold G logo favicon
    │   │   ├── logo.svg        ← Full wordmark
    │   │   ├── og-image.svg    ← 1200×630 social share image
    │   │   └── manifest.json   ← PWA manifest
    │   ├── .env.local          ← NEXT_PUBLIC_API_URL=http://localhost:8000
    │   ├── next.config.js
    │   ├── tailwind.config.ts
    │   └── package.json
    │
    └── backend/                ← FastAPI backend
        ├── main.py             ← App entry, all routers registered
        ├── database.py         ← SQLAlchemy engine + SessionLocal
        ├── models.py           ← All 18 ORM table models
        ├── auth.py             ← JWT + bcrypt utilities
        ├── seed.py             ← Database seeding script
        ├── .env                ← DATABASE_URL, SECRET_KEY, etc.
        ├── gravity.db          ← SQLite database file
        ├── requirements.txt
        ├── venv/               ← Python virtual environment
        └── routers/
            ├── auth.py         ← /auth/* user registration/login
            ├── admin_router.py ← /admin-api/* admin endpoints
            ├── families.py     ← /families/* family circles
            ├── devices.py      ← /devices/* device management
            ├── location.py     ← /location/* GPS tracking
            ├── geofences.py    ← /geofences/* safe zones
            ├── sos_router.py   ← /sos/* emergency alerts
            ├── check_ins.py    ← /check-ins/* check-in system
            ├── journeys.py     ← /journeys/* route sharing
            ├── chat.py         ← /chat/* family messaging
            ├── driving.py      ← /driving/* driving safety
            ├── health.py       ← /health/* health tracking
            ├── notifications.py← /notifications/* push alerts
            ├── plans.py        ← /plans/* subscription billing
            └── ai.py           ← /ai/* Anthropic AI chat
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
| Stats | `StatsSection.tsx` | 4 animated stat cards with SVG progress rings (halved size) |
| Features | `FeaturesSection.tsx` | 15 feature cards in CSS bento grid (SOS wide, Map extra-wide) |
| Live Map Demo | `LiveMapDemoSection.tsx` | Interactive Leaflet map with family member pins |
| How It Works | `HowItWorksSection.tsx` | 4-step process with animations |
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
13. Family Chat (NEW — indigo)
14. Driving Safety (NEW — sky blue)
15. Family Moments (NEW — pink)

---

## 5. FRONTEND — ADMIN PANEL

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

### Admin Sidebar Navigation

```
Dashboard          (LayoutDashboard icon)
Families           (Users icon)
Devices            (Smartphone icon)
Locations          (MapPin icon)
Geofences          (Circle icon)
SOS Alerts         (AlertTriangle icon)
Check-Ins          (CheckSquare icon)
Journeys           (Route icon)
Family Chat        (MessageCircle icon)  [NEW badge]
Driving Safety     (Car icon)            [NEW badge]
Health             (Heart icon)          [NEW badge]
Elderly Care       (ActivitySquare icon)
Analytics          (BarChart2 icon)
Notifications      (Bell icon)
Plans              (CreditCard icon)
Settings           (Settings icon)
```

---

## 6. BACKEND API

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
| `auth.py` | `/auth` | User register, login, profile |
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

## 7. DATABASE — ALL TABLES

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
| is_active | Boolean | Account status |
| created_at | DateTime | Registration timestamp |
| updated_at | DateTime | Last update |

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

## 8. API ENDPOINTS — COMPLETE LIST

### Admin API (`/admin-api`)
```
POST   /admin-api/login              Admin login → JWT token
GET    /admin-api/dashboard          Dashboard stats (families, devices, SOS, MRR)
GET    /admin-api/families           List all families (paginated, filter by plan)
GET    /admin-api/devices            List all devices (filter: online/offline/low_battery)
GET    /admin-api/sos-alerts         List SOS alerts (filter by status)
PATCH  /admin-api/sos-alerts/{id}/resolve  Resolve an alert
GET    /admin-api/notifications      List all notifications
POST   /admin-api/notifications/send Send a broadcast notification
GET    /admin-api/analytics          Analytics overview data
```

### User Auth (`/auth`)
```
POST   /auth/register     Register new user
POST   /auth/login        Login (form-data) → JWT
POST   /auth/login/json   Login (JSON body) → JWT
GET    /auth/me           Get current user profile
```

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
POST   /location/update           Update current GPS location
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
POST   /sos/trigger            Trigger emergency SOS
GET    /sos/active             Get all active alerts
PATCH  /sos/{id}/resolve       Mark alert as resolved
GET    /sos/history/{family_id} SOS history for a family
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
POST   /journeys/start         Start a new journey (notifies family)
POST   /journeys/point         Add GPS point to active journey
PATCH  /journeys/{id}/complete Mark journey complete (safe arrival)
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
POST   /health/record           Save daily health record
GET    /health/records/{user_id} Get health history
POST   /health/medication        Add medication reminder
GET    /health/medications/{id}  Get user's medications
GET    /health/stats             Health tracking statistics
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

## 9. AUTHENTICATION SYSTEM

### User Authentication
- **Method:** JWT (JSON Web Tokens)
- **Library:** python-jose + bcrypt
- **Token expiry:** 7 days (10,080 minutes)
- **Storage:** `localStorage.gravity_user_token`
- **Header:** `Authorization: Bearer <token>`

### Admin Authentication
- **Login endpoint:** `POST /admin-api/login`
- **Token payload:** `{ admin_id, role, exp }`
- **Storage:** `localStorage.gravity_admin_token`
- **Legacy flag:** `localStorage.gravity_admin_auth = "true"` (backward compat)
- **Logout:** Clears both keys via `clearAdminAuth()`

### Password Hashing
```python
# Hash
bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

# Verify
bcrypt.checkpw(plain.encode(), hashed.encode())
```

### JWT Token Flow
```
1. POST /admin-api/login { email, password }
   ↓
2. Backend: verify bcrypt hash → create JWT
   ↓
3. Response: { access_token, token_type, admin }
   ↓
4. Frontend: localStorage.setItem("gravity_admin_token", token)
   ↓
5. Subsequent requests: Authorization: Bearer <token>
   ↓
6. Backend: decode JWT → get admin_id → fetch AdminUser from DB
```

---

## 10. FRONTEND API CLIENT

File: `frontend/lib/api.ts`

All API calls go through a central typed client with automatic token injection.

```typescript
// Base URL from environment
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Usage examples:
import { adminApi, authApi, familiesApi, sosApi } from '@/lib/api'

// Admin login
const result = await adminApi.login(email, password)

// Dashboard stats
const stats = await adminApi.dashboard()

// Fetch families
const { families, total } = await adminApi.families(0, 20, 'premium')

// Trigger SOS
await sosApi.trigger(familyId, lat, lng, placeName)

// Send chat message
await chatApi.send(familyId, "I'm safe!")

// Health record
await healthApi.saveRecord({ date: "2025-06-12", steps: 8000, sleep_hours: 7.5 })
```

### Available API Modules
| Module | Import | Endpoints |
|---|---|---|
| `adminApi` | `from '@/lib/api'` | login, dashboard, families, devices, sosAlerts, resolveSOS, notifications, analytics |
| `authApi` | `from '@/lib/api'` | register, login, me |
| `familiesApi` | `from '@/lib/api'` | create, join, my, members |
| `devicesApi` | `from '@/lib/api'` | register, updateBattery, my, revoke |
| `locationApi` | `from '@/lib/api'` | update, history, liveFamilyLocations |
| `geofencesApi` | `from '@/lib/api'` | create, family, logEvent, events |
| `sosApi` | `from '@/lib/api'` | trigger, active, resolve, history |
| `chatApi` | `from '@/lib/api'` | send, messages, report, delete, stats |
| `healthApi` | `from '@/lib/api'` | saveRecord, records, addMedication, medications, stats |
| `journeysApi` | `from '@/lib/api'` | start, addPoint, complete, active, stats |
| `plansApi` | `from '@/lib/api'` | list, subscribe, stats |
| `drivingApi` | `from '@/lib/api'` | logEvent, events, stats |

### React Hooks (`lib/useAdminData.ts`)
```typescript
import { useDashboard, useFamilies, useDevices, useSosAlerts } from '@/lib/useAdminData'

// In any admin component:
const { data, loading, error, refetch } = useDashboard()
const { families, total, loading, setPlan } = useFamilies()
const { devices, total, setStatus } = useDevices()
const { alerts, resolve } = useSosAlerts('active')
```

---

## 11. DESIGN SYSTEM

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

**Light Mode:**
```css
--bg:           #F9F7F4
--gold:         #B8720A
--primary:      #1A56DB
--safe:         #047857
```

### Tailwind Config
- Custom colors mapped to CSS variables
- Dark mode via `.dark` class on `<html>`
- Responsive breakpoints: sm(640), md(768), lg(1024), xl(1280)

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
- In-view trigger: `whileInView={{ opacity: 1 }} viewport={{ once: true }}`

---

## 12. HOW TO RUN

### First Time Setup
```bash
# 1. Install backend dependencies
cd "website/backend"
python3 -m venv venv
venv/bin/pip install -r requirements.txt

# 2. Seed database with mock data
venv/bin/python3 seed.py

# 3. Install frontend dependencies
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
```

### Reset Database
```bash
cd "website/backend"
rm gravity.db
venv/bin/python3 seed.py
```

---

## 13. ADMIN CREDENTIALS

| Field | Value |
|---|---|
| **Email** | kamaralamjdu@gmail.com |
| **Password** | K12345678 |
| **Role** | super_admin |
| **Login URL** | http://localhost:3020/admin/login |

### Test User Credentials (seeded)
| Name | Email | Password |
|---|---|---|
| Priya Sharma | priya.sharma@gmail.com | Password@123 |
| Rahul Sharma | rahul.sharma@gmail.com | Password@123 |
| Rajesh Mehta | rajesh.mehta@gmail.com | Password@123 |
| Arjun Iyer | arjun.iyer@gmail.com | Password@123 |

---

## 14. SEED DATA

Running `seed.py` creates the following mock data:

| Entity | Count | Details |
|---|---|---|
| Admin Users | 1 | kamaralamjdu@gmail.com |
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
WEBSITE:    http://localhost:3020
ADMIN:      http://localhost:3020/admin
API:        http://localhost:8000
API DOCS:   http://localhost:8000/docs

ADMIN LOGIN:
  Email:    kamaralamjdu@gmail.com
  Password: K12345678

START BACKEND:
  cd website/backend
  venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

START FRONTEND:
  cd website/frontend
  npm run dev

RESET DATABASE:
  cd website/backend && rm gravity.db && venv/bin/python3 seed.py

API TEST:
  curl http://localhost:8000/
  curl -X POST http://localhost:8000/admin-api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"kamaralamjdu@gmail.com","password":"K12345678"}'
```

---

*Gravity — What Pulls You Together*
*© 2025 Trackalways Technologies Pvt Ltd*
