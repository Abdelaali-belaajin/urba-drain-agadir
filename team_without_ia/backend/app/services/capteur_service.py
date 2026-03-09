# app/services/capteur_service.py
# Fonctions pour les capteurs

from app.database import fetch_all, fetch_one


def get_all_capteurs(type_capteur=None, statut=None):
    # Liste tous les capteurs avec filtres optionnels
    query = """
        SELECT 
            c.id_capteur,
            c.reference,
            c.type_capteur,
            c.statut,
            c.localisation,
            c.derniere_lecture,
            c.seuil_critique,
            z.nom_zone
        FROM capteur c
        LEFT JOIN zone z ON c.id_zone = z.id_zone
        WHERE 1=1
    """
    
    params = []
    
    # Ajouter le filtre de type si demandé
    if type_capteur:
        query += " AND c.type_capteur = %s"
        params.append(type_capteur)
    
    # Ajouter le filtre de statut si demandé
    if statut:
        query += " AND c.statut = %s"
        params.append(statut)
    
    query += " ORDER BY c.reference"
    
    capteurs = fetch_all(query, tuple(params) if params else None)
    return capteurs


def get_capteur_by_id(capteur_id):
    # Détails d'un capteur précis
    query = """
        SELECT 
            c.*,
            z.nom_zone
        FROM capteur c
        LEFT JOIN zone z ON c.id_zone = z.id_zone
        WHERE c.id_capteur = %s
    """
    capteur = fetch_one(query, (capteur_id,))
    return capteur


def get_capteurs_critiques():
    # Capteurs qui dépassent le seuil critique
    query = """
        SELECT 
            c.id_capteur,
            c.reference,
            c.type_capteur,
            c.derniere_lecture,
            c.seuil_critique,
            z.nom_zone
        FROM capteur c
        LEFT JOIN zone z ON c.id_zone = z.id_zone
        WHERE c.derniere_lecture > c.seuil_critique
        AND c.statut = 'ACTIF'
    """
    capteurs = fetch_all(query)
    return capteurs
