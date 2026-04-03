from db import db
from datetime import datetime

class Alerte(db.Model):
    __tablename__ = "ALERTE"

    alerte_id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    capteur_id          = db.Column(db.Integer, db.ForeignKey("CAPTEUR.capteur_id"), nullable=False)
    bouche_id           = db.Column(db.Integer, db.ForeignKey("BOUCHE_EGOUT.bouche_id"), nullable=False)
    zone_id             = db.Column(db.Integer, db.ForeignKey("ZONE.zone_id"), nullable=False)
    niveau_alerte       = db.Column(db.Enum("INFO", "ELEVE", "CRITIQUE", "MOYEN", "FAIBLE"), nullable=False)
    message             = db.Column(db.Text, nullable=False)
    valeur_declenchante = db.Column(db.Numeric(10, 2), nullable=False)
    date_heure          = db.Column(db.DateTime, default=datetime.utcnow)
    resolue             = db.Column(db.Boolean, default=False)
    date_resolution     = db.Column(db.DateTime, nullable=True)

    zone = db.relationship("Zone", foreign_keys=[zone_id], lazy="joined", back_populates="alertes")

    def to_dict(self):
        # Dynamic level logic:
        # 1. If resolved -> "RESOLUE"
        # 2. If active -> Current risk level of the zone
        display_level = "RESOLUE" if self.resolue else (str(self.zone.niveau_risque) if self.zone else str(self.niveau_alerte))

        return {
            "alerte_id":           self.alerte_id,
            "capteur_id":          self.capteur_id,
            "bouche_id":           self.bouche_id,
            "zone_id":             self.zone_id,
            "niveau_alerte":       str(self.niveau_alerte) if self.niveau_alerte else None, # Historical
            "display_level":       display_level, # Dynamic (for UI)
            "message":             self.message, # type: ignore
            "valeur_declenchante": float(self.valeur_declenchante) if self.valeur_declenchante else None, # type: ignore
            "date_heure":          self.date_heure.isoformat() if self.date_heure else None,
            "resolue":             bool(self.resolue),
            "date_resolution":     self.date_resolution.isoformat() if self.date_resolution else None,
            "zone":                self.zone.to_dict() if self.zone else None,
        }
