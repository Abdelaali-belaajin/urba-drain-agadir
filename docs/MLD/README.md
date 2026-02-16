# Modèle Logique de Données (MLD)

## Tables

### sensors
```
sensors(id, name, type, location, latitude, longitude, status, 
        installed_at, last_reading_at, created_at, updated_at)
```

### sensor_readings
```
sensor_readings(id, #sensor_id, value, unit, recorded_at)
  FK: sensor_id → sensors(id)
```

### pumps
```
pumps(id, name, location, capacity, status, 
      last_activated_at, created_at, updated_at)
```

### alerts
```
alerts(id, #sensor_id, alert_type, severity, message, status,
       threshold_value, current_value, created_at, 
       acknowledged_at, resolved_at)
  FK: sensor_id → sensors(id)
```

### pump_operations
```
pump_operations(id, #pump_id, operation_type, performed_by,
                notes, created_at)
  FK: pump_id → pumps(id)
```

## Index

- `idx_sensor_readings_sensor_id` sur sensor_readings(sensor_id)
- `idx_sensor_readings_recorded_at` sur sensor_readings(recorded_at)
- `idx_alerts_status` sur alerts(status)
- `idx_alerts_severity` sur alerts(severity)
- `idx_pumps_status` sur pumps(status)

---

*Schéma optimisé pour les requêtes de surveillance temps réel*
