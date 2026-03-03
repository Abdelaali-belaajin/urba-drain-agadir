# app/models/sensor.py
#
# Modèle ORM pour la table sensors
#
# Ce que vous devez faire ici :
# 1. Importer db depuis app.extensions
# 2. Importer datetime
#
# 3. Créer une classe Sensor(db.Model) :
#    __tablename__ = 'sensors'
#
#    Colonnes :
#    - id : db.Column(db.Integer, primary_key=True)
#    - name : db.Column(db.String(100), nullable=False)
#    - type : db.Column(db.Enum('LEVEL', 'FLOW', 'PRESSURE'), nullable=False)
#    - location : db.Column(db.String(255), nullable=False)
#    - latitude : db.Column(db.Numeric(10, 8))
#    - longitude : db.Column(db.Numeric(11, 8))
#    - status : db.Column(db.Enum('ACTIVE', 'INACTIVE', 'MAINTENANCE'), default='ACTIVE')
#    - installed_at : db.Column(db.DateTime, default=datetime.utcnow)
#    - last_reading_at : db.Column(db.DateTime)
#    - created_at : db.Column(db.DateTime, default=datetime.utcnow)
#    - updated_at : db.Column(db.DateTime, onupdate=datetime.utcnow)
#
#    Relations :
#    - readings : db.relationship('SensorReading', backref='sensor', lazy='dynamic')
#    - alerts : db.relationship('Alert', backref='sensor', lazy='dynamic')
#
# 4. Ajouter une méthode to_dict() pour sérialiser en JSON
# 5. Optionnel : ajouter __repr__() pour le debug