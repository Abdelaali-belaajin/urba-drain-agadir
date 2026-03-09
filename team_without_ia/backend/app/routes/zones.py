# app/routes/zones.py
# Routes API pour les zones

from flask import Blueprint, jsonify, request
from app.services import zone_service

bp = Blueprint('zones', __name__)


@bp.route('', methods=['GET'])
def get_zones():
    # GET /api/zones - Liste toutes les zones
    try:
        zones = zone_service.get_all_zones()
        
        return jsonify({
            'success': True,
            'data': zones
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:zone_id>', methods=['GET'])
def get_zone(zone_id):
    # GET /api/zones/1 - Détails d'une zone
    try:
        zone = zone_service.get_zone_by_id(zone_id)
        
        if not zone:
            return jsonify({'error': 'Zone introuvable'}), 404
        
        return jsonify({
            'success': True,
            'data': zone
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
