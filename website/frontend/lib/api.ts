const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ── Storage helpers ──────────────────────────────────────────────
export const getAdminToken = () => typeof window !== "undefined" ? localStorage.getItem("gravity_admin_token") : null
export const getUserToken = () => typeof window !== "undefined" ? localStorage.getItem("gravity_user_token") : null
export const setAdminToken = (t: string) => localStorage.setItem("gravity_admin_token", t)
export const clearAdminAuth = () => { localStorage.removeItem("gravity_admin_token"); localStorage.removeItem("gravity_admin_auth") }

// ── Base fetch wrapper ───────────────────────────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}, useAdminToken = false): Promise<T> {
  const token = useAdminToken ? getAdminToken() : getUserToken()
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> || {}) }
  if (token) headers["Authorization"] = "Bearer " + token
  const res = await fetch(BASE + path, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(err.detail || "Request failed")
  }
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────
export interface AdminLoginResponse { access_token: string; token_type: string; admin: { id: number; name: string; email: string; role: string } }
export interface DashboardStats { total_families: number; total_users: number; total_devices: number; online_devices: number; offline_devices: number; low_battery_devices: number; active_sos_alerts: number; total_sos_month: number; mrr_inr: number; premium_families: number; family_plan_families: number; free_families: number; recent_sos: any[]; recent_families: any[] }
export interface FamilyItem { id: number; name: string; plan: string; member_count: number; created_at: string; monthly_spend: number; status: string }
export interface DeviceItem { id: number; device_name: string; os: string; os_version: string; app_version: string; battery_level: number; is_online: boolean; last_seen: string; owner_name: string; owner_id: number }
export interface SOSAlert { id: number; user_name: string; family_name: string; place_name: string; lat: number; lng: number; triggered_at: string; resolved_at?: string; status: string }
export interface Notification { id: number; title: string; body: string; type: string; target: string; sent_count: number; delivered_count: number; opened_count: number; sent_at: string }

// ── Admin API ─────────────────────────────────────────────────────
export const adminApi = {
  login: (email: string, password: string) =>
    apiFetch<AdminLoginResponse>("/admin-api/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  dashboard: () => apiFetch<DashboardStats>("/admin-api/dashboard", {}, true),

  families: (skip = 0, limit = 20, plan?: string) => {
    const q = new URLSearchParams({ skip: String(skip), limit: String(limit) })
    if (plan) q.set("plan", plan)
    return apiFetch<{ total: number; families: FamilyItem[] }>("/admin-api/families?" + q, {}, true)
  },

  devices: (skip = 0, limit = 20, status?: string) => {
    const q = new URLSearchParams({ skip: String(skip), limit: String(limit) })
    if (status) q.set("status", status)
    return apiFetch<{ total: number; devices: DeviceItem[] }>("/admin-api/devices?" + q, {}, true)
  },

  sosAlerts: (status?: string) => {
    const q = status ? "?status=" + status : ""
    return apiFetch<{ total: number; alerts: SOSAlert[] }>("/admin-api/sos-alerts" + q, {}, true)
  },

  resolveSOS: (id: number) =>
    apiFetch("/admin-api/sos-alerts/" + id + "/resolve", { method: "PATCH" }, true),

  notifications: () => apiFetch<{ total: number; notifications: Notification[] }>("/admin-api/notifications", {}, true),

  sendNotification: (data: { title: string; body: string; type: string; target: string }) =>
    apiFetch("/admin-api/notifications/send", { method: "POST", body: JSON.stringify(data) }, true),

  analytics: () => apiFetch<any>("/admin-api/analytics", {}, true),
}

// ── User Auth API ────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string, phone?: string) =>
    apiFetch<any>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, phone }) }),

  login: (email: string, password: string) =>
    apiFetch<any>("/auth/login/json", { method: "POST", body: JSON.stringify({ name: "", email, password }) }),

  me: () => apiFetch<any>("/auth/me"),
}

// ── Families API ─────────────────────────────────────────────────
export const familiesApi = {
  create: (name: string) => apiFetch<any>("/families/create", { method: "POST", body: JSON.stringify({ name }) }),
  join: (inviteCode: string) => apiFetch<any>("/families/join/" + inviteCode, { method: "POST" }),
  my: () => apiFetch<any[]>("/families/my"),
  members: (familyId: number) => apiFetch<any[]>("/families/" + familyId + "/members"),
}

// ── Devices API ──────────────────────────────────────────────────
export const devicesApi = {
  register: (data: any) => apiFetch<any>("/devices/register", { method: "POST", body: JSON.stringify(data) }),
  updateBattery: (deviceId: number, battery: number, online: boolean) =>
    apiFetch<any>("/devices/" + deviceId + "/battery", { method: "PATCH", body: JSON.stringify({ battery_level: battery, is_online: online }) }),
  my: () => apiFetch<any[]>("/devices/my"),
  revoke: (deviceId: number) => apiFetch<any>("/devices/" + deviceId, { method: "DELETE" }),
}

// ── Location API ─────────────────────────────────────────────────
export const locationApi = {
  update: (lat: number, lng: number, place?: string) =>
    apiFetch<any>("/location/update", { method: "POST", body: JSON.stringify({ lat, lng, place_name: place }) }),
  history: (userId: number, limit = 50) => apiFetch<any[]>("/location/history/" + userId + "?limit=" + limit),
  liveFamilyLocations: (familyId: number) => apiFetch<any[]>("/location/live/" + familyId),
}

// ── Geofences API ────────────────────────────────────────────────
export const geofencesApi = {
  create: (data: any) => apiFetch<any>("/geofences/", { method: "POST", body: JSON.stringify(data) }),
  family: (familyId: number) => apiFetch<any[]>("/geofences/family/" + familyId),
  logEvent: (data: any) => apiFetch<any>("/geofences/event", { method: "POST", body: JSON.stringify(data) }),
  events: (limit = 50) => apiFetch<any[]>("/geofences/events?limit=" + limit),
}

// ── SOS API ──────────────────────────────────────────────────────
export const sosApi = {
  trigger: (familyId: number, lat?: number, lng?: number, place?: string, message?: string) =>
    apiFetch<any>("/sos/trigger", { method: "POST", body: JSON.stringify({ family_id: familyId, lat, lng, place_name: place, message }) }),
  active: () => apiFetch<any[]>("/sos/active"),
  resolve: (alertId: number) => apiFetch<any>("/sos/" + alertId + "/resolve", { method: "PATCH" }),
  history: (familyId: number) => apiFetch<any[]>("/sos/history/" + familyId),
}

// ── Chat API ─────────────────────────────────────────────────────
export const chatApi = {
  send: (familyId: number, content: string, type = "text") =>
    apiFetch<any>("/chat/send", { method: "POST", body: JSON.stringify({ family_id: familyId, content, type }) }),
  messages: (familyId: number, limit = 50) => apiFetch<any[]>("/chat/family/" + familyId + "?limit=" + limit),
  report: (messageId: number) => apiFetch<any>("/chat/" + messageId + "/report", { method: "POST" }),
  delete: (messageId: number) => apiFetch<any>("/chat/" + messageId, { method: "DELETE" }, true),
  stats: () => apiFetch<any>("/chat/stats"),
}

// ── Health API ───────────────────────────────────────────────────
export const healthApi = {
  saveRecord: (data: any) => apiFetch<any>("/health/record", { method: "POST", body: JSON.stringify(data) }),
  records: (userId: number, limit = 30) => apiFetch<any[]>("/health/records/" + userId + "?limit=" + limit),
  addMedication: (data: any) => apiFetch<any>("/health/medication", { method: "POST", body: JSON.stringify(data) }),
  medications: (userId: number) => apiFetch<any[]>("/health/medications/" + userId),
  stats: () => apiFetch<any>("/health/stats"),
}

// ── Journey API ──────────────────────────────────────────────────
export const journeysApi = {
  start: (from?: string, to?: string) => apiFetch<any>("/journeys/start", { method: "POST", body: JSON.stringify({ from_location: from, to_location: to }) }),
  addPoint: (journeyId: number, lat: number, lng: number, speed?: number) =>
    apiFetch<any>("/journeys/point", { method: "POST", body: JSON.stringify({ journey_id: journeyId, lat, lng, speed }) }),
  complete: (journeyId: number) => apiFetch<any>("/journeys/" + journeyId + "/complete", { method: "PATCH" }),
  active: () => apiFetch<any>("/journeys/active"),
  stats: () => apiFetch<any>("/journeys/stats"),
}

// ── Plans API ────────────────────────────────────────────────────
export const plansApi = {
  list: () => apiFetch<any>("/plans/"),
  subscribe: (familyId: number, plan: string, paymentMethod?: string) =>
    apiFetch<any>("/plans/subscribe", { method: "POST", body: JSON.stringify({ family_id: familyId, plan, payment_method: paymentMethod }) }),
  stats: () => apiFetch<any>("/plans/stats"),
}

// ── Driving API ──────────────────────────────────────────────────
export const drivingApi = {
  logEvent: (type: string, speed?: number, severity = "medium") =>
    apiFetch<any>("/driving/event", { method: "POST", body: JSON.stringify({ type, speed, severity }) }),
  events: (limit = 50) => apiFetch<any[]>("/driving/events?limit=" + limit),
  stats: () => apiFetch<any>("/driving/stats"),
}
