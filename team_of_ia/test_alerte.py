import requests
import json

# Configuration
BASE_URL = "http://localhost:5000/api"
ADMIN_EMAIL = "admin@urba-drain-agadir.ma"
ADMIN_PASSWORD = "password123"

def test_citizen_notification(zone_id=6): # Zone 6 = Tilila
    print(f"--- TEST NOTIFICATION CITOYENS (ZONE {zone_id}) ---")

    # 1. Connexion en admin
    print(f"1. Connexion en tant que {ADMIN_EMAIL}...")
    login_data = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    try:
        res = requests.post(f"{BASE_URL}/login", json=login_data)
        res.raise_for_status()
        token = res.json().get("access_token")
        print("✓ Connecté. Token récupéré.")
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return

    # 2. Envoi de l'alerte citoyenne
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"zone_id": zone_id}
    
    print(f"2. Déclenchement manuel de l'alerte pour la zone {zone_id}...")
    try:
        res = requests.post(f"{BASE_URL}/alerts/send-citizen-emails", json=payload, headers=headers)
        status = res.status_code
        data = res.json()
        
        if status == 200:
            print(f"✓ SUCCÈS : {data.get('message')}")
            print(f"Emails envoyés: {data.get('emails_sent')}")
        elif status == 403:
            print(f"⚠️ REFUS (Règle Métier) : {data.get('error')}")
        else:
            print(f"❌ ERREUR {status} : {data.get('error')}")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'appel API: {e}")

if __name__ == "__main__":
    # Test sur Tilila (Zone 6)
    test_citizen_notification(6)
