from datetime import datetime, timedelta, timezone
from threading import Lock

PRESENCE_TTL = timedelta(seconds=45)

_lock = Lock()
# user_id -> {username, role, last_seen}
_sessions: dict[int, dict] = {}


def _now():
    return datetime.now(timezone.utc)


def heartbeat(user_id: int, username: str, role: str) -> dict:
    with _lock:
        _sessions[user_id] = {
            "user_id": user_id,
            "username": username,
            "role": role,
            "last_seen": _now(),
        }
        return _prune_and_snapshot()


def get_online() -> dict:
    with _lock:
        return _prune_and_snapshot()


def leave(user_id: int) -> None:
    with _lock:
        _sessions.pop(user_id, None)


def _prune_and_snapshot() -> dict:
    cutoff = _now() - PRESENCE_TTL
    stale = [uid for uid, s in _sessions.items() if s["last_seen"] < cutoff]
    for uid in stale:
        del _sessions[uid]

    users = [
        {
            "user_id": s["user_id"],
            "username": s["username"],
            "role": s["role"],
        }
        for s in sorted(_sessions.values(), key=lambda x: x["username"])
    ]
    return {
        "count": len(users),
        "users": users,
    }
