from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    owner = "owner"
    member = "member"
    child = "child"

class PlanType(str, enum.Enum):
    free = "free"
    premium = "premium"
    family = "family"

class AlertStatus(str, enum.Enum):
    active = "active"
    resolved = "resolved"
    false_alarm = "false_alarm"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # relationships
    family_memberships = relationship("FamilyMember", back_populates="user")
    devices = relationship("Device", back_populates="user")
    locations = relationship("Location", back_populates="user")
    sos_alerts = relationship("SOSAlert", back_populates="user")
    health_records = relationship("HealthRecord", back_populates="user")

class Family(Base):
    __tablename__ = "families"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    invite_code = Column(String, unique=True, index=True)
    plan = Column(String, default="free")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    members = relationship("FamilyMember", back_populates="family")
    geofences = relationship("Geofence", back_populates="family")
    sos_alerts = relationship("SOSAlert", back_populates="family")
    subscription = relationship("Subscription", back_populates="family", uselist=False)

class FamilyMember(Base):
    __tablename__ = "family_members"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="member")
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    family = relationship("Family", back_populates="members")
    user = relationship("User", back_populates="family_memberships")

class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_name = Column(String, nullable=False)
    os = Column(String, nullable=False)  # ios / android
    os_version = Column(String, nullable=True)
    app_version = Column(String, nullable=True)
    battery_level = Column(Integer, nullable=True)
    is_online = Column(Boolean, default=False)
    push_token = Column(String, nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="devices")

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    speed = Column(Float, nullable=True)
    place_name = Column(String, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="locations")

class Geofence(Base):
    __tablename__ = "geofences"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, default="custom")  # home/school/work/custom
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_meters = Column(Float, default=200)
    color = Column(String, default="#4B80F0")
    alert_on_enter = Column(Boolean, default=True)
    alert_on_exit = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    family = relationship("Family", back_populates="geofences")
    events = relationship("GeofenceEvent", back_populates="geofence")

class GeofenceEvent(Base):
    __tablename__ = "geofence_events"
    id = Column(Integer, primary_key=True, index=True)
    geofence_id = Column(Integer, ForeignKey("geofences.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String, nullable=False)  # enter / exit
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())
    geofence = relationship("Geofence", back_populates="events")

class SOSAlert(Base):
    __tablename__ = "sos_alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    place_name = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String, default="active")  # active/resolved/false_alarm
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String, nullable=True)
    user = relationship("User", back_populates="sos_alerts")
    family = relationship("Family", back_populates="sos_alerts")

class CheckInRule(Base):
    __tablename__ = "check_in_rules"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    name = Column(String, nullable=False)
    frequency = Column(String, default="daily")  # daily/weekdays/weekends
    time_of_day = Column(String, nullable=False)
    auto_remind = Column(Boolean, default=True)
    remind_minutes_before = Column(Integer, default=15)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CheckInEvent(Base):
    __tablename__ = "check_in_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    rule_id = Column(Integer, ForeignKey("check_in_rules.id"), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending")  # pending/completed/missed/late
    place_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Journey(Base):
    __tablename__ = "journeys"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    from_location = Column(String, nullable=True)
    to_location = Column(String, nullable=True)
    from_lat = Column(Float, nullable=True)
    from_lng = Column(Float, nullable=True)
    to_lat = Column(Float, nullable=True)
    to_lng = Column(Float, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    arrived_at = Column(DateTime(timezone=True), nullable=True)
    distance_km = Column(Float, nullable=True)
    status = Column(String, default="active")  # active/completed/cancelled
    points = relationship("JourneyPoint", back_populates="journey")

class JourneyPoint(Base):
    __tablename__ = "journey_points"
    id = Column(Integer, primary_key=True, index=True)
    journey_id = Column(Integer, ForeignKey("journeys.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    speed = Column(Float, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    journey = relationship("Journey", back_populates="points")

class LocationStop(Base):
    """Auto-detected stay at a place — populated on each location update."""
    __tablename__ = "location_stops"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    place_name = Column(String, nullable=True)
    arrived_at = Column(DateTime(timezone=True), server_default=func.now())
    left_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=0)
    # transport mode used to REACH this stop from previous stop
    transport_mode = Column(String, default="unknown")  # walking / bike / car / unknown
    distance_from_prev_km = Column(Float, default=0.0)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=True)
    media_url = Column(String, nullable=True)
    type = Column(String, default="text")  # text/image/video/voice/location
    is_reported = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

class DrivingEvent(Base):
    __tablename__ = "driving_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    journey_id = Column(Integer, ForeignKey("journeys.id"), nullable=True)
    type = Column(String, nullable=False)  # speeding/phone_use/harsh_brake/rapid_accel
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    speed = Column(Float, nullable=True)
    severity = Column(String, default="medium")  # low/medium/high
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)

class HealthRecord(Base):
    __tablename__ = "health_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    steps = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    calories = Column(Integer, nullable=True)
    water_ml = Column(Integer, nullable=True)
    active_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="health_records")

class MedicationReminder(Base):
    __tablename__ = "medication_reminders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medication_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    times = Column(JSON, nullable=True)  # ["08:00", "20:00"]
    start_date = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    last_taken = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=False, unique=True)
    plan = Column(String, default="free")
    price_inr = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="active")
    payment_method = Column(String, nullable=True)
    family = relationship("Family", back_populates="subscription")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=True)
    type = Column(String, default="info")
    target = Column(String, default="all")
    sent_count = Column(Integer, default=0)
    delivered_count = Column(Integer, default=0)
    opened_count = Column(Integer, default=0)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)

class EmergencyProfile(Base):
    __tablename__ = "emergency_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    blood_group = Column(String, nullable=True)  # A+, B-, O+, etc.
    allergies = Column(JSON, nullable=True)       # ["Penicillin", "Peanuts"]
    medications = Column(JSON, nullable=True)     # ["Metformin 500mg", "Amlodipine 5mg"]
    conditions = Column(JSON, nullable=True)      # ["Diabetes Type 2", "Hypertension"]
    insurance_provider = Column(String, nullable=True)
    insurance_policy_no = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    doctor_name = Column(String, nullable=True)
    doctor_phone = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ticket_number = Column(String, unique=True, index=True)
    category = Column(String, nullable=False)  # location_issue/sos/payment/account/bug/feature_request
    priority = Column(String, default="normal")  # critical/high/normal/low
    status = Column(String, default="open")  # open/in_progress/resolved/closed
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    user_email = Column(String, nullable=True)
    user_phone = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)  # auth/admin_action/api_call/data_change/security
    actor = Column(String, nullable=True)  # email or user ID
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    status = Column(String, default="success")  # success/failed/warning
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_type = Column(String, nullable=False)  # percent/fixed
    discount_value = Column(Float, nullable=False)
    applicable_plan = Column(String, nullable=True)  # None = any plan
    max_uses = Column(Integer, nullable=True)
    current_uses = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=True)


class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price_monthly = Column(Float, default=0)
    price_yearly = Column(Float, default=0)
    description = Column(Text, nullable=True)
    features = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    gateway = Column(String, nullable=False)  # razorpay | stripe | upi
    status = Column(String, default="pending")  # pending/success/failed/refunded
    txn_id = Column(String, nullable=True)
    order_id = Column(String, nullable=True)
    billing_cycle = Column(String, default="monthly")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    refunded_at = Column(DateTime(timezone=True), nullable=True)


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    status = Column(String, default="active")  # active/cancelled/paused/trial/expired
    billing_cycle = Column(String, default="monthly")
    amount = Column(Float, default=0)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancel_reason = Column(String, nullable=True)
    auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SecurityLog(Base):
    __tablename__ = "security_logs"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    severity = Column(String, default="info")  # critical/high/medium/low/info
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BlockedIP(Base):
    __tablename__ = "blocked_ips"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, nullable=False, index=True)
    reason = Column(String, nullable=False)
    blocked_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    unblocked_at = Column(DateTime(timezone=True), nullable=True)

class OTPCode(Base):
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String, nullable=False, index=True)  # phone or email
    code = Column(String(6), nullable=False)
    purpose = Column(String, default="login")  # login | register | reset | verify
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TwoFactorAuth(Base):
    __tablename__ = "two_factor_auth"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    secret = Column(String, nullable=False)
    is_enabled = Column(Boolean, default=False)
    backup_codes = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TrustedDevice(Base):
    __tablename__ = "trusted_devices"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_token = Column(String, unique=True, nullable=False, index=True)
    device_name = Column(String, nullable=True)
    device_type = Column(String, nullable=True)  # mobile | desktop | tablet
    browser = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ── Titan: Smart Lock models ──────────────────────────────────────────────────

class SmartLock(Base):
    __tablename__ = "smart_locks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    name = Column(String, nullable=False)          # "Front Door", "Garage"
    location = Column(String, nullable=True)       # free-text location label
    is_locked = Column(Boolean, default=True)
    is_online = Column(Boolean, default=True)
    battery_level = Column(Integer, default=100)   # 0-100
    auto_lock_minutes = Column(Integer, default=0) # 0=disabled
    last_action = Column(String, nullable=True)    # "locked" | "unlocked"
    last_action_by = Column(String, nullable=True) # user name
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    events = relationship("LockEvent", back_populates="lock")

class LockEvent(Base):
    __tablename__ = "lock_events"
    id = Column(Integer, primary_key=True, index=True)
    lock_id = Column(Integer, ForeignKey("smart_locks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)        # "locked" | "unlocked" | "tamper" | "door_open" | "door_close"
    triggered_by = Column(String, default="manual") # "manual" | "remote" | "auto" | "sensor" | "alert"
    note = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    lock = relationship("SmartLock", back_populates="events")

# ── Venus: Vehicle & Driver models ───────────────────────────────────────────

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    family_id = Column(Integer, ForeignKey("families.id"), nullable=True)
    name = Column(String, nullable=False)          # "Dad's Car"
    make = Column(String, nullable=True)           # "Toyota"
    model = Column(String, nullable=True)          # "Innova"
    year = Column(Integer, nullable=True)
    plate = Column(String, nullable=True)          # "MH01AB1234"
    color = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    speed = Column(Float, default=0.0)
    heading = Column(Float, nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TripRecord(Base):
    __tablename__ = "trip_records"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    start_lat = Column(Float, nullable=True)
    start_lng = Column(Float, nullable=True)
    end_lat = Column(Float, nullable=True)
    end_lng = Column(Float, nullable=True)
    start_place = Column(String, nullable=True)
    end_place = Column(String, nullable=True)
    distance_km = Column(Float, default=0.0)
    duration_minutes = Column(Integer, default=0)
    max_speed_kmh = Column(Float, default=0.0)
    avg_speed_kmh = Column(Float, default=0.0)
    fuel_used = Column(Float, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DriverBehaviorEvent(Base):
    __tablename__ = "driver_behavior_events"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trip_id = Column(Integer, ForeignKey("trip_records.id"), nullable=True)
    event_type = Column(String, nullable=False)    # "harsh_brake" | "harsh_accel" | "speeding" | "phone_use" | "fatigue" | "lane_change"
    severity = Column(String, default="medium")    # "low" | "medium" | "high" | "critical"
    speed_at_event = Column(Float, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    ai_description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ── Cosmo AI: Dashcam & Behavior models ──────────────────────────────────────

class DashcamEvent(Base):
    __tablename__ = "dashcam_events"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String, nullable=False)    # "collision_warning" | "pedestrian" | "red_light" | "stop_sign" | "lane_departure" | "tailgating" | "drowsiness"
    severity = Column(String, default="medium")
    confidence = Column(Float, default=0.0)        # AI confidence 0.0-1.0
    ai_analysis = Column(Text, nullable=True)      # AI description
    image_url = Column(String, nullable=True)
    video_clip_url = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    speed_at_event = Column(Float, nullable=True)
    is_reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BehaviorScore(Base):
    __tablename__ = "behavior_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    score = Column(Integer, default=100)           # 0-100 driving score
    period = Column(String, default="weekly")      # "daily" | "weekly" | "monthly"
    total_trips = Column(Integer, default=0)
    total_km = Column(Float, default=0.0)
    harsh_events = Column(Integer, default=0)
    speed_violations = Column(Integer, default=0)
    phone_events = Column(Integer, default=0)
    ai_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SchoolInfo(Base):
    __tablename__ = "school_info"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    school_name = Column(String, nullable=False, default="My School")
    class_name = Column(String, nullable=True)   # e.g. "Class 8"
    section = Column(String, nullable=True)       # e.g. "A"
    bus_number = Column(String, nullable=True)
    bus_driver = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SchoolPeriod(Base):
    __tablename__ = "school_periods"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)   # 0=Mon, 1=Tue … 4=Fri, 5=Sat, 6=Sun
    period_order = Column(Integer, nullable=False, default=1)
    time = Column(String, nullable=False)            # "8:00 AM"
    subject = Column(String, nullable=False)
    teacher = Column(String, nullable=True, default="—")
    room = Column(String, nullable=True, default="—")
    color = Column(String, nullable=True, default="#3B82F6")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5
    category = Column(String, default="general")  # general/bug/feature/ux
    message = Column(Text, nullable=False)
    status = Column(String, default="new")  # new/reviewed/actioned
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ContactRequest(Base):
    __tablename__ = "contact_requests"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String, default="new")  # new/replied/closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AppSetting(Base):
    __tablename__ = "app_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
