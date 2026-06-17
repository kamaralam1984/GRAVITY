"""
Redis caching layer — advanced mode.
Gracefully degrades to no-cache if Redis is unreachable.
"""
import redis as _redis
import json, os, logging
from typing import Any, Optional

log = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
PREFIX = "gravity:"

_client: Optional[_redis.Redis] = None


# ── Connection ────────────────────────────────────────────────────────────────

def _get() -> Optional[_redis.Redis]:
    global _client
    if _client is None:
        try:
            _client = _redis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            _client.ping()
            log.info("Redis connected ✓")
        except Exception as e:
            log.warning(f"Redis unavailable — caching disabled: {e}")
            _client = None
    return _client


def reconnect() -> bool:
    """Force reconnect (called on startup)."""
    global _client
    _client = None
    return _get() is not None


# ── Key builder ───────────────────────────────────────────────────────────────

def ck(*parts) -> str:
    """Build a namespaced cache key: gravity:<part1>:<part2>:..."""
    return PREFIX + ":".join(str(p) for p in parts)


# ── Core ops ──────────────────────────────────────────────────────────────────

def cget(key: str) -> Optional[Any]:
    """Get a cached value. Returns None on miss or Redis error."""
    try:
        r = _get()
        if r is None:
            return None
        raw = r.get(key)
        return json.loads(raw) if raw is not None else None
    except Exception:
        return None


def cset(key: str, value: Any, ttl: int = 60) -> None:
    """Cache a value with TTL in seconds. Silent no-op on error."""
    try:
        r = _get()
        if r is not None:
            r.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass


def cdel(*keys: str) -> None:
    """Delete one or more exact cache keys."""
    try:
        r = _get()
        if r and keys:
            r.delete(*keys)
    except Exception:
        pass


def cdel_pattern(pattern: str) -> int:
    """Delete all gravity:<pattern> keys. Returns count deleted."""
    try:
        r = _get()
        if r is None:
            return 0
        matched = r.keys(PREFIX + pattern)
        if matched:
            r.delete(*matched)
        return len(matched)
    except Exception:
        return 0


def flush() -> int:
    """Flush ALL gravity:* keys from Redis."""
    return cdel_pattern("*")


def ping() -> bool:
    try:
        r = _get()
        return r is not None and bool(r.ping())
    except Exception:
        return False


# ── Monitoring ────────────────────────────────────────────────────────────────

def stats() -> dict:
    """Return Redis health + cache performance metrics."""
    try:
        r = _get()
        if r is None:
            return {"connected": False, "error": "Redis not reachable"}
        s = r.info("stats")
        m = r.info("memory")
        c = r.info("clients")
        sv = r.info("server")
        gravity_keys = r.keys(PREFIX + "*")
        hits = s.get("keyspace_hits", 0)
        misses = s.get("keyspace_misses", 0)

        # Group gravity keys by namespace
        namespaces: dict[str, int] = {}
        for k in gravity_keys:
            ns = k.replace(PREFIX, "").split(":")[0]
            namespaces[ns] = namespaces.get(ns, 0) + 1

        return {
            "connected": True,
            "redis_version": sv.get("redis_version"),
            "gravity_keys": len(gravity_keys),
            "namespaces": namespaces,
            "hits": hits,
            "misses": misses,
            "hit_rate_pct": round(hits / max(1, hits + misses) * 100, 1),
            "used_memory": m.get("used_memory_human"),
            "peak_memory": m.get("used_memory_peak_human"),
            "connected_clients": c.get("connected_clients"),
            "evicted_keys": s.get("evicted_keys", 0),
            "expired_keys": s.get("expired_keys", 0),
            "total_commands": s.get("total_commands_processed", 0),
        }
    except Exception as e:
        return {"connected": False, "error": str(e)}


# ── TTL constants (seconds) ───────────────────────────────────────────────────

class TTL:
    LIVE_LOCATION  = 10    # family live map — very fresh
    MEMBERS        = 15    # family member list with status
    LOC_HISTORY    = 15    # user location trail
    USER_FAMILIES  = 30    # list of families a user belongs to
    ADMIN_SOS      = 30    # SOS alerts list
    ADMIN_SUPPORT  = 60    # support tickets
    USER_PROFILE   = 60    # /auth/me
    ADMIN_USERS    = 60    # admin user list (paginated)
    ADMIN_STATS    = 120   # platform-wide KPIs
    ADMIN_REVENUE  = 120   # revenue & payment history
    ADMIN_SUBS     = 120   # all subscriptions
    PLANS          = 3600  # pricing plans (rarely change)
