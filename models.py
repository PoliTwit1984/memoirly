from datetime import datetime
from flask_login import UserMixin
from config import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Tribe relationships
    owned_tribes = db.relationship('Tribe', backref='owner', lazy=True)
    tribe_memberships = db.relationship('TribeMembership', backref='user', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    # Legacy relationship for backward compatibility
    family_members = db.relationship('FamilyMember', backref='user', lazy=True)

class Tribe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    join_code = db.Column(db.String(6), unique=True)  # Added join_code field
    
    # Tribe relationships
    members = db.relationship('TribeMembership', backref='tribe', lazy=True)
    questions = db.relationship('Question', backref='tribe', lazy=True)
    invitations = db.relationship('TribeInvitation', backref='tribe', lazy=True)

class TribeMembership(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tribe_id = db.Column(db.Integer, db.ForeignKey('tribe.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='member')  # admin, member, guest
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Notification preferences
    notification_settings = db.Column(db.JSON)

class TribeInvitation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tribe_id = db.Column(db.Integer, db.ForeignKey('tribe.id'), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    accepted_at = db.Column(db.DateTime)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tribe_id = db.Column(db.Integer, db.ForeignKey('tribe.id'))  # Optional for legacy questions
    family_member_id = db.Column(db.Integer, db.ForeignKey('family_member.id'))  # Optional for legacy questions
    visibility = db.Column(db.String(20), default='tribe')  # tribe, private
    position = db.Column(db.Integer, nullable=False, default=0)
    is_collaborative = db.Column(db.Boolean, default=False)
    is_custom = db.Column(db.Boolean, default=False)
    
    # Relationships
    answers = db.relationship('Answer', backref='question', lazy=True)
    created_by = db.relationship('User', foreign_keys=[created_by_id], backref='created_questions')

class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    visibility = db.Column(db.String(20), default='tribe')
    
    # Media support
    media_paths = db.Column(db.JSON)  # Store multiple media file paths
    
    # Relationships
    comments = db.relationship('Comment', backref='answer', lazy=True)
    reactions = db.relationship('Reaction', backref='answer', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    answer_id = db.Column(db.Integer, db.ForeignKey('answer.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # love, laugh, meaningful, etc.
    answer_id = db.Column(db.Integer, db.ForeignKey('answer.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    content = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime)
    
    # Optional relationships for different notification types
    tribe_id = db.Column(db.Integer, db.ForeignKey('tribe.id'))
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    answer_id = db.Column(db.Integer, db.ForeignKey('answer.id'))
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'))

# Legacy model for backward compatibility
class FamilyMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    relationship = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text)
    email = db.Column(db.String(120))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Legacy relationship
    questions = db.relationship('Question', backref='family_member', lazy=True)
