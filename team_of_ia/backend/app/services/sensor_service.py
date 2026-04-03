"""
sensor_service.py
Helpers pour les capteurs et mesures.
L'insertion de mesures déclenche automatiquement trg_creation_alerte (MySQL).
"""
from db import db
from app.models.capteur import Capteur
from app.models.mesure import Mesure
from datetime import datetime


def get_last_mesure(capteur_id: int) -> Mesure | None:
    return (Mesure.query
            .filter_by(capteur_id=capteur_id)
            .order_by(Mesure.date_heure.desc())
            .first())


def insert_mesure(capteur_id: int, valeur: float, unite: str,
                  note: str = None) -> Mesure:
    """
    Insère une mesure.
    Le trigger trg_creation_alerte se chargera de créer une alerte si nécessaire.
    """
    m = Mesure(
        capteur_id=capteur_id,
        valeur=valeur,
        unite=unite,
        date_heure=datetime.utcnow(),
        note=note,
    )
    db.session.add(m)
    db.session.commit()
    return m
