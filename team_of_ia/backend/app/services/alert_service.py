"""
alert_service.py
Fonctions utilitaires pour la gestion des alertes.
Les alertes sont principalement créées par le trigger trg_creation_alerte (MySQL).
Ce service expose des helpers Python pour les cas non couverts par le trigger.
"""
from db import db
from app.models.alerte import Alerte
from app.models.log_activite import LogActivite
from datetime import datetime


def count_active_alerts(zone_id: int = None) -> int:
    """Retourne le nombre d'alertes non résolues, optionnellement filtrées par zone."""
    q = Alerte.query.filter_by(resolue=False)
    if zone_id:
        q = q.filter_by(zone_id=zone_id)
    return q.count()


def resolve_alert(alerte_id: int, user_id: int) -> Alerte:
    """Marque une alerte comme résolue et journalise l'action."""
    alerte = Alerte.query.get_or_404(alerte_id)
    if alerte.resolue:
        return alerte
    alerte.resolue         = True
    alerte.date_resolution = datetime.utcnow()
    LogActivite.create(user_id, "RESOUDRE_ALERTE", "ALERTE",
                       valeur_apres=f"alerte_id={alerte_id}")
    db.session.commit()
    return alerte
