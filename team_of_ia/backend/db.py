import pymysql

def get_connection():
    connection = pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="urba_drain_agadir",
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection