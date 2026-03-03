# app/models/__init__.py
#
# Ce fichier importe tous les modèles ORM pour faciliter les imports
#
# Ce que vous devez faire ici :
# 1. Importer tous les modèles depuis leurs fichiers respectifs :
#    from app.models.sensor import Sensor
#    from app.models.sensor_reading import SensorReading
#    from app.models.pump import Pump
#    from app.models.alert import Alert
#    from app.models.pump_operation import PumpOperation
#
# 2. Définir __all__ pour exporter les modèles :
#    __all__ = ['Sensor', 'SensorReading', 'Pump', 'Alert', 'PumpOperation']
#
# Cela permet d'importer facilement : from app.models import Sensor, Pump