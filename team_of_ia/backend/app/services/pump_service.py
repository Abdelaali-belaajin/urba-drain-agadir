"""
pump_service.py
Helpers pour le contrôle manuel des pompes.
L'activation automatique est gérée par le trigger trg_activation_pompe (MySQL).
"""
from db import db
from app.models.pompe import Pompe
from app.models.log_activite import LogActivite
from datetime import datetime


def toggle_pompe(pompe_id: int, user_id: int) -> Pompe:
    pompe = Pompe.query.get_or_404(pompe_id)
    if pompe.statut in ("PANNE", "MAINTENANCE"):
        raise ValueError(f"Impossible de modifier une pompe en {pompe.statut}")
    ancien        = pompe.statut
    pompe.statut  = "INACTIVE" if pompe.statut == "ACTIVE" else "ACTIVE"
    if pompe.statut == "ACTIVE":
        pompe.date_activation = datetime.utcnow()
    else:
        pompe.date_activation = None
    LogActivite.create(user_id, "TOGGLE_POMPE", "POMPE",
                       valeur_avant=ancien, valeur_apres=pompe.statut)
    db.session.commit()
    return pompe
