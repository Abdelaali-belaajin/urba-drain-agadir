from db import db
from datetime import datetime

class Alerte(db.Model):
    __tablename__ = "ALERTE"

    alerte_id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    capteur_id          = db.Column(db.Integer, db.ForeignKey("CAPTEUR.capteur_id"), nullable=False)
    bouche_id           = db.Column(db.Integer, db.ForeignKey("BOUCHE_EGOUT.bouche_id"), nullable=False)
    zone_id             = db.Column(db.Integer, db.ForeignKey("ZONE.zone_id"), nullable=False)
    niveau_alerte       = db.Column(db.Enum("INFO", "WARNING", "CRITICAL", "EMERGENCY"), nullable=False)
    message             = db.Column(db.Text, nullable=False)
    valeur_declenchante = db.Column(db.Numeric(10, 2), nullable=False)
    date_heure          = db.Column(db.DateTime, default=datetime.utcnow)
    resolue             = db.Column(db.Boolean, default=False)
    date_resolution     = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "alerte_id":           self.alerte_id,
            "capteur_id":          self.capteur_id,
            "bouche_id":           self.bouche_id,
            "zone_id":             self.zone_id,
            "niveau_alerte":       self.niveau_alerte,
            "message":             self.message,
            "valeur_declenchante": float(self.valeur_declenchante) if self.valeur_declenchante else None,
            "date_heure":          self.date_heure.isoformat() if self.date_heure else None,
            "resolue":             self.resolue,
            "date_resolution":     self.date_resolution.isoformat() if self.date_resolution else None,
        }
