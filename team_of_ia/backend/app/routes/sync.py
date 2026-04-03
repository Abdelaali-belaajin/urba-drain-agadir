from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from db import db
from app.models.zone import Zone
from app.models.pompe import Pompe
from app.models.alerte import Alerte

sync_bp = Blueprint("system_sync", __name__)

@sync_bp.route("/sync", methods=["GET"])
@jwt_required()
def synchronize_state():
    """
    SINGLE SOURCE OF TRUTH ENDPOINT
    Fetches, validates, and auto-corrects (heals) all entities before returning a unified state.
    """
    zones = Zone.query.all()
    pompes = Pompe.query.all()
    alertes = Alerte.query.all()
    
    changed = False
    
    for z in zones:
        # 1. Dynamically calculate taux_remplissage based on bouches
        max_taux = 0
        if z.bouches:
            max_taux = float(max((b.taux_remplissage or 0 for b in z.bouches), default=0))
            
        # 2. Strict Rule: Water level > 90% -> zone must be CRITICAL
        # Downgrade logic if the level decreases
        v_risque_calc = "FAIBLE"
        if max_taux > 90:
            v_risque_calc = "CRITIQUE"
        elif max_taux > 75:
            v_risque_calc = "ELEVE"
        elif max_taux > 40:
            v_risque_calc = "MOYEN"
            
        if z.niveau_risque != v_risque_calc:
            z.niveau_risque = v_risque_calc
            changed = True
            
            # SAFE HOOK (Additive Only): Notify citizens if state becomes CRITIQUE or ELEVE
            if v_risque_calc in ("CRITIQUE", "ELEVE"):
                from app.services.email_service import check_and_notify_citizens
                check_and_notify_citizens(z.zone_id)

        z_alertes = [a for a in alertes if a.zone_id == z.zone_id and not a.resolue]
        z_pompes = [p for p in pompes if p.zone_id == z.zone_id]

        # 3. Reduce water level resolves alerts (assuming < 80 is safe threshold)
        if max_taux < 80:
            for a in z_alertes:
                a.resolue = True
                a.date_resolution = datetime.utcnow()
                changed = True
                
        # 3b. Strict Rule: If zone is CRITIQUE -> MUST have at least 1 unresolved alert!
        if z.niveau_risque == "CRITIQUE" and not z_alertes:
            b_crit = max(z.bouches, key=lambda b: float(b.taux_remplissage or 0), default=None) if z.bouches else None
            # Need a valid capteur_id, fallback to 1 if none found for safety
            c_id = 1
            if b_crit and b_crit.capteurs:
                c_id = b_crit.capteurs[0].capteur_id
            
            new_alerte = Alerte(
                capteur_id=c_id,
                bouche_id=b_crit.bouche_id if b_crit else 1,
                zone_id=z.zone_id,
                niveau_alerte="CRITICAL",
                message="[AUTO-HEALING] Débordement imminent détécté (>90%). Intervention requise.",
                valeur_declenchante=max_taux,
                resolue=False
            )
            db.session.add(new_alerte)
            alertes.append(new_alerte)
            z_alertes.append(new_alerte)
            changed = True
                
        # 4. Strict Rule: If zone is CRITICAL OR has any unresolved alert -> at least one pump must be ACTIVE
        if z.niveau_risque == "CRITIQUE" or z_alertes:
            has_active = any(p.statut == "ACTIVE" for p in z_pompes)
            if not has_active and z_pompes:
                # Auto activate the first pump
                p = z_pompes[0]
                p.statut = "ACTIVE"
                p.date_activation = datetime.utcnow()
                changed = True

    # 5. Strict Rule: If pump.status = "ON" -> power (kW) MUST be > 0. If "OFF", power = 0.
    for p in pompes:
        if p.statut == "ACTIVE":
            # Auto-calculate reasonable dummy power if missing or zero
            desired_power = float(p.debit_max_Lmin or 1000) * 0.05
            if not p.consommation_kw or float(p.consommation_kw) <= 0:
                p.consommation_kw = desired_power
                changed = True
        else:
            if p.consommation_kw and float(p.consommation_kw) != 0:
                p.consommation_kw = 0
                changed = True

    if changed:
        db.session.commit()
    
    # 6. Format unified payload with dynamically injected taux_remplissage
    z_dict = []
    for z in zones:
        d = z.to_dict()
        max_taux = float(max((b.taux_remplissage or 0 for b in z.bouches), default=0)) if z.bouches else 0
        d['taux_remplissage'] = max_taux
        z_dict.append(d)
        
    p_dict = [p.to_dict() for p in pompes]
    a_dict = [a.to_dict() for a in alertes]
    
    return jsonify({
        "zones": z_dict,
        "pompes": p_dict,
        "alertes": a_dict
    }), 200
