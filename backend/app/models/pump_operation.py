# app/models/pump_operation.py
#
# Modèle ORM pour la table pump_operations
#
# Ce que vous devez faire ici :
# 1. Importer db depuis app.extensions
# 2. Importer datetime
#
# 3. Créer une classe PumpOperation(db.Model) :
#    __tablename__ = 'pump_operations'
#
#    Colonnes :
#    - id : db.Column(db.Integer, primary_key=True)
#    - pump_id : db.Column(db.Integer, db.ForeignKey('pumps.id'), nullable=False)
#    - operation_type : db.Column(db.Enum('START', 'STOP', 'MAINTENANCE'), nullable=False)
#    - performed_by : db.Column(db.String(100))
#    - notes : db.Column(db.Text)
#    - created_at : db.Column(db.DateTime, default=datetime.utcnow)
#
# 4. Ajouter une méthode to_dict() pour sérialiser en JSON