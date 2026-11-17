import sys
import uuid
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_auth_and_user_flows():
    print("--- 1. Testing Registration Endpoint ---")
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"testuser_{unique_suffix}@ronda.test"
    test_password = "password_porteño_123"
    test_name = "Martín Palermo"

    reg_payload = {
        "name": test_name,
        "email": test_email,
        "password": test_password,
        "neighborhood": "Palermo",
        "pet_friendly": True,
        "vegetarian_friendly": False,
        "budget_preference": "$$"
    }

    r = client.post("/api/auth/register", json=reg_payload)
    assert r.status_code == 200, f"Register failed: {r.status_code} - {r.text}"
    reg_data = r.json()

    print(f"Register response keys: {list(reg_data.keys())}")
    # Verify contract: backend returns UserProfileResponse directly
    assert "id" in reg_data
    assert "token" in reg_data
    assert reg_data["name"] == test_name
    assert reg_data["email"] == test_email
    assert reg_data["neighborhood"] == "Palermo"
    assert reg_data["pet_friendly"] is True
    assert reg_data["token"].startswith("tok_")

    token = reg_data["token"]
    print(f"✅ User registered: id={reg_data['id']}, token={token[:10]}...")

    # Verify frontend logic compatibility:
    # `user = data.user || data`
    frontend_user_reg = reg_data.get("user") or reg_data
    assert frontend_user_reg["id"] == reg_data["id"]
    assert frontend_user_reg["name"] == test_name
    print("✅ Frontend contract 'data.user || data' resolved immediately without refresh.")

    print("\n--- 2. Testing Login Endpoint ---")
    login_payload = {
        "email": test_email,
        "password": test_password
    }
    r = client.post("/api/auth/login", json=login_payload)
    assert r.status_code == 200, f"Login failed: {r.status_code} - {r.text}"
    login_data = r.json()

    print(f"Login response keys: {list(login_data.keys())}")
    assert "id" in login_data
    assert "token" in login_data
    assert login_data["name"] == test_name
    assert login_data["email"] == test_email
    new_token = login_data["token"]
    print(f"✅ User logged in successfully: new token={new_token[:10]}...")

    frontend_user_login = login_data.get("user") or login_data
    assert frontend_user_login["id"] == login_data["id"]
    assert frontend_user_login["name"] == test_name
    print("✅ Frontend contract 'data.user || data' resolved immediately for login.")

    print("\n--- 3. Testing GET /api/auth/me (Session restore / token verify) ---")
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {new_token}"})
    assert r.status_code == 200, f"Auth me failed: {r.status_code} - {r.text}"
    me_data = r.json()
    assert me_data["id"] == login_data["id"]
    assert me_data["email"] == test_email
    print(f"✅ Token verified by /api/auth/me for user: {me_data['name']}")

    print("\n--- 4. Testing PUT /api/user/preferences ---")
    pref_payload = {
        "neighborhood": "Chacarita",
        "budget_preference": "$$$",
        "pet_friendly": False,
        "vegetarian_friendly": True
    }
    r = client.put("/api/user/preferences", json=pref_payload, headers={"Authorization": f"Bearer {new_token}"})
    assert r.status_code == 200, f"Preferences update failed: {r.status_code} - {r.text}"
    pref_data = r.json()
    assert pref_data["neighborhood"] == "Chacarita"
    assert pref_data["budget_preference"] == "$$$"
    assert pref_data["vegetarian_friendly"] is True
    print("✅ User preferences updated reactively.")

    print("\n--- 5. Testing POST /api/user/saved-plans & DELETE ---")
    test_plan = {
        "id": f"plan_test_{unique_suffix}",
        "title": "Tarde de vermut en Chacarita",
        "neighborhood": "Chacarita",
        "mood": "amigos",
        "estimated_cost": "$$$",
        "narrative_summary": "Paseo por los bares y esquinas de Chacarita",
        "schedule": [
            {
                "time_slot": "18:00 - 19:30",
                "place_name": "Sede Vermutería",
                "address": "Guevara 421",
                "activity_type": "Vermut & tapeo",
                "duration_minutes": 90,
                "porteño_tip": "Pedir el vermut de la casa con sifón"
            }
        ]
    }
    # Test wrapped as { "plan": targetPlan } (frontend payload)
    r = client.post("/api/user/saved-plans", json={"plan": test_plan}, headers={"Authorization": f"Bearer {new_token}"})
    assert r.status_code == 200, f"Save plan failed: {r.status_code} - {r.text}"
    saved_data = r.json()
    assert len(saved_data["saved_plans"]) >= 1
    saved_first = saved_data["saved_plans"][0]
    assert saved_first["id"] == test_plan["id"]
    assert saved_first["title"] == test_plan["title"]
    print("✅ Saved plan persisted and returned in profile response.")

    # Remove plan
    r = client.delete(f"/api/user/saved-plans/{test_plan['id']}", headers={"Authorization": f"Bearer {new_token}"})
    assert r.status_code == 200
    after_del = r.json()
    assert not any(p["id"] == test_plan["id"] for p in after_del["saved_plans"])
    print("✅ Plan removed from profile.")

    print("\n--- 6. Testing Favorite Toggle ---")
    fav_place = "palermo_cuervo_cafe"
    r = client.post(f"/api/user/favorites/{fav_place}", headers={"Authorization": f"Bearer {new_token}"})
    assert r.status_code == 200
    fav_data = r.json()
    assert fav_place in fav_data["favorite_place_ids"]
    print(f"✅ Place '{fav_place}' added to favorites.")

    # Toggle off
    r = client.post(f"/api/user/favorites/{fav_place}", headers={"Authorization": f"Bearer {new_token}"})
    assert r.status_code == 200
    fav_data2 = r.json()
    assert fav_place not in fav_data2["favorite_place_ids"]
    print(f"✅ Place '{fav_place}' toggled off from favorites.")

    print("\n🎉 ALL AUTHENTICATION & USER REACTIVITY TESTS PASSED!")

if __name__ == "__main__":
    test_auth_and_user_flows()
