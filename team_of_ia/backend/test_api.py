import urllib.request, json
req = urllib.request.Request("http://localhost:5000/login", json.dumps({"email": "lecteur@urbadrain.ma", "password": "password123"}).encode('utf-8'), {'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
token = json.loads(res.read())['access_token']

zones_req = urllib.request.Request("http://localhost:5000/zones", headers={'Authorization': f'Bearer {token}'})
zones_res = urllib.request.urlopen(zones_req)
zones = json.loads(zones_res.read())
print("ZONES COUNT:", len(zones))

try:
    alertes_req = urllib.request.Request("http://localhost:5000/alertes", headers={'Authorization': f'Bearer {token}'})
    urllib.request.urlopen(alertes_req)
except Exception as e:
    print("ALERTES ERROR:", e)
