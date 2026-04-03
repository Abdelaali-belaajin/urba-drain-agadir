from db import db
from datetime import datetime

class LogActivite(db.Model):
    __tablename__ = "LOG_ACTIVITE"

    log_id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("UTILISATEUR.user_id"), nullable=True)
    alerte_id    = db.Column(db.Integer, db.ForeignKey("ALERTE.alerte_id"), nullable=True)
    action       = db.Column(db.String(100), nullable=False)
    table_cible  = db.Column(db.String(50), nullable=False)
    valeur_avant = db.Column(db.Text, nullable=True)
    valeur_apres = db.Column(db.Text, nullable=True)
    date_heure   = db.Column(db.DateTime, default=datetime.utcnow)
    ip_adresse   = db.Column(db.String(45), nullable=True)

    @staticmethod
    def create(user_id, action, table_cible="SYSTEME", valeur_avant=None, valeur_apres=None, ip=None):
        """INSERT ONLY — seule façon d'écrire dans LOG_ACTIVITE."""
        log = LogActivite(
            user_id=user_id,
            action=action,
            table_cible=table_cible,
            valeur_avant=valeur_avant,
            valeur_apres=valeur_apres,
            ip_adresse=ip,
        )
        db.session.add(log)
        return log

    def to_dict(self):
        return {
            "log_id":       self.log_id,
            "user_id":      self.user_id,
            "alerte_id":    self.alerte_id,
            "action":       self.action,
            "table_cible":  self.table_cible,
            "valeur_avant": self.valeur_avant,
            "valeur_apres": self.valeur_apres,
            "date_heure":   self.date_heure.isoformat() if self.date_heure else None,
            "ip_adresse":   self.ip_adresse,
        }
