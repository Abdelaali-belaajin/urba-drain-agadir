from app import create_app
from app.models.message import Message

app = create_app()
with app.app_context():
    messages = Message.query.all()
    for m in messages:
        print(m.to_dict())
