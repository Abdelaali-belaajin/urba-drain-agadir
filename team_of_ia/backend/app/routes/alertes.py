from flask import Blueprint, jsonify
from db import get_connection

alertes_bp = Blueprint("alertes", __name__)

@alertes_bp.route("/alertes", methods=["GET"])
def get_alertes():

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT alerte_id,
                       niveau_alerte,
                       valeur_declenchante,
                       resolue
                FROM ALERTE
                ORDER BY alerte_id DESC
            """)

            alertes = cursor.fetchall()

        return jsonify(alertes)

    finally:
        connection.close()

@alertes_bp.route("/alertes/<int:id>/resoudre", methods=["PUT"])
def resoudre_alerte(id):

    connection = get_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute("""
                UPDATE ALERTE
                SET resolue = 1
                WHERE alerte_id = %s
            """, (id,))

            connection.commit()

        return {"message": "Alerte resolue"}

    finally:
        connection.close()