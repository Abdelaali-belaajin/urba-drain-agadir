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
