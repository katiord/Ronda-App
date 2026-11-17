import sys
from pathlib import Path
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing GET /api/health...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print(f"Health response: {r.json()}")

    print("Testing GET /api/places?neighborhood=San Telmo...")
    r = client.get("/api/places?neighborhood=San Telmo")
    assert r.status_code == 200
    places = r.json()
    assert len(places) >= 5
    print(f"San Telmo places count: {len(places)}")

    print("Testing POST /api/plans/generate (Standard)...")
    payload = {
        "neighborhood": "San Telmo",
        "time_of_day": "afternoon",
        "mood": "cultural",
        "price_tier": "$$",
        "custom_notes": "Ganas de caminar y merendar rico"
    }
    r = client.post("/api/plans/generate", json=payload)
    assert r.status_code == 200, f"Generate plan failed: {r.text}"
    plan = r.json()
    assert "title" in plan
    assert "schedule" in plan
    assert len(plan["schedule"]) >= 2
    print(f"Plan generado con exito: '{plan['title']}' con {len(plan['schedule'])} paradas.")

    print("Testing POST /api/plans/generate (Espontaneo - Madrugada 01:20 am)...")
    spontaneous_payload = {
        "neighborhood": "Palermo",
        "time_of_day": "night",
        "mood": "amigos",
        "price_tier": "$$",
        "start_time": "01:20",
        "is_now": True
    }
    r2 = client.post("/api/plans/generate", json=spontaneous_payload)
    assert r2.status_code == 200, f"Generate plan failed: {r2.text}"
    plan2 = r2.json()
    first_slot = plan2["schedule"][0]["time_slot"]
    print(f"Madrugada schedule slot 1: {first_slot}")
    assert first_slot.startswith("01:35"), f"Expected slot starting at 01:35, got {first_slot}"
    print("Madrugada schedule validated: dynamic timing starting after consultation time!")

    print("Testing POST /api/auth/google (Zero-PII Architecture)...")
    r_auth = client.post("/api/auth/google", json={
        "google_sub": "katia@gmail.com",
        "neighborhood": "Colegiales"
    })
    assert r_auth.status_code == 200, f"Google auth failed: {r_auth.text}"
    auth_data = r_auth.json()
    assert auth_data["id"].startswith("g_"), f"Expected hashed id starting with g_, got {auth_data['id']}"
    assert auth_data["email"] == "", f"Server must not return or store real email, got {auth_data['email']}"
    assert len(auth_data["saved_plans"]) >= 1, "Expected Katia's Colegiales saved plan to be preserved under Zero-PII hash"

    users_file = Path(__file__).resolve().parent / "data" / "users.json"
    raw_users_text = users_file.read_text(encoding="utf-8")
    assert "katia@gmail.com" not in raw_users_text, "PII leak: email found in users.json!"
    assert "password_hash" not in raw_users_text, "PII leak: password_hash found in users.json!"
    assert '"salt"' not in raw_users_text, "PII leak: salt found in users.json!"
    assert '"email"' not in raw_users_text, "PII leak: email key found in users.json!"
    assert '"name"' not in raw_users_text, "PII leak: name key found in users.json!"
    print("Zero-PII Google Auth validated: no emails, names, or passwords stored on disk!")

if __name__ == "__main__":
    test_endpoints()
    print("ALL API ENDPOINT TESTS PASSED!")
