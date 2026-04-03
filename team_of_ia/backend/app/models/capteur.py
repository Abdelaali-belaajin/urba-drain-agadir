from db import db

class Capteur(db.Model):
    __tablename__ = "CAPTEUR"

    capteur_id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    zone_id           = db.Column(db.Integer, db.ForeignKey("ZONE.zone_id"), nullable=False)
    bouche_id         = db.Column(db.Integer, db.ForeignKey("BOUCHE_EGOUT.bouche_id"), nullable=False)
    type_capteur      = db.Column(db.Enum("NIVEAU_EAU", "DEBIT", "PRESSION", "TEMPERATURE"), nullable=False)
    modele            = db.Column(db.String(100), nullable=True)
    seuil_alerte      = db.Column(db.Numeric(10, 2), nullable=False)
    seuil_critique    = db.Column(db.Numeric(10, 2), nullable=False)
    statut            = db.Column(db.Enum("ACTIF", "INACTIF", "PANNE", "MAINTENANCE"), default="ACTIF")
    derniere_mesure   = db.Column(db.DateTime, nullable=True)
    date_installation = db.Column(db.Date, nullable=False)

    mesures = db.relationship("Mesure", backref="capteur", lazy=True)
    alertes = db.relationship("Alerte", backref="capteur", lazy=True)

    def to_dict(self, with_last_mesure=False):
        d = {
            "capteur_id":        self.capteur_id,
            "zone_id":           self.zone_id,
            "bouche_id":         self.bouche_id,
            "type_capteur":      str(self.type_capteur) if self.type_capteur else None,
            "modele":            self.modele,
            "seuil_alerte":      float(self.seuil_alerte) if self.seuil_alerte else None,
            "seuil_critique":    float(self.seuil_critique) if self.seuil_critique else None,
            "statut":            str(self.statut) if self.statut else "INACTIF",
            "derniere_mesure":   self.derniere_mesure.isoformat() if self.derniere_mesure else None,
            "date_installation": self.date_installation.isoformat() if self.date_installation else None,
        }
        if with_last_mesure and self.mesures:
            last = max(self.mesures, key=lambda m: m.date_heure)
            d["derniere_mesure_data"] = last.to_dict()
        return d
