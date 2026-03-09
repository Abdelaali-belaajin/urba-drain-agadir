# app/services/pompe_service.py
# Fonctions pour les pompes

from app.database import fetch_all, fetch_one


def get_all_pompes(statut=None):
    # Liste toutes les pompes
    query = """
        SELECT 
            p.id_pompe,
            p.reference,
            p.nom,
            p.statut,
            p.capacite,
            p.mode_activation,
            p.derniere_activation,
            z.nom_zone
        FROM pompe p
        LEFT JOIN zone z ON p.id_zone = z.id_zone
        WHERE 1=1
    """
    
    params = []
    
    if statut:
        query += " AND p.statut = %s"
        params.append(statut)
    
    query += " ORDER BY p.reference"
    
    pompes = fetch_all(query, tuple(params) if params else None)
    return pompes


def get_pompe_by_id(pompe_id):
    # Détails d'une pompe
    query = """
        SELECT 
            p.*,
            z.nom_zone
        FROM pompe p
        LEFT JOIN zone z ON p.id_zone = z.id_zone
        WHERE p.id_pompe = %s
    """
    pompe = fetch_one(query, (pompe_id,))
    return pompe
