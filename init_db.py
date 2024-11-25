from config import app, db
from models import (
    User, Question, Answer,
    Tribe, TribeMembership, TribeInvitation,
    Comment, Reaction, Notification, FamilyMember
)
from datetime import datetime, timedelta
import secrets
from sqlalchemy import text, inspect

def table_exists(table_name):
    """Check if a table exists in the database"""
    inspector = inspect(db.engine)
    return table_name in inspector.get_table_names()

def add_new_columns():
    """Add new columns to existing tables"""
    with app.app_context():
        try:
            inspector = inspect(db.engine)
            
            # Check and add columns for Question table
            question_columns = {col['name'] for col in inspector.get_columns('question')}
            if 'created_by_id' not in question_columns:
                db.session.execute(text("""
                    ALTER TABLE question 
                    ADD COLUMN created_by_id INTEGER REFERENCES user(id);
                """))
            
            if 'tribe_id' not in question_columns:
                db.session.execute(text("""
                    ALTER TABLE question 
                    ADD COLUMN tribe_id INTEGER REFERENCES tribe(id);
                """))
            
            if 'visibility' not in question_columns:
                db.session.execute(text("""
                    ALTER TABLE question 
                    ADD COLUMN visibility VARCHAR(20) DEFAULT 'tribe';
                """))
            
            if 'is_collaborative' not in question_columns:
                db.session.execute(text("""
                    ALTER TABLE question 
                    ADD COLUMN is_collaborative BOOLEAN DEFAULT 0;
                """))
            
            # Check and add join_code column for Tribe table
            tribe_columns = {col['name'] for col in inspector.get_columns('tribe')}
            if 'join_code' not in tribe_columns:
                db.session.execute(text("""
                    ALTER TABLE tribe 
                    ADD COLUMN join_code VARCHAR(6) UNIQUE;
                """))
                
                # Generate join codes for existing tribes
                tribes = Tribe.query.all()
                for tribe in tribes:
                    while True:
                        code = secrets.token_urlsafe(4)[:6].upper()
                        if not Tribe.query.filter_by(join_code=code).first():
                            tribe.join_code = code
                            break
            
            db.session.commit()
            print("Added new columns successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error adding columns: {str(e)}")

def migrate_existing_data():
    """Migrate existing family members to tribes"""
    with app.app_context():
        try:
            # First ensure all new tables exist
            if not table_exists('tribe'):
                Tribe.__table__.create(db.engine)
                print("Created tribe table")
            
            if not table_exists('tribe_membership'):
                TribeMembership.__table__.create(db.engine)
                print("Created tribe_membership table")
            
            if not table_exists('tribe_invitation'):
                TribeInvitation.__table__.create(db.engine)
                print("Created tribe_invitation table")
            
            if not table_exists('comment'):
                Comment.__table__.create(db.engine)
                print("Created comment table")
            
            if not table_exists('reaction'):
                Reaction.__table__.create(db.engine)
                print("Created reaction table")
            
            if not table_exists('notification'):
                Notification.__table__.create(db.engine)
                print("Created notification table")
            
            # Add new columns to existing tables
            add_new_columns()
            
            # Get all users with their family members
            users = User.query.all()
            print(f"Found {len(users)} users to migrate")
            
            for user in users:
                print(f"Processing user: {user.name}")
                # Create a default tribe for each user with a unique join code
                while True:
                    join_code = secrets.token_urlsafe(4)[:6].upper()
                    if not Tribe.query.filter_by(join_code=join_code).first():
                        break
                
                default_tribe = Tribe(
                    name=f"{user.name}'s Tribe",
                    description="Automatically created from existing family members",
                    owner_id=user.id,
                    join_code=join_code
                )
                db.session.add(default_tribe)
                db.session.flush()  # Get the tribe ID
                print(f"Created tribe: {default_tribe.name} with code: {join_code}")
                
                # Add the user as an admin of their tribe
                admin_membership = TribeMembership(
                    user_id=user.id,
                    tribe_id=default_tribe.id,
                    role='admin',
                    notification_settings={
                        'questions': True,
                        'answers': True,
                        'comments': True,
                        'reactions': True,
                        'digest': 'daily'
                    }
                )
                db.session.add(admin_membership)
                print(f"Added user as admin to tribe")
                
                # Process each family member
                for member in user.family_members:
                    print(f"Processing family member: {member.name}")
                    if member.email:
                        # Create invitation for family members with email
                        invitation = TribeInvitation(
                            tribe_id=default_tribe.id,
                            email=member.email,
                            token=secrets.token_urlsafe(32),
                            expires_at=datetime.utcnow() + timedelta(days=7)
                        )
                        db.session.add(invitation)
                        print(f"Created invitation for: {member.email}")
                    
                    # Update existing questions
                    db.session.execute(
                        text("UPDATE question SET tribe_id = :tribe_id, created_by_id = :user_id WHERE family_member_id = :member_id"),
                        {"tribe_id": default_tribe.id, "user_id": user.id, "member_id": member.id}
                    )
                    print(f"Updated questions for family member: {member.name}")
                
            db.session.commit()
            print("Existing data migrated successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error during migration: {str(e)}")
            raise

def init_db(migrate=False):
    """Initialize the database"""
    with app.app_context():
        if migrate:
            print("Starting migration process...")
            migrate_existing_data()
        else:
            print("Dropping all tables...")
            db.drop_all()
            print("Creating all tables...")
            db.create_all()
        
        print("Database initialization completed!")

if __name__ == '__main__':
    import sys
    
    # Check if migration flag is provided
    migrate = '--migrate' in sys.argv
    
    if migrate:
        print("Performing migration without dropping existing data...")
        init_db(migrate=True)
    else:
        response = input("This will delete all existing data. Are you sure? (y/N): ")
        if response.lower() == 'y':
            print("Reinitializing database...")
            init_db(migrate=False)
        else:
            print("Operation cancelled.")
