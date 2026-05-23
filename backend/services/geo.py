"""Client IP extraction and lightweight geolocation lookup."""

import requests
from flask import Request


def get_client_ip(req: Request) -> str:
    forwarded = (req.headers.get("X-Forwarded-For") or "").strip()
    if forwarded:
        return forwarded.split(",")[0].strip()
    return (req.remote_addr or "unknown").strip()


def _is_private_ip(ip: str) -> bool:
    if ip in ("unknown", "127.0.0.1", "::1", "localhost"):
        return True
    if ip.startswith("192.168.") or ip.startswith("10.") or ip.startswith("172."):
        return True
    if ip.startswith("fe80:") or ip.startswith("169.254."):
        return True
    return False


def lookup_geo(ip: str) -> dict:
    if _is_private_ip(ip):
        return {
            "country": "Local network",
            "region": "Private IP",
            "city": ip,
        }

    try:
        res = requests.get(
            f"http://ip-api.com/json/{ip}",
            params={"fields": "status,country,regionName,city"},
            timeout=4,
        )
        if res.ok:
            data = res.json()
            if data.get("status") == "success":
                return {
                    "country": data.get("country") or "Unknown",
                    "region": data.get("regionName") or "Unknown",
                    "city": data.get("city") or "Unknown",
                }
    except requests.RequestException:
        pass

    return {"country": "Unknown", "region": "Unknown", "city": "Unknown"}
