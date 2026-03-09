# run.py
"""
Point d'entrée de l'application Flask
Lance le serveur de développement
"""
from app import create_app
from app.database import init_db

# Créer l'application Flask
app = create_app('development')

# Initialiser les hooks de base de données
init_db(app)

if __name__ == '__main__':
    # Lancer le serveur de développement
    # ATTENTION : En production, utiliser Gunicorn ou uWSGI
    app.run(
        host='0.0.0.0',  # Accessible depuis l'extérieur
        port=5000,
        debug=True  # Mode debug activé en développement
    )