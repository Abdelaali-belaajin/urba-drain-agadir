from db import db

class BoucheEgout(db.Model):
    __tablename__ = "BOUCHE_EGOUT"

    bouche_id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    zone_id             = db.Column(db.Integer, db.ForeignKey("ZONE.zone_id"), nullable=False)
    pompe_id            = db.Column(db.Integer, db.ForeignKey("POMPE.pompe_id"), nullable=True)
    adresse             = db.Column(db.String(200), nullable=False)
    coord_lat           = db.Column(db.Numeric(10, 7), nullable=False)
    coord_lng           = db.Column(db.Numeric(10, 7), nullable=False)
    capacite_max_L      = db.Column(db.Numeric(10, 2), nullable=False)
    taux_remplissage    = db.Column(db.Numeric(5, 2), default=0.00)
    statut              = db.Column(db.Enum("NORMAL", "ALERTE", "SATURE", "BLOQUE"), default="NORMAL")
    derniere_inspection = db.Column(db.Date, nullable=True)

    capteurs = db.relationship("Capteur", backref="bouche", lazy=True)
    alertes  = db.relationship("Alerte",  backref="bouche", lazy=True)

    def to_dict(self):
        return {
            "bouche_id":           self.bouche_id,
            "zone_id":             self.zone_id,
            "pompe_id":            self.pompe_id,
            "adresse":             self.adresse,
            "coord_lat":           float(self.coord_lat) if self.coord_lat else None,
            "coord_lng":           float(self.coord_lng) if self.coord_lng else None,
            "capacite_max_L":      float(self.capacite_max_L) if self.capacite_max_L else None,
            "taux_remplissage":    float(self.taux_remplissage) if self.taux_remplissage else 0,
            "statut":              self.statut,
            "derniere_inspection": self.derniere_inspection.isoformat() if self.derniere_inspection else None,
        }
