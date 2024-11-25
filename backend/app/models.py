from datetime import datetime
import uuid

class User:
    def __init__(self, email, password):
        self.id = str(uuid.uuid4())
        self.email = email
        self.password = password
        self.created_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'password': self.password,
            'created_at': self.created_at
        }

    @staticmethod
    def from_dict(data):
        user = User(data['email'], data['password'])
        user.id = data.get('id', str(uuid.uuid4()))
        user.created_at = data.get('created_at', datetime.utcnow().isoformat())
        return user

class Tribe:
    def __init__(self, name, code):
        self.id = str(uuid.uuid4())
        self.name = name
        self.code = code
        self.created_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'created_at': self.created_at
        }

    @staticmethod
    def from_dict(data):
        tribe = Tribe(data['name'], data['code'])
        tribe.id = data.get('id', str(uuid.uuid4()))
        tribe.created_at = data.get('created_at', datetime.utcnow().isoformat())
        return tribe

class TribeMember:
    def __init__(self, user_id, tribe_id, role='member'):
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.tribe_id = tribe_id
        self.role = role
        self.joined_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tribe_id': self.tribe_id,
            'role': self.role,
            'joined_at': self.joined_at
        }

    @staticmethod
    def from_dict(data):
        member = TribeMember(data['user_id'], data['tribe_id'], data.get('role', 'member'))
        member.id = data.get('id', str(uuid.uuid4()))
        member.joined_at = data.get('joined_at', datetime.utcnow().isoformat())
        return member
