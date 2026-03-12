from flask import Blueprint, jsonify
from db import get_connection

zones_bp = Blueprint("zones", __name__)

@zones_bp.route("/zones", methods=["GET"])
def get_zones():

    connection = get_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM ZONE")
            zones = cursor.fetchall()

        return jsonify(zones)

    finally:
        connection.close()