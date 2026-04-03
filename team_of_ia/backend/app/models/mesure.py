from db import db
from datetime import datetime

class Mesure(db.Model):
    __tablename__ = "MESURE"

    mesure_id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    capteur_id     = db.Column(db.Integer, db.ForeignKey("CAPTEUR.capteur_id"), nullable=False)
    valeur         = db.Column(db.Numeric(10, 4), nullable=False)
    unite          = db.Column(db.String(20), nullable=False)
    date_heure     = db.Column(db.DateTime, default=datetime.utcnow)
    qualite_signal = db.Column(db.Enum("BONNE", "MOYENNE", "MAUVAISE", "HORS_LIGNE"), default="BONNE")
    anomalie       = db.Column(db.Boolean, default=False)
    note           = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "mesure_id":      self.mesure_id,
            "capteur_id":     self.capteur_id,
            "valeur":         float(self.valeur) if self.valeur else None,
            "unite":          self.unite,
            "date_heure":     self.date_heure.isoformat() if self.date_heure else None,
            "qualite_signal": self.qualite_signal,
            "anomalie":       self.anomalie,
            "note":           self.note,
        }
