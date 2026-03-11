# app/routes/capteurs.py
# Routes API pour les capteurs

from flask import Blueprint, jsonify, request
from app.services import capteur_service

bp = Blueprint('capteurs', __name__)


@bp.route('', methods=['GET'])
def get_capteurs():
    # GET /api/capteurs
    # Peut filtrer avec ?type=NIVEAU ou ?statut=ACTIF
    try:
        type_capteur = request.args.get('type')
        statut = request.args.get('statut')
        critique = request.args.get('critique')
        
        # Si on demande les capteurs critiques
        if critique == 'true':
            capteurs = capteur_service.get_capteurs_critiques()
        else:
            capteurs = capteur_service.get_all_capteurs(type_capteur, statut)
        
        return jsonify({
            'success': True,
            'count': len(capteurs),
            'data': capteurs
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:capteur_id>', methods=['GET'])
def get_capteur(capteur_id):
    # GET /api/capteurs/1
    try:
        capteur = capteur_service.get_capteur_by_id(capteur_id)
        
        if not capteur:
            return jsonify({'error': 'Capteur introuvable'}), 404
        
        return jsonify({
            'success': True,
            'data': capteur
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['POST'])
def create_capteur():
    # POST /api/capteurs - Créer un nouveau capteur
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['reference', 'type_capteur', 'localisation', 'id_zone', 'seuil_alerte', 'seuil_critique', 'date_installation']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Vérifier type_capteur
        types_valides = ['NIVEAU', 'DEBIT', 'PRESSION']
        if data['type_capteur'] not in types_valides:
            return jsonify({'error': 'Invalid type_capteur'}), 400
        
        capteur_id = capteur_service.create_capteur(
            reference=data['reference'],
            type_capteur=data['type_capteur'],
            localisation=data['localisation'],
            id_zone=data['id_zone'],
            seuil_alerte=data['seuil_alerte'],
            seuil_critique=data['seuil_critique'],
            date_installation=data['date_installation']
        )
        
        return jsonify({
            'success': True,
            'message': 'Capteur created successfully',
            'id_capteur': capteur_id
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:capteur_id>', methods=['PUT'])
def update_capteur(capteur_id):
    # PUT /api/capteurs/1 - Modifier un capteur
    try:
        data = request.get_json()
        
        capteur = capteur_service.get_capteur_by_id(capteur_id)
        if not capteur:
            return jsonify({'error': 'Capteur introuvable'}), 404
        
        # Validation statut
        if 'statut' in data:
            statuts_valides = ['ACTIF', 'INACTIF', 'MAINTENANCE', 'DEFAILLANT']
            if data['statut'] not in statuts_valides:
                return jsonify({'error': 'Invalid statut'}), 400
        
        success = capteur_service.update_capteur(
            capteur_id=capteur_id,
            statut=data.get('statut', capteur['statut']),
            seuil_alerte=data.get('seuil_alerte', capteur['seuil_alerte']),
            seuil_critique=data.get('seuil_critique', capteur['seuil_critique']),
            localisation=data.get('localisation', capteur['localisation'])
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Capteur updated successfully'
            })
        else:
            return jsonify({'error': 'Update failed'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:capteur_id>', methods=['DELETE'])
def delete_capteur(capteur_id):
    # DELETE /api/capteurs/1 - Désactiver un capteur
    try:
        success = capteur_service.delete_capteur(capteur_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Capteur deactivated successfully'
            })
        else:
            return jsonify({'error': 'Capteur not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
