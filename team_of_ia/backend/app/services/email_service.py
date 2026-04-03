import logging
from datetime import datetime
from db import db
from app.models.citoyen import Citoyen
from app.models.citoyen_alert_log import CitoyenAlertLog
from app.models.zone import Zone

# Configuration du logger pour simuler l'envoi d'emails
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EmailService")

def send_zone_alert_email(zone, citoyens):
    """
    Simule l'envoi d'un email d'alerte aux citoyens d'une zone sensible.
    """
    if not citoyens:
        logger.info(f"Aucun citoyen à notifier pour la zone {zone.nom_zone}")
        return 0

    niveau = zone.niveau_risque # CRITIQUE ou ELEVE
    logger.info(f"--- DÉBUT ENVOI EMAILS ALERTE [{niveau}] [ZONE: {zone.nom_zone}] ---")
    for c in citoyens:
        # Simulation d'envoi
        print(f"📧 [EMAIL SENT] To: {c.email} | Subject: ⚠️ ALERTE {niveau} : {zone.nom_zone}")
        print(f"Contenu: Bonjour {c.nom}, la zone {zone.nom_zone} est actuellement en état d'alerte {niveau}. Veuillez suivre les consignes de sécurité.")
    
    logger.info(f"--- FIN ENVOI EMAILS ({len(citoyens)} envoyés) ---")
    return len(citoyens)

def check_and_notify_citizens(zone_id):
    """
    Vérifie si une notification a déjà été envoyée pour cette zone et ce niveau aujourd'hui.
    Si non, procède à l'envoi automatisé.
    """
    zone = Zone.query.get(zone_id)
    # RÈGLE MÉTIER : Uniquement CRITIQUE ou ELEVE
    if not zone or zone.niveau_risque not in ("CRITIQUE", "ELEVE"):
        return None

    # Token unique pour l'incident du jour et le niveau (Anti-Spam)
    # Permet de renvoyer une alerte si on passe de ELEVE à CRITIQUE
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    incident_token = f"ZONE_{zone_id}_{today_str}_{zone.niveau_risque}"

    # Vérifier si un log existe déjà pour ce token
    existing_log = CitoyenAlertLog.query.filter_by(incident_token=incident_token).first()
    if existing_log:
        return None

    # Récupérer les citoyens de la zone
    citoyens = Citoyen.query.filter_by(zone_id=zone_id).all()
    if not citoyens:
        return 0

    # Envoyer les emails
    nb_envoyes = send_zone_alert_email(zone, citoyens)

    # Enregistrer le log
    new_log = CitoyenAlertLog(
        zone_id=zone_id,
        incident_token=incident_token,
        nombre_envoyes=nb_envoyes
    )
    db.session.add(new_log)
    db.session.commit()

    return nb_envoyes
