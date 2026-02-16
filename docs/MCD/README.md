# Modèle Conceptuel de Données (MCD)

## Entités Principales

### SENSOR (Capteur)
- **id** : INT (PK)
- name : VARCHAR(100)
- type : ENUM('LEVEL', 'FLOW', 'PRESSURE')
- location : VARCHAR(255)
- latitude : DECIMAL(10,8)
- longitude : DECIMAL(11,8)
- status : ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE')

### PUMP (Pompe)
- **id** : INT (PK)
- name : VARCHAR(100)
- location : VARCHAR(255)
- capacity : DECIMAL(10,2)
- status : ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR')

### ALERT (Alerte)
- **id** : INT (PK)
- alert_type : ENUM('HIGH_LEVEL', 'LOW_LEVEL', 'SENSOR_ERROR', 'PUMP_ERROR')
- severity : ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
- message : TEXT
- status : ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')

### SENSOR_READING (Lecture)
- **id** : INT (PK)
- value : DECIMAL(10,2)
- unit : VARCHAR(20)
- recorded_at : DATETIME

## Relations

- Un SENSOR peut avoir plusieurs SENSOR_READING (1:N)
- Un SENSOR peut générer plusieurs ALERT (1:N)
- Un PUMP peut avoir plusieurs PUMP_OPERATION (1:N)

---

*Pour visualiser le diagramme complet, utiliser un outil de modélisation comme MySQL Workbench ou draw.io*
