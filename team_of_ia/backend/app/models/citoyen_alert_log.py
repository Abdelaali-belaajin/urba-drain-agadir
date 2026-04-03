from db import db
from datetime import datetime

class CitoyenAlertLog(db.Model):
    __tablename__ = "CITOYEN_ALERT_LOG"

    log_id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    zone_id         = db.Column(db.Integer, db.ForeignKey("ZONE.zone_id"), nullable=False)
    date_envoi      = db.Column(db.DateTime, default=datetime.utcnow)
    incident_token  = db.Column(db.String(100), nullable=False, index=True)
    nombre_envoyes  = db.Column(db.Integer, default=0)

    # Relationships
    zone = db.relationship("Zone", backref=db.backref("citizen_alert_logs", lazy=True))

    def to_dict(self):
        return {
            "log_id":         self.log_id,
            "zone_id":        self.zone_id,
            "date_envoi":     self.date_envoi.isoformat() if self.date_envoi else None,
            "incident_token": self.incident_token,
            "nombre_envoyes": self.nombre_envoyes
        }
