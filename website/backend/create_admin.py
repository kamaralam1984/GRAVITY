"""Create or update super admin user. Safe to run on production — does NOT delete any data."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal
import models
from auth import get_password_hash
from models import Base

Base.metadata.create_all(bind=engine)
db = SessionLocal()

EMAIL = "kamaralamjdu@gmail.com"
PASSWORD = "K12345678"
NAME = "Kamar Alam"

existing = db.query(models.AdminUser).filter(models.AdminUser.email == EMAIL).first()
if existing:
    existing.password_hash = get_password_hash(PASSWORD)
    existing.name = NAME
    existing.role = "super_admin"
    db.commit()
    print(f"Updated admin: {EMAIL}")
else:
    admin = models.AdminUser(
        email=EMAIL,
        password_hash=get_password_hash(PASSWORD),
        name=NAME,
        role="super_admin",
    )
    db.add(admin)
    db.commit()
    print(f"Created admin: {EMAIL}")

db.close()
print(f"\nLogin credentials:")
print(f"  Email:    {EMAIL}")
print(f"  Password: {PASSWORD}")
print(f"  URL:      /login  →  then go to /super-admin")
