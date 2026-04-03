from db import db
from datetime import datetime

class Pompe(db.Model):
    __tablename__ = "POMPE"

    pompe_id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    zone_id         = db.Column(db.Integer, db.ForeignKey("ZONE.zone_id"), nullable=False)
    nom_pompe       = db.Column(db.String(100), nullable=False)
    debit_max_Lmin  = db.Column(db.Numeric(10, 2), nullable=False)
    statut          = db.Column(db.Enum("INACTIVE", "ACTIVE", "PANNE", "MAINTENANCE"), default="INACTIVE")
    date_activation = db.Column(db.DateTime, nullable=True)
    consommation_kw = db.Column(db.Numeric(8, 2), default=0)
    coord_lat       = db.Column(db.Numeric(10, 7), nullable=False)
    coord_lng       = db.Column(db.Numeric(10, 7), nullable=False)
    automatique     = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "pompe_id":        self.pompe_id,
            "zone_id":         self.zone_id,
            "nom_pompe":       self.nom_pompe,
            "debit_max_Lmin":  float(self.debit_max_Lmin) if self.debit_max_Lmin is not None else None,
            "statut":          str(self.statut) if self.statut else "INACTIVE",
            "date_activation": self.date_activation.isoformat() if self.date_activation else None,
            "consommation_kw": float(self.consommation_kw) if self.consommation_kw is not None else None,
            "coord_lat":       float(self.coord_lat) if self.coord_lat is not None else None,
            "coord_lng":       float(self.coord_lng) if self.coord_lng is not None else None,
            "automatique":     bool(self.automatique),
        }
