# app/models/pump.py
#
# Modèle ORM pour la table pumps
#
# Ce que vous devez faire ici :
# 1. Importer db depuis app.extensions
# 2. Importer datetime
#
# 3. Créer une classe Pump(db.Model) :
#    __tablename__ = 'pumps'
#
#    Colonnes :
#    - id : db.Column(db.Integer, primary_key=True)
#    - name : db.Column(db.String(100), nullable=False)
#    - location : db.Column(db.String(255), nullable=False)
#    - capacity : db.Column(db.Numeric(10, 2), nullable=False)
#    - status : db.Column(db.Enum('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR'), default='INACTIVE')
#    - last_activated_at : db.Column(db.DateTime)
#    - created_at : db.Column(db.DateTime, default=datetime.utcnow)
#    - updated_at : db.Column(db.DateTime, onupdate=datetime.utcnow)
#
#    Relations :
#    - operations : db.relationship('PumpOperation', backref='pump', lazy='dynamic')
#
# 4. Ajouter une méthode to_dict() pour sérialiser en JSON