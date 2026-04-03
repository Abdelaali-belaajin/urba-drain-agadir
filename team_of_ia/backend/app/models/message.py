from db import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = "MESSAGE"

    message_id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    expediteur_id   = db.Column(db.Integer, db.ForeignKey("UTILISATEUR.user_id"), nullable=False)
    destinataire_id = db.Column(db.Integer, db.ForeignKey("UTILISATEUR.user_id"), nullable=False)
    sujet           = db.Column(db.String(255), nullable=False)
    contenu         = db.Column(db.Text, nullable=False)
    date_envoi      = db.Column(db.DateTime, default=datetime.utcnow)
    lu              = db.Column(db.Boolean, default=False)

    expediteur   = db.relationship("Utilisateur", foreign_keys=[expediteur_id], primaryjoin="Message.expediteur_id == Utilisateur.user_id", lazy="joined")
    destinataire = db.relationship("Utilisateur", foreign_keys=[destinataire_id], primaryjoin="Message.destinataire_id == Utilisateur.user_id", lazy="joined")

    def to_dict(self):
        return {
            "message_id":      self.message_id,
            "expediteur_id":   self.expediteur_id,
            "expediteur_nom":  self.expediteur.nom if self.expediteur else f"User {self.expediteur_id}",
            "expediteur_role": self.expediteur.role if self.expediteur else "",
            "destinataire_id": self.destinataire_id,
            "destinataire_nom": self.destinataire.nom if self.destinataire else f"User {self.destinataire_id}",
            "destinataire_role": self.destinataire.role if self.destinataire else "",
            "sujet":           self.sujet,
            "contenu":         self.contenu,
            "date_envoi":      self.date_envoi.isoformat() if self.date_envoi else None,
            "lu":              self.lu
        }
