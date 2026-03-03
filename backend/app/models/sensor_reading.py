# app/models/sensor_reading.py
#
# Modèle ORM pour la table sensor_readings
#
# Ce que vous devez faire ici :
# 1. Importer db depuis app.extensions
# 2. Importer datetime
#
# 3. Créer une classe SensorReading(db.Model) :
#    __tablename__ = 'sensor_readings'
#
#    Colonnes :
#    - id : db.Column(db.Integer, primary_key=True)
#    - sensor_id : db.Column(db.Integer, db.ForeignKey('sensors.id'), nullable=False)
#    - value : db.Column(db.Numeric(10, 2), nullable=False)
#    - unit : db.Column(db.String(20), nullable=False)
#    - recorded_at : db.Column(db.DateTime, default=datetime.utcnow)
#
# 4. Ajouter une méthode to_dict() pour sérialiser en JSON
# 5. Index sur sensor_id et recorded_at pour optimiser les requêtes