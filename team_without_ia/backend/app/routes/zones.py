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


@bp.route('', methods=['POST'])
def create_zone():
    # POST /api/zones - Créer une nouvelle zone
    try:
        data = request.get_json()
        
        # Validation des champs requis
        required_fields = ['nom_zone', 'superficie', 'population', 'niveau_risque']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Validation du niveau de risque
        niveaux_valides = ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE']
        if data['niveau_risque'] not in niveaux_valides:
            return jsonify({'error': 'Invalid niveau_risque'}), 400
        
        # Créer la zone
        zone_id = zone_service.create_zone(
            nom_zone=data['nom_zone'],
            superficie=data['superficie'],
            population=data['population'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            niveau_risque=data['niveau_risque']
        )
        
        return jsonify({
            'success': True,
            'message': 'Zone created successfully',
            'id_zone': zone_id
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:zone_id>', methods=['PUT'])
def update_zone(zone_id):
    # PUT /api/zones/1 - Modifier une zone
    try:
        data = request.get_json()
        
        # Vérifier que la zone existe
        zone = zone_service.get_zone_by_id(zone_id)
        if not zone:
            return jsonify({'error': 'Zone introuvable'}), 404
        
        # Validation des champs
        if 'niveau_risque' in data:
            niveaux_valides = ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE']
            if data['niveau_risque'] not in niveaux_valides:
                return jsonify({'error': 'Invalid niveau_risque'}), 400
        
        # Mettre à jour
        success = zone_service.update_zone(
            zone_id=zone_id,
            nom_zone=data.get('nom_zone', zone['nom_zone']),
            superficie=data.get('superficie', zone['superficie']),
            population=data.get('population', zone['population']),
            niveau_risque=data.get('niveau_risque', zone['niveau_risque'])
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Zone updated successfully'
            })
        else:
            return jsonify({'error': 'Update failed'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:zone_id>', methods=['DELETE'])
def delete_zone(zone_id):
    # DELETE /api/zones/1 - Supprimer une zone
    try:
        success, message = zone_service.delete_zone(zone_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            })
        else:
            return jsonify({'error': message}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
