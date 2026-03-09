# app/database.py
"""
Gestion de la connexion MySQL avec PyMySQL
Pool de connexions et fonctions helper
"""
import pymysql
from pymysql.cursors import DictCursor
from contextlib import contextmanager
from flask import current_app, g


def get_db_connection():
    """
    Obtient une connexion à la base de données MySQL
    Utilise Flask 'g' pour réutiliser la connexion pendant la requête
    
    Returns:
        pymysql.Connection: Connexion à la base de données
    """
    if 'db' not in g:
        g.db = pymysql.connect(
            host=current_app.config['DB_HOST'],
            port=current_app.config['DB_PORT'],
            user=current_app.config['DB_USER'],
            password=current_app.config['DB_PASSWORD'],
            database=current_app.config['DB_NAME'],
            cursorclass=DictCursor,  # Retourne des dictionnaires au lieu de tuples
            autocommit=False  # Gestion manuelle des transactions
        )
    return g.db


def close_db_connection(error=None):
    """
    Ferme la connexion à la base de données à la fin de la requête
    
    Args:
        error: Erreur éventuelle
    """
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    """
    Initialise les hooks de base de données avec Flask
    
    Args:
        app (Flask): Instance de l'application
    """
    app.teardown_appcontext(close_db_connection)


@contextmanager
def get_cursor(commit=False):
    """
    Context manager pour obtenir un curseur MySQL
    Gère automatiquement la fermeture et le commit/rollback
    
    Args:
        commit (bool): Si True, commit automatique en cas de succès
    
    Yields:
        pymysql.cursors.DictCursor: Curseur pour exécuter des requêtes
    
    Example:
        with get_cursor(commit=True) as cursor:
            cursor.execute("INSERT INTO zone (...) VALUES (...)")
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        if commit:
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()


def execute_query(query, params=None, commit=False):
    """
    Exécute une requête SQL (INSERT, UPDATE, DELETE)
    
    Args:
        query (str): Requête SQL avec placeholders %s
        params (tuple|dict): Paramètres pour la requête
        commit (bool): Si True, commit la transaction
    
    Returns:
        int: Nombre de lignes affectées
    
    Example:
        execute_query(
            "INSERT INTO zone (nom_zone, superficie) VALUES (%s, %s)",
            ("Zone Test", 100.5),
            commit=True
        )
    """
    with get_cursor(commit=commit) as cursor:
        cursor.execute(query, params or ())
        return cursor.rowcount


def fetch_one(query, params=None):
    """
    Exécute une requête SELECT et retourne une seule ligne
    
    Args:
        query (str): Requête SQL SELECT
        params (tuple|dict): Paramètres pour la requête
    
    Returns:
        dict|None: Dictionnaire représentant la ligne ou None si aucun résultat
    
    Example:
        zone = fetch_one("SELECT * FROM zone WHERE id_zone = %s", (1,))
    """
    with get_cursor() as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchone()


def fetch_all(query, params=None):
    """
    Exécute une requête SELECT et retourne toutes les lignes
    
    Args:
        query (str): Requête SQL SELECT
        params (tuple|dict): Paramètres pour la requête
    
    Returns:
        list[dict]: Liste de dictionnaires représentant les lignes
    
    Example:
        zones = fetch_all("SELECT * FROM zone WHERE niveau_risque = %s", ('ELEVE',))
    """
    with get_cursor() as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchall()


def execute_procedure(procedure_name, params=None):
    """
    Exécute une procédure stockée MySQL
    
    Args:
        procedure_name (str): Nom de la procédure
        params (tuple): Paramètres de la procédure
    
    Returns:
        list: Résultats de la procédure (peut contenir plusieurs result sets)
    
    Example:
        results = execute_procedure('system_status_report')
    """
    with get_cursor() as cursor:
        cursor.callproc(procedure_name, params or ())
        
        # Récupérer tous les result sets
        results = []
        while True:
            result = cursor.fetchall()
            if result:
                results.append(result)
            if not cursor.nextset():
                break
        
        return results