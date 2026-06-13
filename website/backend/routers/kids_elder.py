"""
Gravity Kids & Gravity Elder — FastAPI router.
All endpoints return realistic mock data.
"""
from __future__ import annotations

import random
from datetime import datetime, date, timedelta
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

router = APIRouter(tags=["Kids & Elder"])


# ──────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ──────────────────────────────────────────────────────────────────────────────

def _today_str() -> str:
    return date.today().isoformat()


def _now_str() -> str:
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


# ──────────────────────────────────────────────────────────────────────────────
# Request / response models — Kids
# ──────────────────────────────────────────────────────────────────────────────

class SafetyScoreResponse(BaseModel):
    child_id: str
    child_name: str
    score: int = Field(..., ge=0, le=100)
    grade: str
    last_updated: str
    breakdown: dict[str, int]
    active_alerts: int
    recommendations: list[str]


class SchoolStatusResponse(BaseModel):
    child_id: str
    school_name: str
    date: str
    arrival_time: Optional[str]
    departure_time: Optional[str]
    arrived: bool
    departed: bool
    pickup_guardian: Optional[str]
    attendance_this_month: int
    total_school_days: int
    attendance_pct: float
    status_message: str


class BusStop(BaseModel):
    name: str
    eta_minutes: int
    lat: float
    lng: float


class BusTrackingResponse(BaseModel):
    route_id: str
    route_name: str
    bus_number: str
    driver_name: str
    current_lat: float
    current_lng: float
    current_location_label: str
    eta_minutes: int
    destination: str
    speed_kmh: int
    next_stops: list[BusStop]
    last_updated: str
    on_time: bool
    delay_minutes: int


class AuthorizePickupRequest(BaseModel):
    child_id: str
    name: str
    relation: str
    phone: str
    id_type: Optional[str] = "Aadhar"
    id_number: Optional[str] = None
    photo_url: Optional[str] = None


class AuthorizedPerson(BaseModel):
    id: str
    name: str
    relation: str
    phone: str
    added_at: str
    status: Literal["active", "pending", "revoked"] = "active"


class AuthorizePickupResponse(BaseModel):
    success: bool
    message: str
    person: AuthorizedPerson


# ──────────────────────────────────────────────────────────────────────────────
# Request / response models — Elder
# ──────────────────────────────────────────────────────────────────────────────

class HealthMetricsResponse(BaseModel):
    user_id: str
    elder_name: str
    age: int
    timestamp: str
    heart_rate_bpm: int
    heart_rate_status: Literal["Normal", "Low", "Elevated", "High"]
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    blood_pressure_status: Literal["Normal", "Pre-hypertension", "Hypertension Stage 1", "Hypertension Stage 2"]
    spo2_pct: float
    steps_today: int
    steps_goal: int
    sleep_hours: float
    sleep_quality: Literal["Poor", "Fair", "Good", "Excellent"]
    sleep_start: str
    sleep_end: str
    calories_burned: int
    weight_kg: Optional[float]
    temperature_c: Optional[float]
    weekly_summary: dict[str, float]


class FallEvent(BaseModel):
    id: str
    detected_at: str
    location: str
    severity: Literal["Minor", "Moderate", "Severe"]
    response_time_seconds: int
    resolved: bool
    notes: str


class FallAlertsResponse(BaseModel):
    user_id: str
    elder_name: str
    detection_active: bool
    sensitivity: Literal["Low", "Medium", "High"]
    falls_this_week: int
    falls_this_month: int
    last_event: Optional[FallEvent]
    recent_events: list[FallEvent]
    emergency_contacts: list[dict]
    avg_response_time_seconds: int


class MedicationDose(BaseModel):
    id: str
    name: str
    dosage: str
    scheduled_time: str
    label: Literal["Morning", "Afternoon", "Evening", "Night"]
    taken: bool
    taken_at: Optional[str]
    upcoming: bool
    missed: bool


class MedicationScheduleResponse(BaseModel):
    user_id: str
    elder_name: str
    date: str
    doses: list[MedicationDose]
    adherence_today_pct: float
    adherence_month_pct: float
    missed_this_month: int
    streak_days: int
    next_reminder: str


class MedicationTakenRequest(BaseModel):
    user_id: str
    dose_id: str
    taken_at: Optional[str] = None


class MedicationTakenResponse(BaseModel):
    success: bool
    message: str
    dose_id: str
    taken_at: str
    updated_adherence_pct: float


# ──────────────────────────────────────────────────────────────────────────────
# Kids endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/kids/safety-score/{child_id}",
    response_model=SafetyScoreResponse,
    summary="Get child safety score",
    description="Returns the current AI-computed safety score for a child (0–100) along with a breakdown and active alert count.",
)
async def get_child_safety_score(child_id: str) -> SafetyScoreResponse:
    """Return realistic child safety score data."""
    # Deterministic seed per child_id so score is stable per session
    rng = random.Random(child_id)
    score = rng.randint(88, 98)

    breakdown = {
        "school_attendance": rng.randint(88, 100),
        "route_compliance": rng.randint(90, 100),
        "pickup_verified": 100,
        "geofence_compliance": rng.randint(85, 100),
        "check_in_streak": rng.randint(80, 100),
    }

    grade = (
        "Excellent" if score >= 90
        else "Good" if score >= 75
        else "Fair" if score >= 60
        else "Needs Attention"
    )

    recommendations: list[str] = []
    if breakdown["school_attendance"] < 90:
        recommendations.append("Attendance is below 90% — review missed days this month.")
    if breakdown["route_compliance"] < 95:
        recommendations.append("Child deviated from expected route 2 times. Review GPS history.")
    if not recommendations:
        recommendations.append("All systems green. No action required today.")

    return SafetyScoreResponse(
        child_id=child_id,
        child_name="Arjun Sharma",
        score=score,
        grade=grade,
        last_updated=_now_str(),
        breakdown=breakdown,
        active_alerts=0,
        recommendations=recommendations,
    )


@router.get(
    "/kids/school-status/{child_id}",
    response_model=SchoolStatusResponse,
    summary="Get school arrival / departure status",
    description="Returns today's school check-in/check-out details for a child including the authorized guardian who collected them.",
)
async def get_school_status(child_id: str) -> SchoolStatusResponse:
    """Return today's school arrival/departure mock data."""
    now = datetime.now()
    school_day_over = now.hour >= 15

    return SchoolStatusResponse(
        child_id=child_id,
        school_name="Delhi Public School, Sector 45",
        date=_today_str(),
        arrival_time="08:05:14",
        departure_time="15:31:02" if school_day_over else None,
        arrived=True,
        departed=school_day_over,
        pickup_guardian="Priya Sharma (Mother)" if school_day_over else None,
        attendance_this_month=24,
        total_school_days=25,
        attendance_pct=96.0,
        status_message="Child safely at home." if school_day_over else "Child currently at school.",
    )


@router.get(
    "/kids/bus-tracking/{route_id}",
    response_model=BusTrackingResponse,
    summary="Get school bus live location and ETA",
    description="Returns the current position of the school bus on a given route and estimated arrival time at the child's stop.",
)
async def get_bus_tracking(route_id: str) -> BusTrackingResponse:
    """Return live bus mock tracking data."""
    rng = random.Random(route_id + _today_str())
    eta = rng.randint(8, 25)
    delay = rng.randint(0, 4)

    next_stops = [
        BusStop(name="Sector 14 Market Stop", eta_minutes=max(1, eta - 8), lat=28.5621, lng=77.0596),
        BusStop(name="DLF Phase 1 Gate", eta_minutes=max(1, eta - 4), lat=28.5654, lng=77.0623),
        BusStop(name="Your Stop — Block C", eta_minutes=eta, lat=28.5689, lng=77.0648),
    ]

    return BusTrackingResponse(
        route_id=route_id,
        route_name=f"Route {route_id.upper()} — Dwarka to School",
        bus_number=f"DL1PB{rng.randint(1000, 9999)}",
        driver_name="Ramesh Kumar",
        current_lat=28.5590 + rng.uniform(-0.01, 0.01),
        current_lng=77.0550 + rng.uniform(-0.01, 0.01),
        current_location_label="Sector 14, Dwarka",
        eta_minutes=eta,
        destination="Block C — Your Stop",
        speed_kmh=rng.randint(20, 45),
        next_stops=next_stops,
        last_updated=_now_str(),
        on_time=delay == 0,
        delay_minutes=delay,
    )


@router.post(
    "/kids/authorize-pickup",
    response_model=AuthorizePickupResponse,
    status_code=201,
    summary="Add an authorized pickup person",
    description="Adds a new person to the authorized pickup list for a child. Returns the newly created authorized person record.",
)
async def authorize_pickup(payload: AuthorizePickupRequest = Body(...)) -> AuthorizePickupResponse:
    """Register a new authorized pickup person."""
    if not payload.name.strip():
        raise HTTPException(status_code=422, detail="Name must not be empty.")
    if not payload.phone.strip():
        raise HTTPException(status_code=422, detail="Phone number is required.")

    person = AuthorizedPerson(
        id=f"auth_{payload.child_id}_{abs(hash(payload.name + payload.phone)) % 100000:05d}",
        name=payload.name.strip(),
        relation=payload.relation.strip() or "Guardian",
        phone=payload.phone.strip(),
        added_at=_now_str(),
        status="active",
    )

    return AuthorizePickupResponse(
        success=True,
        message=f"{payload.name} has been added to the authorized pickup list.",
        person=person,
    )


# ──────────────────────────────────────────────────────────────────────────────
# Elder endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get(
    "/elder/health-metrics/{user_id}",
    response_model=HealthMetricsResponse,
    summary="Get elder health monitoring data",
    description="Returns real-time health biometrics for an elder user including heart rate, blood pressure, steps, and sleep analysis.",
)
async def get_elder_health_metrics(user_id: str) -> HealthMetricsResponse:
    """Return realistic elder health metrics."""
    rng = random.Random(user_id + _today_str())

    hr = rng.randint(62, 88)
    systolic = rng.randint(112, 138)
    diastolic = rng.randint(72, 90)
    spo2 = round(rng.uniform(96.5, 99.5), 1)
    steps = rng.randint(2400, 5800)
    sleep_h = round(rng.uniform(5.5, 8.5), 2)

    hr_status: Literal["Normal", "Low", "Elevated", "High"] = (
        "Low" if hr < 60
        else "Elevated" if hr > 85
        else "High" if hr > 100
        else "Normal"
    )

    bp_status: Literal["Normal", "Pre-hypertension", "Hypertension Stage 1", "Hypertension Stage 2"] = (
        "Normal" if systolic < 120 and diastolic < 80
        else "Pre-hypertension" if systolic < 130
        else "Hypertension Stage 1" if systolic < 140
        else "Hypertension Stage 2"
    )

    sleep_quality: Literal["Poor", "Fair", "Good", "Excellent"] = (
        "Poor" if sleep_h < 6
        else "Fair" if sleep_h < 7
        else "Good" if sleep_h < 8
        else "Excellent"
    )

    # Weekly summary (steps per day for last 7 days)
    weekly_summary = {
        (date.today() - timedelta(days=i)).strftime("%a"): float(rng.randint(1800, 6000))
        for i in range(6, -1, -1)
    }

    return HealthMetricsResponse(
        user_id=user_id,
        elder_name="Rajan Sharma",
        age=74,
        timestamp=_now_str(),
        heart_rate_bpm=hr,
        heart_rate_status=hr_status,
        blood_pressure_systolic=systolic,
        blood_pressure_diastolic=diastolic,
        blood_pressure_status=bp_status,
        spo2_pct=spo2,
        steps_today=steps,
        steps_goal=5000,
        sleep_hours=sleep_h,
        sleep_quality=sleep_quality,
        sleep_start="23:04",
        sleep_end="06:27",
        calories_burned=rng.randint(1400, 2200),
        weight_kg=round(rng.uniform(65.0, 80.0), 1),
        temperature_c=round(rng.uniform(36.2, 37.2), 1),
        weekly_summary=weekly_summary,
    )


@router.get(
    "/elder/fall-alerts/{user_id}",
    response_model=FallAlertsResponse,
    summary="Get fall detection history",
    description="Returns fall detection status and historical fall events for an elder user.",
)
async def get_fall_alerts(user_id: str) -> FallAlertsResponse:
    """Return fall detection history mock data."""
    rng = random.Random(user_id)

    # Simulate a past event from 3 weeks ago
    past_event = FallEvent(
        id=f"fall_{user_id}_001",
        detected_at=(datetime.now() - timedelta(days=21)).strftime("%Y-%m-%dT%H:%M:%S"),
        location="Bathroom — Home",
        severity="Minor",
        response_time_seconds=38,
        resolved=True,
        notes="Elder confirmed she slipped but was not injured. No medical intervention required.",
    )

    emergency_contacts = [
        {"name": "Priya Sharma", "relation": "Daughter", "phone": "+91 98765 43210", "notified": True},
        {"name": "Rahul Sharma", "relation": "Son-in-law", "phone": "+91 98765 43211", "notified": True},
        {"name": "Dr. Arvind Nair", "relation": "Doctor", "phone": "+91 98765 43215", "notified": False},
    ]

    return FallAlertsResponse(
        user_id=user_id,
        elder_name="Rajan Sharma",
        detection_active=True,
        sensitivity="High",
        falls_this_week=0,
        falls_this_month=1,
        last_event=past_event,
        recent_events=[past_event],
        emergency_contacts=emergency_contacts,
        avg_response_time_seconds=45,
    )


@router.get(
    "/elder/medications/{user_id}",
    response_model=MedicationScheduleResponse,
    summary="Get elder medication schedule",
    description="Returns today's full medication schedule for an elder user, including taken/upcoming/missed status for each dose.",
)
async def get_medication_schedule(user_id: str) -> MedicationScheduleResponse:
    """Return today's medication schedule mock data."""
    now = datetime.now()
    current_hour = now.hour

    doses = [
        MedicationDose(
            id=f"{user_id}_med_001",
            name="Metformin 500mg",
            dosage="1 tablet with breakfast",
            scheduled_time="08:00",
            label="Morning",
            taken=current_hour >= 8,
            taken_at="08:07:33" if current_hour >= 8 else None,
            upcoming=False,
            missed=False,
        ),
        MedicationDose(
            id=f"{user_id}_med_002",
            name="Aspirin 75mg",
            dosage="1 tablet after lunch",
            scheduled_time="14:00",
            label="Afternoon",
            taken=current_hour >= 14,
            taken_at="14:03:10" if current_hour >= 14 else None,
            upcoming=12 <= current_hour < 14,
            missed=False,
        ),
        MedicationDose(
            id=f"{user_id}_med_003",
            name="Amlodipine 5mg",
            dosage="1 tablet after dinner",
            scheduled_time="20:00",
            label="Evening",
            taken=current_hour >= 20,
            taken_at="20:05:22" if current_hour >= 20 else None,
            upcoming=18 <= current_hour < 20,
            missed=False,
        ),
    ]

    taken_count = sum(1 for d in doses if d.taken)
    adherence_today = round((taken_count / len(doses)) * 100, 1) if doses else 0.0

    return MedicationScheduleResponse(
        user_id=user_id,
        elder_name="Rajan Sharma",
        date=_today_str(),
        doses=doses,
        adherence_today_pct=adherence_today,
        adherence_month_pct=94.2,
        missed_this_month=1,
        streak_days=14,
        next_reminder=(
            "Evening dose at 8:00 PM (Amlodipine 5mg)"
            if current_hour < 20
            else "Morning dose tomorrow at 8:00 AM (Metformin 500mg)"
        ),
    )


@router.post(
    "/elder/medication-taken",
    response_model=MedicationTakenResponse,
    summary="Mark a medication as taken",
    description="Marks a specific scheduled dose as taken by the elder user. Updates adherence metrics and notifies caregivers.",
)
async def mark_medication_taken(payload: MedicationTakenRequest = Body(...)) -> MedicationTakenResponse:
    """Record that an elder has taken a medication dose."""
    if not payload.user_id.strip():
        raise HTTPException(status_code=422, detail="user_id is required.")
    if not payload.dose_id.strip():
        raise HTTPException(status_code=422, detail="dose_id is required.")

    taken_at = payload.taken_at or _now_str()

    # Recalculate updated adherence (mock: always improves to 97–100)
    rng = random.Random(payload.dose_id)
    updated_adherence = round(rng.uniform(94.5, 99.8), 1)

    return MedicationTakenResponse(
        success=True,
        message=f"Dose recorded. Caregiver notification sent.",
        dose_id=payload.dose_id,
        taken_at=taken_at,
        updated_adherence_pct=updated_adherence,
    )
