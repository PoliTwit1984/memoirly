import os
from app import app, db, User, FamilyMember, Question

# Delete the existing database file
db_path = 'instance/memoirly.db'
if os.path.exists(db_path):
    os.remove(db_path)

# Create all tables
with app.app_context():
    db.create_all()
