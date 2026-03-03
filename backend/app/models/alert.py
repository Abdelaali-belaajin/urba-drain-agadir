# app/models/alert.py
#
# Modèle ORM pour la table alerts
#
# Ce que vous devez faire ici :
# 1. Importer db depuis app.extensions
# 2. Importer datetime
#
# 3. Créer une classe Alert(db.Model) :
#    __tablename__ = 'alerts'
#
#    Colonnes :
#    - id : db.Column(db.Integer, primary_key=True)
#    - sensor_id : db.Column(db.Integer, db.ForeignKey('sensors.id'))
#    - alert_type : db.Column(db.Enum('HIGH_LEVEL', 'LOW_LEVEL', 'SENSOR_ERROR', 'PUMP_ERROR'))
#    - severity : db.Column(db.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), default='MEDIUM')
#    - message : db.Column(db.Text, nullable=False)
#    - status : db.Column(db.Enum('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'), default='ACTIVE')
#    - threshold_value : db.Column(db.Numeric(10, 2))
#    - current_value : db.Column(db.Numeric(10, 2))
#    - created_at : db.Column(db.DateTime, default=datetime.utcnow)
#    - acknowledged_at : db.Column(db.DateTime)
#    - resolved_at : db.Column(db.DateTime)
#
# 4. Ajouter une méthode to_dict() pour sérialiser en JSON