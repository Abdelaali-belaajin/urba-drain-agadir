# app/services/zone_service.py
# Fonctions pour récupérer les zones depuis la base de données

from app.database import fetch_all, fetch_one


def get_all_zones():
    # Récupère toutes les zones
    query = """
        SELECT id_zone, nom_zone, superficie, population, 
               latitude, longitude, niveau_risque
        FROM zone
        ORDER BY nom_zone
    """
    zones = fetch_all(query)
    return zones


def get_zone_by_id(zone_id):
    # Récupère une zone précise avec ses stats
    query = """
        SELECT 
            z.id_zone,
            z.nom_zone,
            z.superficie,
            z.population,
            z.niveau_risque,
            COUNT(DISTINCT c.id_capteur) as nombre_capteurs,
            COUNT(DISTINCT p.id_pompe) as nombre_pompes
        FROM zone z
        LEFT JOIN capteur c ON z.id_zone = c.id_zone
        LEFT JOIN pompe p ON z.id_zone = p.id_zone
        WHERE z.id_zone = %s
        GROUP BY z.id_zone
    """
    zone = fetch_one(query, (zone_id,))
    return zone
