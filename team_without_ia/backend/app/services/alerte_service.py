# app/services/alerte_service.py
"""
Service pour la gestion des alertes du système de drainage
"""

from app.database import execute_query


def get_all_alertes(statut=None, severite=None, zone_id=None, type_alerte=None):
    """
    Récupère toutes les alertes avec filtres optionnels
    
    Args:
        statut: Filtrer par statut (ACTIVE, ACQUITTEE, RESOLUE, IGNOREE)
        severite: Filtrer par sévérité (INFO, AVERTISSEMENT, CRITIQUE, URGENCE)
        zone_id: Filtrer par zone
        type_alerte: Filtrer par type (NIVEAU_ELEVE, PANNE_CAPTEUR, PANNE_POMPE, MAINTENANCE)
    
    Returns:
        Liste des alertes avec informations associées
    """
    query = """
        SELECT 
            a.id_alerte,
            a.type_alerte,
            a.niveau_severite,
            a.statut,
            a.titre,
            a.message,
            a.timestamp_creation,
            a.timestamp_acquittement,
            a.timestamp_resolution,
            a.utilisateur_acquittement,
            a.actions_prises,
            a.id_capteur,
            a.id_pompe,
            a.id_zone,
            z.nom_zone,
            c.reference AS reference_capteur,
            p.reference AS reference_pompe
        FROM alerte a
        LEFT JOIN zone z ON a.id_zone = z.id_zone
        LEFT JOIN capteur c ON a.id_capteur = c.id_capteur
        LEFT JOIN pompe p ON a.id_pompe = p.id_pompe
        WHERE 1=1
    """
    
    params = []
    
    if statut:
        query += " AND a.statut = %s"
        params.append(statut)
    
    if severite:
        query += " AND a.niveau_severite = %s"
        params.append(severite)
    
    if zone_id:
        query += " AND a.id_zone = %s"
        params.append(zone_id)
    
    if type_alerte:
        query += " AND a.type_alerte = %s"
        params.append(type_alerte)
    
    query += " ORDER BY a.timestamp_creation DESC"
    
    results = execute_query(query, tuple(params) if params else None)
    return results if results else []


def get_alerte_by_id(alerte_id):
    """
    Récupère les détails complets d'une alerte par son ID
    
    Args:
        alerte_id: ID de l'alerte
    
    Returns:
        Dictionnaire contenant les détails de l'alerte
    """
    query = """
        SELECT 
            a.id_alerte,
            a.type_alerte,
            a.niveau_severite,
            a.statut,
            a.titre,
            a.message,
            a.timestamp_creation,
            a.timestamp_acquittement,
            a.timestamp_resolution,
            a.utilisateur_acquittement,
            a.actions_prises,
            a.id_capteur,
            a.id_pompe,
            a.id_zone,
            z.nom_zone,
            z.niveau_risque,
            c.reference AS reference_capteur,
            c.localisation AS localisation_capteur,
            p.reference AS reference_pompe,
            p.nom AS nom_pompe
        FROM alerte a
        LEFT JOIN zone z ON a.id_zone = z.id_zone
        LEFT JOIN capteur c ON a.id_capteur = c.id_capteur
        LEFT JOIN pompe p ON a.id_pompe = p.id_pompe
        WHERE a.id_alerte = %s
    """
    
    results = execute_query(query, (alerte_id,))
    return results[0] if results else None


def create_alerte(type_alerte, niveau_severite, titre, message, id_zone, id_capteur=None, id_pompe=None):
    """
    Crée une nouvelle alerte manuelle
    
    Args:
        type_alerte: Type d'alerte (NIVEAU_ELEVE, PANNE_CAPTEUR, PANNE_POMPE, MAINTENANCE)
        niveau_severite: Sévérité (INFO, AVERTISSEMENT, CRITIQUE, URGENCE)
        titre: Titre de l'alerte
        message: Message descriptif
        id_zone: ID de la zone concernée
        id_capteur: ID du capteur concerné (optionnel)
        id_pompe: ID de la pompe concernée (optionnel)
    
    Returns:
        ID de l'alerte créée
    """
    query = """
        INSERT INTO alerte 
        (type_alerte, niveau_severite, statut, titre, message, id_zone, id_capteur, id_pompe)
        VALUES (%s, %s, 'ACTIVE', %s, %s, %s, %s, %s)
    """
    
    execute_query(query, (type_alerte, niveau_severite, titre, message, id_zone, id_capteur, id_pompe), commit=True)
    
    # Récupérer l'ID de l'alerte créée
    result = execute_query("SELECT LAST_INSERT_ID() as id")
    return result[0]['id'] if result else None


def acquitter_alerte(alerte_id, utilisateur):
    """
    Acquitte une alerte (opérateur prend en charge)
    
    Args:
        alerte_id: ID de l'alerte
        utilisateur: Nom d'utilisateur qui acquitte
    
    Returns:
        True si succès, False sinon
    """
    query = """
        UPDATE alerte 
        SET statut = 'ACQUITTEE',
            timestamp_acquittement = NOW(),
            utilisateur_acquittement = %s
        WHERE id_alerte = %s AND statut = 'ACTIVE'
    """
    
    rows = execute_query(query, (utilisateur, alerte_id), commit=True)
    return rows > 0


def resoudre_alerte(alerte_id, utilisateur, actions_prises):
    """
    Résout une alerte (problème traité)
    
    Args:
        alerte_id: ID de l'alerte
        utilisateur: Nom d'utilisateur qui résout
        actions_prises: Description des actions effectuées
    
    Returns:
        True si succès, False sinon
    """
    query = """
        UPDATE alerte 
        SET statut = 'RESOLUE',
            timestamp_resolution = NOW(),
            utilisateur_acquittement = COALESCE(utilisateur_acquittement, %s),
            timestamp_acquittement = COALESCE(timestamp_acquittement, NOW()),
            actions_prises = %s
        WHERE id_alerte = %s AND statut IN ('ACTIVE', 'ACQUITTEE')
    """
    
    rows = execute_query(query, (utilisateur, actions_prises, alerte_id), commit=True)
    return rows > 0


def ignorer_alerte(alerte_id, utilisateur, raison):
    """
    Ignore une alerte (fausse alerte)
    
    Args:
        alerte_id: ID de l'alerte
        utilisateur: Nom d'utilisateur
        raison: Raison de l'ignorance
    
    Returns:
        True si succès, False sinon
    """
    query = """
        UPDATE alerte 
        SET statut = 'IGNOREE',
            timestamp_resolution = NOW(),
            utilisateur_acquittement = %s,
            actions_prises = %s
        WHERE id_alerte = %s AND statut IN ('ACTIVE', 'ACQUITTEE')
    """
    
    rows = execute_query(query, (utilisateur, raison, alerte_id), commit=True)
    return rows > 0


def get_alertes_actives():
    """
    Récupère uniquement les alertes actives (non traitées)
    
    Returns:
        Liste des alertes actives
    """
    return get_all_alertes(statut='ACTIVE')


def get_alertes_critiques():
    """
    Récupère les alertes actives de niveau CRITIQUE ou URGENCE
    
    Returns:
        Liste des alertes critiques
    """
    query = """
        SELECT 
            a.id_alerte,
            a.type_alerte,
            a.niveau_severite,
            a.statut,
            a.titre,
            a.message,
            a.timestamp_creation,
            a.id_zone,
            z.nom_zone,
            c.reference AS reference_capteur,
            p.reference AS reference_pompe
        FROM alerte a
        LEFT JOIN zone z ON a.id_zone = z.id_zone
        LEFT JOIN capteur c ON a.id_capteur = c.id_capteur
        LEFT JOIN pompe p ON a.id_pompe = p.id_pompe
        WHERE a.statut = 'ACTIVE'
          AND a.niveau_severite IN ('CRITIQUE', 'URGENCE')
        ORDER BY 
            CASE a.niveau_severite
                WHEN 'URGENCE' THEN 1
                WHEN 'CRITIQUE' THEN 2
            END,
            a.timestamp_creation DESC
    """
    
    results = execute_query(query)
    return results if results else []


def get_alertes_stats():
    """
    Récupère les statistiques des alertes
    
    Returns:
        Dictionnaire avec statistiques
    """
    # Total par statut
    query_statut = """
        SELECT 
            statut,
            COUNT(*) as count
        FROM alerte
        GROUP BY statut
    """
    
    # Total par sévérité (alertes actives)
    query_severite = """
        SELECT 
            niveau_severite,
            COUNT(*) as count
        FROM alerte
        WHERE statut = 'ACTIVE'
        GROUP BY niveau_severite
    """
    
    # Alertes par zone (actives)
    query_zone = """
        SELECT 
            z.nom_zone,
            COUNT(a.id_alerte) as count
        FROM alerte a
        JOIN zone z ON a.id_zone = z.id_zone
        WHERE a.statut = 'ACTIVE'
        GROUP BY z.id_zone, z.nom_zone
        ORDER BY count DESC
        LIMIT 5
    """
    
    # Total aujourd'hui
    query_aujourdhui = """
        SELECT COUNT(*) as count
        FROM alerte
        WHERE DATE(timestamp_creation) = CURDATE()
    """
    
    stats_statut = execute_query(query_statut)
    stats_severite = execute_query(query_severite)
    stats_zone = execute_query(query_zone)
    stats_aujourdhui = execute_query(query_aujourdhui)
    
    return {
        'par_statut': stats_statut if stats_statut else [],
        'par_severite': stats_severite if stats_severite else [],
        'par_zone': stats_zone if stats_zone else [],
        'total_aujourdhui': stats_aujourdhui[0]['count'] if stats_aujourdhui else 0
    }
