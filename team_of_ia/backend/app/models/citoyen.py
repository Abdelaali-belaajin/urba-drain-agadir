from db import db
from datetime import datetime

class Citoyen(db.Model):
    __tablename__ = "CITOYEN"

    citoyen_id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nom             = db.Column(db.String(100), nullable=False)
    email           = db.Column(db.String(150), unique=True, nullable=False)
    zone_id         = db.Column(db.Integer, db.ForeignKey("ZONE.zone_id"), nullable=False)
    date_inscription = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    zone = db.relationship("Zone", backref=db.backref("citoyens", lazy=True))

    def to_dict(self):
        return {
            "citoyen_id":      self.citoyen_id,
            "nom":             self.nom,
            "email":           self.email,
            "zone_id":         self.zone_id,
            "date_inscription": self.date_inscription.isoformat() if self.date_inscription else None
        }
