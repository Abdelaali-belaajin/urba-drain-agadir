from app import create_app
from db import db
from app.models.message import Message
from app.models.utilisateur import Utilisateur

app = create_app()
with app.app_context():
    messages = Message.query.all()
    for m in messages:
        print(f"Msg ID: {m.message_id}, Exp ID: {m.expediteur_id}, Expediteur: {m.expediteur}")
        if m.expediteur:
            print(f"   Name: {m.expediteur.nom}, Role: {m.expediteur.role}")
