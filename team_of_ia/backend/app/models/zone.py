from db import db

class Zone(db.Model):
    __tablename__ = "ZONE"

    zone_id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nom_zone       = db.Column(db.String(100), nullable=False)
    quartier       = db.Column(db.String(100), nullable=False)
    superficie_km2 = db.Column(db.Numeric(8, 3), nullable=False)
    population     = db.Column(db.Integer, default=0)
    coord_lat      = db.Column(db.Numeric(10, 7), nullable=False)
    coord_lng      = db.Column(db.Numeric(10, 7), nullable=False)
    niveau_risque  = db.Column(db.Enum("FAIBLE", "MOYEN", "ELEVE", "CRITIQUE"), default="FAIBLE")
    date_creation  = db.Column(db.Date, nullable=False)
    actif          = db.Column(db.Boolean, default=True)

    capteurs = db.relationship("Capteur", backref="zone", lazy=True)
    pompes   = db.relationship("Pompe",   backref="zone", lazy=True)
    bouches  = db.relationship("BoucheEgout", backref="zone", lazy=True)
    alertes  = db.relationship("Alerte",  back_populates="zone", lazy=True)

    def to_dict(self):
        # Exposer le taux de remplissage maximal des bouches présentes dans la zone pour aligner l'API sur le trigger d'Alerte (sp_simuler_orage.sql)
        max_taux = float(max((b.taux_remplissage or 0 for b in self.bouches), default=0)) if self.bouches else 0.0

        return {
            "zone_id":       self.zone_id,
            "nom_zone":      self.nom_zone,
            "quartier":      self.quartier,
            "superficie_km2": float(self.superficie_km2) if self.superficie_km2 else None, # type: ignore
            "superficie": float(self.superficie_km2) if self.superficie_km2 else None, # type: ignore
            "population":    self.population,
            "coord_lat":     float(self.coord_lat) if self.coord_lat else None,
            "coord_lng":     float(self.coord_lng) if self.coord_lng else None,
            "niveau_risque": str(self.niveau_risque) if self.niveau_risque else "FAIBLE",
            "taux_remplissage": max_taux,
            "date_creation": self.date_creation.isoformat() if self.date_creation else None,
            "actif":         bool(self.actif),
        }
