# GRAVITY Super Admin Panel — Complete Tab Guide

Super Admin Panel URL: https://gravity.kvlbusinesssolutions.com/super-admin
Login URL: https://gravity.kvlbusinesssolutions.com/super-admin/login

---

## OVERVIEW / DASHBOARD

### Command Center
**Kya kaam karta hai:** Pura platform ka ek nazar mein overview. Total users, active families, revenue, SOS alerts, aur system status ek jagah dikhata hai.
**Kaise use karein:** Login karte hi yeh page khulta hai. Top stats cards me real-time numbers dikhte hain. Neeche recent alerts, live activity feed, aur quick action buttons hain.

### Live Operations
**Kya kaam karta hai:** Real-time platform activity — abhi kaun online hai, kahan hain, koi SOS active hai ya nahi.
**Kaise use karein:** Yeh tab live monitoring ke liye hai. Refresh karte rahein ya auto-refresh on karein.

### AI Copilot
**Kya kaam karta hai:** AI se platform ke baare mein sawaal poochh sakte hain — "aaj kitne SOS aaye?", "sabse zyada active family kaun si hai?" etc.
**Kaise use karein:** Text box mein sawaal likhein, Enter dabayein. AI platform data ke basis par jawab deta hai.

### Platform Status
**Kya kaam karta hai:** Backend services, API, database, aur third-party integrations ka health status dikhata hai.
**Kaise use karein:** Green = sab theek, Yellow = warning, Red = problem. Koi red dikhe to backend logs check karein.

---

## PEOPLE MANAGEMENT

### All Users
**Kya kaam karta hai:** Platform ke har user ka record — naam, email, role, status, join date.
**Kaise use karein:**
- Search box mein naam/email likhein
- Role filter (User/Admin/Super Admin) se filter karein
- Status filter (Active/Inactive) use karein
- Eye icon = user detail dekhein
- Edit icon = naam, email, phone, role badlein
- Key icon = password change karein
- Ban icon = user suspend/activate karein
- Delete icon = user permanently delete karein
- "+ Add User" button se naya user banayein
- "Export CSV" se poori list download karein

### Families
**Kya kaam karta hai:** Har family circle ka record — family naam, owner, members count, plan, join date.
**Kaise use karein:**
- Family naam se search karein
- Plan filter lagayein (Free/Basic/Premium)
- Eye icon = family details aur members dekhein
- Delete icon = family delete karein (caution!)
- "+ Add Family" se manually naya family circle banayein (existing user ko owner set karein)

### Children
**Kya kaam karta hai:** Platform par jo users "child" role mein hain unki list — kaunsi family se hain, status, location.
**Kaise use karein:** Paginated list (50 per page). Search karein. Export CSV se data download karein. Prev/Next buttons se pages change karein.

### Elderly
**Kya kaam karta hai:** Elderly category ke users ki monitoring list.
**Kaise use karein:** Same as Children tab — search, paginate, export.

### Caregivers
**Kya kaam karta hai:** Caregiver role wale users ki list.
**Kaise use karein:** Search aur export available hai.

### User Verification
**Kya kaam karta hai:** Naye registered users jinhe verify karna hai — Approve ya Reject karein.
**Kaise use karein:** Pending users dikhenge. "Approve" dabao = user active ho jata hai, app use kar sakta hai. "Reject" dabao = account block ho jata hai.

---

## LOCATION & TRACKING

### Geofences
**Kya kaam karta hai:** Sabhi families ke geofence zones — kahan-kahan safe zones bane hain, violations kitni hui hain.
**Kaise use karein:** List mein family name, zone name, radius dikhta hai. Violations count bhi show hota hai.

### Location History
**Kya kaam karta hai:** Users ki GPS location history — kaun kahan gaya, kab gaya.
**Kaise use karein:** Real DB data hai. Search mein user naam ya jagah likhein. Table mein user name, coordinates, place name, aur time dikhta hai.

### Location Intelligence
**Kya kaam karta hai:** Location data ka analysis — hotspots, frequent places, movement patterns.
**Kaise use karein:** Analytics view hai. Graphs aur stats location trends dikhate hain.

---

## SAFETY & EMERGENCY

### SOS Alerts
**Kya kaam karta hai:** Platform par aaye SOS emergency alerts — kaun ne bheja, kab, kahan se, resolve hua ya nahi.
**Kaise use karein:** Real data hai. Unresolved alerts top par dikhte hain. "Resolve" button dabao jab emergency handle ho jaye. Export CSV se record rakhein.

### Emergency Cases
**Kya kaam karta hai:** Active emergency situations ka detailed record — type, severity, response time.
**Kaise use karein:** Filter by status (Active/Resolved). Timeline mein events dekh sakte hain.

### Missing Persons
**Kya kaam karta hai:** Koi family member missing report hua ho to yahan record aata hai.
**Kaise use karein:** Active cases filter se dekhen. Last known location map par dikhata hai.

### Incident Reports
**Kya kaam karta hai:** Kisi bhi safety incident ki formal report — geofence breach, unsafe area detection, etc.
**Kaise use karein:** Date range filter lagayein. Severity se sort karein.

### Risk Monitoring
**Kya kaam karta hai:** High-risk users/families ka real-time monitoring — jo frequently unsafe areas mein jaate hain.
**Kaise use karein:** Risk score se sorted list. High risk users ko flag karein.

### Safety Scores
**Kya kaam karta hai:** Har user/family ka overall safety score — SOS count, geofence violations, driving behavior se calculate hota hai.
**Kaise use karein:** Score dekh kar parents/admins ko alert kar sakte hain. Low score = attention chahiye.

---

## SCHOOL MANAGEMENT

### School Management
**Kya kaam karta hai:** Platform use karne wale school students ka record — school naam, class, section.
**Kaise use karein:** Real DB data (SchoolInfo table). Search mein student naam likhein. Table mein school naam, class, section, bus number dikhta hai.

### School Bus
**Kya kaam karta hai:** School bus tracking — bus number, driver, route, students on board.
**Kaise use karein:** Bus number se search karein. Live tracking ke liye map view use karein.

### Attendance
**Kya kaam karta hai:** Students ki school attendance record — present/absent tracking.
**Kaise use karein:** Date select karein, class/section filter lagayein.

### Pickup Verification
**Kya kaam karta hai:** School se pickup — verified person ne pick kiya ya unauthorized person ne.
**Kaise use karein:** Unauthorized pickup alerts red mein highlight hote hain.

### Child Alerts
**Kya kaam karta hai:** Children se related safety alerts — school se late nikla, geofence breach, SOS.
**Kaise use karein:** Unread alerts badge count dikhata hai. Mark as read karein.

### Child Analytics
**Kya kaam karta hai:** Children ki behavior analytics — school attendance rate, location patterns, safety score trend.
**Kaise use karein:** Graphs mein monthly/weekly data dekhen.

---

## HEALTH & ELDERLY CARE

### Medication
**Kya kaam karta hai:** Users ki medication reminders ka record — kaunsi dawai, kab leni hai, last taken kab tha.
**Kaise use karein:** Real DB data (MedicationReminder table). User naam se search. Active/Inactive badge se filter.

### Fall Detection
**Kya kaam karta hai:** Elderly users mein fall detection events — kab, kahan, kitna severe.
**Kaise use karein:** Alerts by severity. Resolved/Unresolved filter lagayein.

### Wellness Reports
**Kya kaam karta hai:** Users ki health data — steps, heart rate, calories, sleep hours.
**Kaise use karein:** Real DB data (HealthRecord table). User naam se search. Heart rate >100 red mein, sleep <7h yellow mein dikhta hai.

### Caregiver Console
**Kya kaam karta hai:** Caregivers ka dashboard — wo kaunse elderly persons ki care kar rahe hain, last check-in kab tha.
**Kaise use karein:** Caregiver name se search. Unattended cases flag hote hain.

### Elder Analytics
**Kya kaam karta hai:** Elderly users ke health trends — weekly/monthly health score, medication compliance.
**Kaise use karein:** Individual user select karein, trend graph dekhen.

---

## DRIVING SAFETY

### Driving Events
**Kya kaam karta hai:** Platform par record hue driving events — harsh braking, speeding, phone use while driving.
**Kaise use karein:** Real DB data (DrivingEvent table). Severity filter (Critical/High/Medium/Low). Export CSV. Driver naam se search.

### Driver Scores
**Kya kaam karta hai:** Har driver ka safety score — events count, score trend.
**Kaise use karein:** Real DB data. Score distribution bar chart dikhata hai platform average. Table mein driver-wise events count.

### Speed Violations
**Kya kaam karta hai:** Speed limit cross karne ke events — kitni speed thi, kahan, kab.
**Kaise use karein:** Location aur speed se filter karein. Repeat violators identify karein.

### Teen Driving
**Kya kaam karta hai:** Teen drivers ki special monitoring — night driving, speed violations, phone use.
**Kaise use karein:** Parent alerts configure kar sakte hain. Score trend graph dekhen.

### Risk Detection
**Kya kaam karta hai:** AI-detected high-risk driving patterns — jo drivers accident-prone behaviour dikhate hain.
**Kaise use karein:** Risk level se sort karein. High risk drivers ko alert bhejein.

### AI Driving Coach
**Kya kaam karta hai:** AI recommendations for each driver — kya improve karein, personalized tips.
**Kaise use karein:** Driver select karein, AI suggestions dekhen. Tips email/push se bhej sakte hain.

---

## AI CENTER

### AI Guardian
**Kya kaam karta hai:** AI-powered safety monitoring — unusual patterns detect karta hai (child school nahi gaya, elderly zyada der se move nahi hua).
**Kaise use karein:** Active alerts dekhen. Sensitivity settings adjust karein.

### Safety Predictions
**Kya kaam karta hai:** AI predict karta hai future safety risks — kaunse users/areas high-risk hain.
**Kaise use karein:** Prediction confidence score dekhen. High confidence alerts par action lein.

### AI Reports
**Kya kaam karta hai:** Automated AI-generated safety reports — weekly/monthly summaries.
**Kaise use karein:** Report naam se search. Schedule karein (daily/weekly). Download ya email karein.

### AI Chat Logs
**Kya kaam karta hai:** Users ne AI chatbot se kya kya poochha — conversation logs.
**Kaise use karein:** User naam se search. Flagged conversations highlight hoti hain.

### AI Models
**Kya kaam karta hai:** Active AI models ka status — version, accuracy, last trained.
**Kaise use karein:** Model performance metrics dekhen. Outdated model ko retrain trigger karein.

### AI Configuration
**Kya kaam karta hai:** AI settings configure karein — model parameters, alert thresholds, prediction window.
**Kaise use karein:** Sliders/inputs se values set karein. "Save Settings" dabao.

---

## COMMUNICATIONS

### Notifications
**Kya kaam karta hai:** Platform se bheje gaye push notifications ka record — title, body, sent/delivered/opened count.
**Kaise use karein:** Real DB data. New notification bhejne ke liye "+ Send Notification" use karein. Delivery rate check karein.

### Family Chat
**Kya kaam karta hai:** Families ke internal chat ka summary — kitne messages, media, flagged content.
**Kaise use karein:** Real DB data (Message table). Flagged messages wali families ko immediately review karein. "Flagged" red badge = reported content.

### Email Campaigns
**Kya kaam karta hai:** Users ko mass email bhejne ke campaigns — welcome emails, feature announcements, offers.
**Kaise use karein:** "+ Create Campaign" dabao. Audience select karein (All Users/New Users/Enterprise etc.). Subject likhen. Active/Paused/Completed status dekhen.

### SMS Campaigns
**Kya kaam karta hai:** SMS mass messaging campaigns — OTP, alerts, promotions.
**Kaise use karein:** Campaign banao, target set karo, schedule karo. Delivery stats dekhen.

### Announcements
**Kya kaam karta hai:** In-app announcements — platform updates, maintenance, new features.
**Kaise use karein:** "+ New Announcement" dabao. Title, message, target audience set karo. Publish date schedule kar sakte ho.

---

## DEVICES & IoT

### Devices
**Kya kaam karta hai:** Platform se connected sare devices — phone model, last seen, battery level, user.
**Kaise use karein:** Real DB data. Device type filter lagao. Inactive devices identify karo.

### Smart Watches
**Kya kaam karta hai:** Connected smartwatches ka record — model, health data sync status.
**Kaise use karein:** Watch brand se filter karo. Sync failed watches flag hoti hain.

### GPS Trackers
**Kya kaam karta hai:** Dedicated GPS trackers — child bags, vehicles mein lage trackers.
**Kaise use karein:** Device ID se search. Last known location dekho. Battery low alerts.

### Cameras
**Kya kaam karta hai:** Connected security cameras — home, vehicle dashcam.
**Kaise use karein:** Online/Offline status dekho. Last footage timestamp check karo.

### Smart Home
**Kya kaam karta hai:** Smart home devices integration — smart locks, sensors.
**Kaise use karein:** Device status dekho. Lock/unlock events log dekho.

### Device Health
**Kya kaam karta hai:** Sab devices ka health overview — battery trends, connectivity issues, offline devices.
**Kaise use karein:** Critical alerts (battery <10%, offline >24h) top par dikhte hain.

---

## BUSINESS / REVENUE

### Revenue
**Kya kaam karta hai:** Platform ka revenue overview — MRR, ARR, plan-wise breakdown.
**Kaise use karein:** Monthly/yearly toggle karein. Plan-wise revenue pie chart dekhen. Export financial report.

### Payments
**Kya kaam karta hai:** Individual payment transactions — kaun ne kitna diya, gateway (Razorpay/Stripe/UPI), status.
**Kaise use karein:** Real DB data (Payment table). Status filter (Success/Failed/Refunded). User naam se search. Refund ke liye payment select karein.

### Subscriptions
**Kya kaam karta hai:** Active/cancelled subscriptions — kaun sa plan, kab expire hoga.
**Kaise use karein:** Expiring soon alerts dekhen. Auto-renewal status check karein.

### Plans
**Kya kaam karta hai:** Platform ke subscription plans manage karein — Free, Basic, Premium.
**Kaise use karein:** Plan edit karein (price, features). "+ Add Plan" se naya plan banayein. Plan activate/deactivate karein.

### Coupons
**Kya kaam karta hai:** Discount coupons manage karein — coupon code, discount amount, expiry.
**Kaise use karein:** "+ Create Coupon" dabao. Code, discount type (%, fixed), max uses, expiry set karein. Usage stats dekhen.

### Invoices
**Kya kaam karta hai:** Generated invoices ka record — user, amount, date, status.
**Kaise use karein:** User naam se search. Pending invoices filter karo. Download/resend option.

### Financial Reports
**Kya kaam karta hai:** Detailed financial analytics — MRR growth, churn rate, revenue by plan.
**Kaise use karein:** Date range select karo. Charts mein trend dekho. Export PDF/CSV.

---

## ENTERPRISE

### Enterprise Accounts
**Kya kaam karta hai:** Corporate/enterprise clients ka record — company naam, users count, contract value.
**Kaise use karein:** Account health score dekho. Contract renewal dates track karo. Account manager assign karo.

### White Label
**Kya kaam karta hai:** White-label clients jo apne branding se GRAVITY use karte hain.
**Kaise use karein:** Client ka custom domain, logo, colors manage karo. Feature toggles set karo.

### Schools (Enterprise)
**Kya kaam karta hai:** School organizations jo enterprise plan par hain.
**Kaise use karein:** School naam se search. Students count, active teachers, subscription status dekho.

### Hospitals
**Kya kaam karta hai:** Hospital/healthcare organizations ka enterprise account.
**Kaise use karein:** Patients count, caregiver users, health data usage dekho.

### NGOs
**Kya kaam karta hai:** NGO partners jo subsidized plan par hain.
**Kaise use karein:** NGO name, beneficiaries count, subsidy amount dekho.

### Enterprise Analytics
**Kya kaam karta hai:** Enterprise clients ka combined analytics — top accounts by revenue, health score, usage.
**Kaise use karein:** Table mein top 10 accounts, MRR, contract value, health badge dekho.

---

## INTELLIGENCE / ANALYTICS

### User Analytics
**Kya kaam karta hai:** Platform-wide user analytics — new signups, active users, retention rate, city-wise breakdown.
**Kaise use karein:** Date range filter. Graphs mein growth trend dekho.

### Family Analytics
**Kya kaam karta hai:** Family engagement metrics — average family size, active families, plan distribution.
**Kaise use karein:** Plan-wise engagement bar chart dekho. Inactive families identify karo.

### Safety Analytics
**Kya kaam karta hai:** Safety events ka aggregate analysis — SOS count, response time, false positive rate.
**Kaise use karein:** Event type breakdown chart dekho. Response time trend track karo.

### Device Analytics
**Kya kaam karta hai:** Device/platform distribution — iOS vs Android, app version breakdown.
**Kaise use karein:** Legacy version users identify karo jinhe update karna hai.

### Revenue Analytics
**Kya kaam karta hai:** Detailed revenue metrics — MRR, ARR, new MRR, churned MRR, plan-wise breakdown.
**Kaise use karein:** Monthly trend graph dekho. Churn rate high ho to retention strategies plan karo.

### Predictive Insights
**Kya kaam karta hai:** AI predictions — kaun se users churn kar sakte hain, revenue forecast, risk areas.
**Kaise use karein:** High churn risk users ko retention offer bhejo. Revenue forecast se planning karo.

---

## SUPPORT

### Tickets
**Kya kaam karta hai:** User support tickets — login issues, location problems, payment queries.
**Kaise use karein:** Priority (Critical/High/Normal/Low) se filter. Assign to team member. Status change karo (Open → In Progress → Resolved).

### Feedback
**Kya kaam karta hai:** Users ka app feedback — rating, category, message.
**Kaise use karein:** Real DB data. Rating filter lagao. Negative feedback (1-2 stars) prioritize karo. Status New → Reviewed → Actioned update karo.

### Contact Requests
**Kya kaam karta hai:** Website se aaye contact form submissions.
**Kaise use karein:** Real DB data. New requests top par dikhte hain. Reply karein, status Closed mark karein.

### Knowledge Base
**Kya kaam karta hai:** Help articles aur FAQs manage karein jo users app mein dekhte hain.
**Kaise use karein:** Article add/edit/delete karein. Category set karein. Publish/Draft toggle.

### Customer Success
**Kya kaam karta hai:** Premium customers ka success tracking — onboarding complete hua ya nahi, health score, last contact.
**Kaise use karein:** Low health score customers ko proactive outreach karo.

---

## SECURITY

### Security Logs
**Kya kaam karta hai:** Platform security events — failed logins, suspicious activity, IP blocks.
**Kaise use karein:** Real DB data (SecurityLog table). Severity filter (Critical/High/Medium). Unresolved alerts action lo.

### Audit Logs
**Kya kaam karta hai:** Admin actions ka complete log — kaun ne kya kiya, kab, kis IP se.
**Kaise use karein:** Real DB data. Actor (email) se search karo. Event type filter lagao (admin_action/data_change/auth).

### Login Activity
**Kya kaam karta hai:** Users ke login/logout events — kab login hua, kahan se, kaunse device se.
**Kaise use karein:** Real DB data (SecurityLog — login events). Failed login attempts identify karo. Suspicious IPs block karo.

### Threat Detection
**Kya kaam karta hai:** High/Critical severity security events — brute force, unauthorized access attempts.
**Kaise use karein:** Real DB data (high severity security logs). Unresolved threats action lo. IP block karein agar zarurat ho.

### Permissions
**Kya kaam karta hai:** Platform permissions ka overview — kaun se users ko kaun se features ka access hai.
**Kaise use karein:** Permission matrix dekho. Role-wise permissions review karo.

### Compliance Center
**Kya kaam karta hai:** Data privacy compliance — GDPR, PDPA checklist, data retention policies.
**Kaise use karein:** Compliance checklist complete karo. Data deletion requests process karo.

---

## ADMINISTRATION

### Admins & Mods
**Kya kaam karta hai:** Admin aur moderator accounts manage karein — create, activate/deactivate, delete.
**Kaise use karein:** "+ Add Admin" dabao, naam/email/password set karo. Existing admin ka status toggle karo. Delete karo agar access revoke karna ho.

### Roles
**Kya kaam karta hai:** System roles define karein — Super Admin, Admin, User, Moderator.
**Kaise use karein:** Role ka naam aur permissions dekho. Custom permissions add karo.

### Teams
**Kya kaam karta hai:** Admin team structure — kon kis team mein hai, team lead kaun hai.
**Kaise use karein:** Team banao, members add karo. Team-wise ticket assignment karo.

### Access Control
**Kya kaam karta hai:** Fine-grained access control — specific admin ko specific sections ka access do ya hatao.
**Kaise use karein:** Admin select karo, sections toggle karo (allow/deny).

---

## DEVELOPER HUB

### API & Keys
**Kya kaam karta hai:** API keys manage karein — generate, revoke, usage dekho.
**Kaise use karein:** "+ Generate New Key" dabao. Key copy karo. Usage stats (calls/month) dekho. Expired keys revoke karo.

### Webhooks
**Kya kaam karta hai:** Webhooks configure karein — SOS trigger hone par apne server ko notify karein.
**Kaise use karein:** Webhook URL add karo. Events select karo (sos.triggered, family.joined etc.). Test ping bhejo.

### Integrations
**Kya kaam karta hai:** Third-party integrations — Slack, Firebase, Razorpay, Google Maps.
**Kaise use karein:** Integration select karo, API key/credentials enter karo. Test connection. Enable/Disable toggle.

### SDK Access
**Kya kaam karta hai:** Mobile SDK keys aur documentation access.
**Kaise use karein:** Android/iOS SDK key copy karo. Version check karo. Documentation link use karo.

### API Analytics
**Kya kaam karta hai:** API usage stats — calls per day, top endpoints, error rate, response time.
**Kaise use karein:** Slow endpoints identify karo. Error rate spike? Backend check karo.

---

## SYSTEM MONITORING

### System Health
**Kya kaam karta hai:** Server health — CPU, RAM, disk usage, response time.
**Kaise use karein:** Real-time metrics dekho. >80% CPU/RAM = immediately investigate karo.

### Database Health
**Kya kaam karta hai:** Database performance — query time, connection count, table sizes.
**Kaise use karein:** Slow queries identify karo. Connection pool saturation check karo.

### Queue Monitoring
**Kya kaam karta hai:** Background job queues — notification queue, email queue, pending jobs.
**Kaise use karein:** Stuck jobs identify karo. Queue lag high ho to worker scale karo.

### Error Logs
**Kya kaam karta hai:** Application errors — crash logs, API errors, unhandled exceptions.
**Kaise use karein:** Error type se group karein. Recurring errors fix karo. Severity se sort karo.

### Backups
**Kya kaam karta hai:** Database backup status — last backup kab hua, size, location.
**Kaise use karein:** Daily backup confirm karo. Manual backup trigger karo "Backup Now" se. Download backup agar zarurat ho.

---

## CONFIGURATION / SETTINGS

### General Settings
**Kya kaam karta hai:** App-wide basic settings — app name, support email, max family size, SOS response time.
**Kaise use karein:** Real DB data (AppSetting table). Values change karo, "Save" dabao — permanently save hoga.

### Branding
**Kya kaam karta hai:** App ka visual branding — logo, primary color, app name.
**Kaise use karein:** Logo upload karo, color picker se brand color set karo. Save karo.

### SMTP
**Kya kaam karta hai:** Email sending configuration — SMTP host, port, username, password, from address.
**Kaise use karein:** Real DB data — AppSetting table mein save hota hai. Fill karo: smtp_host, smtp_port, smtp_user, smtp_password, smtp_from. "Save Settings" dabao. Test email bhejo.

### SMS Gateway
**Kya kaam karta hai:** SMS sending configuration — provider (Twilio/MSG91 etc.), API key, sender ID.
**Kaise use karein:** Real DB data. Provider select karo, API key enter karo, Sender ID set karo. Save karo.

### Push Notifications
**Kya kaam karta hai:** Push notification configuration — Firebase FCM key, Apple APNS credentials.
**Kaise use karein:** Real DB data. FCM Server Key, APNS Key ID, Team ID enter karo. Save karo. Test push bhejo.

### Maps API
**Kya kaam karta hai:** Map service configuration — Google Maps API key, Mapbox token.
**Kaise use karein:** Real DB data. Google Maps API Key ya Mapbox token enter karo. Save karo. Yeh key location tracking mein use hoti hai.

### AI Settings
**Kya kaam karta hai:** AI/ML configuration — OpenAI API key, model selection, temperature.
**Kaise use karein:** Real DB data. OpenAI API Key enter karo, model choose karo (gpt-4/gpt-3.5-turbo), temperature set karo (0.0-1.0). Save karo.

### Platform Config
**Kya kaam karta hai:** Platform-wide configuration — feature flags, limits, operational settings.
**Kaise use karein:** Real DB data. App name, support email, max family size, SOS response time (minutes) set karo. Feature toggles (AI Guardian on/off, Driving Safety on/off etc.) switch karo. Save karo.

---

## QUICK REFERENCE — Data Sources

| Tab | Data Source |
|-----|-------------|
| All Users, Families | Real DB — User, Family tables |
| Children, Elderly, Caregivers | Real DB — FamilyMember (role filter) |
| User Verification | Real DB — User (is_active=false) |
| SOS Alerts | Real DB — SOSAlert table |
| Location History | Real DB — Location table |
| Driving Events, Driver Scores | Real DB — DrivingEvent, BehaviorScore |
| Medication | Real DB — MedicationReminder table |
| Wellness Reports | Real DB — HealthRecord table |
| School Management | Real DB — SchoolInfo table |
| Family Chat | Real DB — Message table |
| Payments | Real DB — Payment table |
| Subscriptions | Real DB — Subscription table |
| Login Activity | Real DB — SecurityLog (login events) |
| Threat Detection | Real DB — SecurityLog (high severity) |
| Security Logs | Real DB — SecurityLog table |
| Audit Logs | Real DB — AuditLog table |
| Notifications | Real DB — Notification table |
| Feedback | Real DB — Feedback table (new) |
| Contact Requests | Real DB — ContactRequest table (new) |
| SMTP/SMS/Push/Maps/AI/Platform Settings | Real DB — AppSetting key-value table |
| Revenue, Analytics (summary stats) | Real DB — aggregate queries |
| Remaining sections | Structured sample data (feature ready) |

---

## IMPORTANT NOTES

1. **Password Change:** Kisi bhi user ka password change karne ke liye All Users tab mein jaao → Key icon (purple) click karo → naya password enter karo (min 6 characters).

2. **Family Role Change:** Super Admin kisi bhi user ka family role change kar sakta hai — All Users → Edit (yellow icon) → Family Role dropdown → Child ya Parent select karo.

3. **Settings Save:** SMTP, SMS Gateway, Push, Maps API, AI Settings, Platform Config — sab settings "Save Settings" button dabane ke baad database mein permanently save ho jaate hain.

4. **Empty Sections:** Feedback aur Contact Requests tab abhi empty dikhenge — jab users app se feedback submit karenge tab data aayega.

5. **Export CSV:** Jahan bhi "Export CSV" button dikhega, wahan se poori list download kar sakte ho (Excel mein open hogi).

---

*Gravity Super Admin Panel — Version 2.0*
*Prepared for: Kamar Alam (Super Admin)*
