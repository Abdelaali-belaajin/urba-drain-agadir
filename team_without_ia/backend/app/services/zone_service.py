# app/services/zone_service.py
# Fonctions pour récupérer les zones depuis la base de données

from app.database import fetch_all, fetch_one, execute_query


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


def create_zone(nom_zone, superficie, population, latitude, longitude, niveau_risque):
    # Créer une nouvelle zone
    query = """
        INSERT INTO zone (nom_zone, superficie, population, latitude, longitude, niveau_risque)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    execute_query(query, (nom_zone, superficie, population, latitude, longitude, niveau_risque), commit=True)
    
    # Récupérer l'ID de la zone créée
    last_id_query = "SELECT LAST_INSERT_ID() as id"
    result = fetch_one(last_id_query)
    return result['id']


def update_zone(zone_id, nom_zone, superficie, population, niveau_risque):
    # Modifier une zone existante
    query = """
        UPDATE zone 
        SET nom_zone = %s, superficie = %s, population = %s, niveau_risque = %s
        WHERE id_zone = %s
    """
    rows = execute_query(query, (nom_zone, superficie, population, niveau_risque, zone_id), commit=True)
    return rows > 0


def delete_zone(zone_id):
    # Supprimer une zone
    # Vérifier d'abord s'il y a des capteurs ou pompes
    check_query = """
        SELECT 
            COUNT(c.id_capteur) as nb_capteurs,
            COUNT(p.id_pompe) as nb_pompes
        FROM zone z
        LEFT JOIN capteur c ON z.id_zone = c.id_zone
        LEFT JOIN pompe p ON z.id_zone = p.id_zone
        WHERE z.id_zone = %s
        GROUP BY z.id_zone
    """
    result = fetch_one(check_query, (zone_id,))
    
    if result and (result['nb_capteurs'] > 0 or result['nb_pompes'] > 0):
        return False, "Cannot delete zone with active capteurs or pompes"
    
    query = "DELETE FROM zone WHERE id_zone = %s"
    rows = execute_query(query, (zone_id,), commit=True)
    return rows > 0, "Zone deleted successfully"
