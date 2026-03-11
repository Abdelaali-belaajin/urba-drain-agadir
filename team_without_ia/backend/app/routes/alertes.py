# app/routes/alertes.py
"""
Routes API pour la gestion des alertes
"""

from flask import Blueprint, jsonify, request
from app.services import alerte_service

bp = Blueprint('alertes', __name__)


@bp.route('', methods=['GET'])
def get_alertes():
    """
    GET /api/alertes
    Récupère toutes les alertes avec filtres optionnels
    
    Query params:
        - statut: ACTIVE, ACQUITTEE, RESOLUE, IGNOREE
        - severite: INFO, AVERTISSEMENT, CRITIQUE, URGENCE
        - zone: ID de la zone
        - type: NIVEAU_ELEVE, PANNE_CAPTEUR, PANNE_POMPE, MAINTENANCE
    """
    try:
        statut = request.args.get('statut')
        severite = request.args.get('severite')
        zone_id = request.args.get('zone')
        type_alerte = request.args.get('type')
        
        alertes = alerte_service.get_all_alertes(
            statut=statut,
            severite=severite,
            zone_id=zone_id,
            type_alerte=type_alerte
        )
        
        return jsonify({
            'success': True,
            'count': len(alertes),
            'data': alertes
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:alerte_id>', methods=['GET'])
def get_alerte(alerte_id):
    """
    GET /api/alertes/{id}
    Récupère les détails d'une alerte spécifique
    """
    try:
        alerte = alerte_service.get_alerte_by_id(alerte_id)
        
        if not alerte:
            return jsonify({'error': 'Alerte introuvable'}), 404
        
        return jsonify({
            'success': True,
            'data': alerte
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['POST'])
def create_alerte():
    """
    POST /api/alertes
    Crée une nouvelle alerte manuelle
    
    Body:
        - type_alerte (requis): NIVEAU_ELEVE, PANNE_CAPTEUR, PANNE_POMPE, MAINTENANCE
        - niveau_severite (requis): INFO, AVERTISSEMENT, CRITIQUE, URGENCE
        - titre (requis): Titre de l'alerte
        - message (requis): Message descriptif
        - id_zone (requis): ID de la zone
        - id_capteur (optionnel): ID du capteur
        - id_pompe (optionnel): ID de la pompe
    """
    try:
        data = request.get_json()
        
        # Validation des champs requis
        required_fields = ['type_alerte', 'niveau_severite', 'titre', 'message', 'id_zone']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Validation type_alerte
        types_valides = ['NIVEAU_ELEVE', 'PANNE_CAPTEUR', 'PANNE_POMPE', 'MAINTENANCE']
        if data['type_alerte'] not in types_valides:
            return jsonify({'error': 'Invalid type_alerte'}), 400
        
        # Validation niveau_severite
        severites_valides = ['INFO', 'AVERTISSEMENT', 'CRITIQUE', 'URGENCE']
        if data['niveau_severite'] not in severites_valides:
            return jsonify({'error': 'Invalid niveau_severite'}), 400
        
        alerte_id = alerte_service.create_alerte(
            type_alerte=data['type_alerte'],
            niveau_severite=data['niveau_severite'],
            titre=data['titre'],
            message=data['message'],
            id_zone=data['id_zone'],
            id_capteur=data.get('id_capteur'),
            id_pompe=data.get('id_pompe')
        )
        
        return jsonify({
            'success': True,
            'message': 'Alerte created successfully',
            'id_alerte': alerte_id
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:alerte_id>/acquitter', methods=['PUT'])
def acquitter_alerte(alerte_id):
    """
    PUT /api/alertes/{id}/acquitter
    Acquitte une alerte (opérateur prend en charge)
    
    Body:
        - utilisateur (requis): Nom d'utilisateur
    """
    try:
        data = request.get_json()
        
        if not data or 'utilisateur' not in data:
            return jsonify({'error': 'Missing field: utilisateur'}), 400
        
        # Vérifier que l'alerte existe
        alerte = alerte_service.get_alerte_by_id(alerte_id)
        if not alerte:
            return jsonify({'error': 'Alerte introuvable'}), 404
        
        # Vérifier le statut
        if alerte['statut'] != 'ACTIVE':
            return jsonify({'error': f'Cannot acquit alert with status {alerte["statut"]}'}), 400
        
        success = alerte_service.acquitter_alerte(
            alerte_id=alerte_id,
            utilisateur=data['utilisateur']
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Alerte acquittée par {data["utilisateur"]}'
            })
        else:
            return jsonify({'error': 'Failed to acquit alert'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:alerte_id>/resoudre', methods=['PUT'])
def resoudre_alerte(alerte_id):
    """
    PUT /api/alertes/{id}/resoudre
    Résout une alerte (problème traité)
    
    Body:
        - utilisateur (requis): Nom d'utilisateur
        - actions_prises (requis): Description des actions effectuées
    """
    try:
        data = request.get_json()
        
        if not data or 'utilisateur' not in data:
            return jsonify({'error': 'Missing field: utilisateur'}), 400
        
        if 'actions_prises' not in data:
            return jsonify({'error': 'Missing field: actions_prises'}), 400
        
        # Vérifier que l'alerte existe
        alerte = alerte_service.get_alerte_by_id(alerte_id)
        if not alerte:
            return jsonify({'error': 'Alerte introuvable'}), 404
        
        # Vérifier le statut
        if alerte['statut'] not in ['ACTIVE', 'ACQUITTEE']:
            return jsonify({'error': f'Cannot resolve alert with status {alerte["statut"]}'}), 400
        
        success = alerte_service.resoudre_alerte(
            alerte_id=alerte_id,
            utilisateur=data['utilisateur'],
            actions_prises=data['actions_prises']
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Alerte résolue'
            })
        else:
            return jsonify({'error': 'Failed to resolve alert'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:alerte_id>/ignorer', methods=['PUT'])
def ignorer_alerte(alerte_id):
    """
    PUT /api/alertes/{id}/ignorer
    Ignore une alerte (fausse alerte)
    
    Body:
        - utilisateur (requis): Nom d'utilisateur
        - raison (requis): Raison de l'ignorance
    """
    try:
        data = request.get_json()
        
        if not data or 'utilisateur' not in data:
            return jsonify({'error': 'Missing field: utilisateur'}), 400
        
        if 'raison' not in data:
            return jsonify({'error': 'Missing field: raison'}), 400
        
        # Vérifier que l'alerte existe
        alerte = alerte_service.get_alerte_by_id(alerte_id)
        if not alerte:
            return jsonify({'error': 'Alerte introuvable'}), 404
        
        success = alerte_service.ignorer_alerte(
            alerte_id=alerte_id,
            utilisateur=data['utilisateur'],
            raison=data['raison']
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Alerte ignorée'
            })
        else:
            return jsonify({'error': 'Failed to ignore alert'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/actives', methods=['GET'])
def get_alertes_actives():
    """
    GET /api/alertes/actives
    Récupère uniquement les alertes actives (non traitées)
    """
    try:
        alertes = alerte_service.get_alertes_actives()
        
        return jsonify({
            'success': True,
            'count': len(alertes),
            'data': alertes
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/critiques', methods=['GET'])
def get_alertes_critiques():
    """
    GET /api/alertes/critiques
    Récupère les alertes actives de niveau CRITIQUE ou URGENCE
    """
    try:
        alertes = alerte_service.get_alertes_critiques()
        
        return jsonify({
            'success': True,
            'count': len(alertes),
            'data': alertes
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
def get_alertes_stats():
    """
    GET /api/alertes/stats
    Récupère les statistiques des alertes
    """
    try:
        stats = alerte_service.get_alertes_stats()
        
        return jsonify({
            'success': True,
            'data': stats
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
