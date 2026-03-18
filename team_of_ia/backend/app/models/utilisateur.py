from db import db, bcrypt
from datetime import datetime

ROLES = ("ADMIN", "OPERATEUR", "TECHNICIEN", "LECTEUR")

class Utilisateur(db.Model):
    __tablename__ = "UTILISATEUR"

    user_id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nom                 = db.Column(db.String(100), nullable=False)
    email               = db.Column(db.String(150), unique=True, nullable=False)
    mot_de_passe_hash   = db.Column(db.String(255), nullable=False)
    role                = db.Column(db.Enum(*ROLES), nullable=False, default="LECTEUR")
    date_creation       = db.Column(db.DateTime, default=datetime.utcnow)
    actif               = db.Column(db.Boolean, default=True)
    derniere_connexion  = db.Column(db.DateTime, nullable=True)

    logs = db.relationship("LogActivite", backref="utilisateur", lazy=True)

    def set_password(self, plain: str):
        self.mot_de_passe_hash = bcrypt.generate_password_hash(plain, rounds=12).decode("utf-8")

    def check_password(self, plain: str) -> bool:
        return bcrypt.check_password_hash(self.mot_de_passe_hash, plain)

    def to_dict(self):
        return {
            "user_id":            self.user_id,
            "nom":                self.nom,
            "email":              self.email,
            "role":               self.role,
            "actif":              self.actif,
            "date_creation":      self.date_creation.isoformat() if self.date_creation else None,
            "derniere_connexion": self.derniere_connexion.isoformat() if self.derniere_connexion else None,
        }
