# app/db.py
#
# Ce fichier gère la connexion à MySQL via PyMySQL (SANS ORM)
#
# Ce que vous devez faire ici :
# 1. Importer pymysql et DictCursor
# 2. Importer Config depuis app.config
#
# 3. Créer une fonction get_db_connection() qui :
#    - Utilise pymysql.connect() pour se connecter
#    - Paramètres : host, port, user, password, database depuis Config
#    - Utilise cursorclass=DictCursor pour retourner des dictionnaires
#    - autocommit=False pour gérer les transactions manuellement
#    - Retourne la connexion
#
# 4. Créer une fonction execute_query(query, params, fetch_one, fetch_all, commit) qui :
#    - Crée une connexion
#    - Exécute la requête SQL avec cursor.execute()
#    - Si commit=True : commit() et retourner lastrowid ou rowcount
#    - Si fetch_one=True : retourner fetchone()
#    - Si fetch_all=True : retourner fetchall()
#    - Gérer les erreurs avec try/except et rollback()
#    - Toujours fermer la connexion dans finally
