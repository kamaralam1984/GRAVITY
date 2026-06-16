"""Seed database with realistic Indian mock data. Run: python seed.py"""
import sys, os, random
from datetime import datetime, timedelta
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal
import models
from auth import get_password_hash
from models import Base

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clear existing data
for tbl in reversed(Base.metadata.sorted_tables):
    db.execute(tbl.delete())
db.commit()

print("Seeding database...")

# ── Admin user ──────────────────────────────────────────────────────────
admin = models.AdminUser(
    email="kamaralamjdu@gmail.com",
    password_hash=get_password_hash("K12345678"),
    name="Kamar Alam",
    role="super_admin",
)
db.add(admin)
db.commit()

# ── Users ──────────────────────────────────────────────────────────────
user_data = [
    ("Priya Sharma", "priya.sharma@gmail.com", "+91-9876543210"),
    ("Rahul Sharma", "rahul.sharma@gmail.com", "+91-9876543211"),
    ("Ananya Sharma", "ananya.sharma@gmail.com", "+91-9876543212"),
    ("Rajesh Mehta", "rajesh.mehta@gmail.com", "+91-9123456780"),
    ("Sunita Mehta", "sunita.mehta@gmail.com", "+91-9123456781"),
    ("Arjun Iyer", "arjun.iyer@gmail.com", "+91-9234567890"),
    ("Kavitha Iyer", "kavitha.iyer@gmail.com", "+91-9234567891"),
    ("Vikram Singh", "vikram.singh@gmail.com", "+91-9345678901"),
    ("Meera Singh", "meera.singh@gmail.com", "+91-9345678902"),
    ("Rohit Gupta", "rohit.gupta@gmail.com", "+91-9456789012"),
    ("Anjali Gupta", "anjali.gupta@gmail.com", "+91-9456789013"),
    ("Suresh Nair", "suresh.nair@gmail.com", "+91-9567890123"),
    ("Deepa Nair", "deepa.nair@gmail.com", "+91-9567890124"),
    ("Arun Reddy", "arun.reddy@gmail.com", "+91-9678901234"),
    ("Lalitha Reddy", "lalitha.reddy@gmail.com", "+91-9678901235"),
]

users = []
for name, email, phone in user_data:
    u = models.User(name=name, email=email, phone=phone, password_hash=get_password_hash("Password@123"), is_active=True)
    db.add(u)
    users.append(u)
db.commit()

# ── Families ────────────────────────────────────────────────────────────
family_data = [
    ("The Sharma Family", 0, "free"),
    ("Mehta Household", 3, "premium"),
    ("Iyer Family Circle", 5, "family"),
    ("Singh Family", 7, "premium"),
    ("Gupta Family", 9, "family"),
    ("Nair Household", 11, "free"),
    ("Reddy Circle", 13, "premium"),
]
families = []
for fname, owner_idx, plan in family_data:
    import random, string as _str
    _chars = (_str.ascii_uppercase + _str.digits).replace('O','').replace('I','').replace('L','')
    _code = ''.join(random.SystemRandom().choice(_chars) for _ in range(6))
    f = models.Family(name=fname, owner_id=users[owner_idx].id, invite_code=_code, plan=plan)
    db.add(f)
    families.append(f)
db.commit()

# ── Family Members ──────────────────────────────────────────────────────
member_groups = [
    (0, [0, 1, 2]),      # Sharma family: Priya, Rahul, Ananya
    (1, [3, 4]),          # Mehta: Rajesh, Sunita
    (2, [5, 6]),          # Iyer: Arjun, Kavitha
    (3, [7, 8]),          # Singh: Vikram, Meera
    (4, [9, 10]),         # Gupta: Rohit, Anjali
    (5, [11, 12]),        # Nair: Suresh, Deepa
    (6, [13, 14]),        # Reddy: Arun, Lalitha
]
for fam_idx, user_idxs in member_groups:
    for i, u_idx in enumerate(user_idxs):
        role = "owner" if i == 0 else "member"
        fm = models.FamilyMember(family_id=families[fam_idx].id, user_id=users[u_idx].id, role=role)
        db.add(fm)
db.commit()

# ── Devices ────────────────────────────────────────────────────────────
device_data = [
    (0, "iPhone 14 Pro", "ios", "17.2", "2.4.1", 87, True),
    (1, "Samsung Galaxy S23", "android", "14", "2.4.0", 23, True),
    (2, "iPhone 13", "ios", "16.5", "2.3.8", 12, True),
    (3, "OnePlus 11", "android", "13", "2.4.1", 95, True),
    (4, "iPhone 15", "ios", "17.3", "2.4.1", 78, True),
    (5, "Redmi Note 12", "android", "12", "2.2.5", 45, False),
    (6, "Samsung A54", "android", "13", "2.4.0", 62, True),
    (7, "iPhone 12", "ios", "16.1", "2.3.5", 8, True),
    (8, "Pixel 7", "android", "14", "2.4.1", 91, True),
    (9, "Realme GT", "android", "12", "2.3.7", 17, True),
]
for u_idx, name, os_, osv, appv, batt, online in device_data:
    d = models.Device(user_id=users[u_idx].id, device_name=name, os=os_, os_version=osv, app_version=appv, battery_level=batt, is_online=online, last_seen=datetime.utcnow() - timedelta(minutes=random.randint(1, 60)))
    db.add(d)
db.commit()

# ── Locations ──────────────────────────────────────────────────────────
cities = [
    ("Andheri East, Mumbai", 19.1136, 72.8697),
    ("Connaught Place, Delhi", 28.6315, 77.2167),
    ("Koramangala, Bangalore", 12.9352, 77.6245),
    ("T. Nagar, Chennai", 13.0418, 80.2341),
    ("Banjara Hills, Hyderabad", 17.4156, 78.4347),
    ("Kothrud, Pune", 18.5074, 73.8077),
]
for i, user in enumerate(users[:10]):
    city = cities[i % len(cities)]
    loc = models.Location(user_id=user.id, lat=city[1] + random.uniform(-0.01, 0.01), lng=city[2] + random.uniform(-0.01, 0.01), place_name=city[0], recorded_at=datetime.utcnow() - timedelta(minutes=random.randint(1, 30)))
    db.add(loc)
db.commit()

# ── Geofences ──────────────────────────────────────────────────────────
geofence_data = [
    (0, "Home - Sharma", "home", 19.1136, 72.8697, 150, "#10B981"),
    (0, "DPS School", "school", 19.1200, 72.8750, 200, "#4B80F0"),
    (1, "Mehta Home", "home", 28.6315, 77.2167, 150, "#10B981"),
    (2, "Iyer Residence", "home", 12.9352, 77.6245, 150, "#10B981"),
    (2, "Office Zone", "work", 12.9700, 77.5990, 200, "#F59E0B"),
]
for fam_idx, name, gtype, lat, lng, radius, color in geofence_data:
    g = models.Geofence(family_id=families[fam_idx].id, name=name, type=gtype, center_lat=lat, center_lng=lng, radius_meters=radius, color=color)
    db.add(g)
db.commit()

# ── SOS Alerts ────────────────────────────────────────────────────────
sos_data = [
    (0, 0, "active", "Andheri East, Mumbai"),
    (3, 1, "resolved", "Connaught Place, Delhi"),
    (6, 2, "resolved", "Koramangala, Bangalore"),
]
for u_idx, fam_idx, status, place in sos_data:
    s = models.SOSAlert(user_id=users[u_idx].id, family_id=families[fam_idx].id, lat=19.1136, lng=72.8697, place_name=place, status=status, triggered_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 120)))
    db.add(s)
db.commit()

# ── Subscriptions ────────────────────────────────────────────────────
plan_prices = {"free": 0, "premium": 299, "family": 499}
for fam in families:
    sub = models.Subscription(family_id=fam.id, plan=fam.plan, price_inr=plan_prices.get(fam.plan, 0), status="active", payment_method="upi" if fam.plan != "free" else None)
    db.add(sub)
db.commit()

# ── Check-in Rules ────────────────────────────────────────────────────
rules = [
    (0, "School Drop-off", "weekdays", "08:30"),
    (0, "Evening Return", "daily", "19:00"),
    (1, "Work Commute", "weekdays", "09:00"),
]
for fam_idx, name, freq, time_ in rules:
    r = models.CheckInRule(family_id=families[fam_idx].id, name=name, frequency=freq, time_of_day=time_, auto_remind=True)
    db.add(r)
db.commit()

# ── Notifications ────────────────────────────────────────────────────
notifs = [
    ("New Feature: AI Insights", "Discover smarter family safety with AI", "feature", "all", 142891, 139234, 54321),
    ("SOS Feature Update", "Faster emergency response now live", "feature", "premium", 89234, 87891, 45678),
    ("Battery Saver Tips", "Keep your device powered for family safety", "tip", "android", 82456, 79234, 28456),
]
for title, body, ntype, target, sent, delivered, opened in notifs:
    n = models.Notification(title=title, body=body, type=ntype, target=target, sent_count=sent, delivered_count=delivered, opened_count=opened)
    db.add(n)
db.commit()

db.close()
print("Database seeded successfully!")
print("Admin: kamaralamjdu@gmail.com / K12345678")
print("Users: priya.sharma@gmail.com / Password@123")
