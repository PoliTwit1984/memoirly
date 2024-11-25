from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_required, current_user
from config import app, db
from auth import auth
from family import family
from questions import questions
from models import Tribe, TribeMembership, TribeInvitation, User
from datetime import datetime, timedelta
import secrets
from utils import send_invitation_email

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/thank_you')
def thank_you():
    return render_template('thank_you.html')

# Tribe routes
@main.route('/tribes')
@login_required
def list_tribes():
    """List all tribes the user is a member of"""
    user_tribes = (TribeMembership.query
                   .filter_by(user_id=current_user.id)
                   .join(Tribe)
                   .all())
    owned_tribes = Tribe.query.filter_by(owner_id=current_user.id).all()
    return render_template('tribes/list.html', 
                         memberships=user_tribes,
                         owned_tribes=owned_tribes)

@main.route('/tribes/create', methods=['GET', 'POST'])
@login_required
def create_tribe():
    """Create a new tribe"""
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        
        # Generate unique join code
        while True:
            join_code = secrets.token_urlsafe(4)[:6].upper()
            if not Tribe.query.filter_by(join_code=join_code).first():
                break
        
        # Create the tribe
        tribe = Tribe(
            name=name,
            description=description,
            owner_id=current_user.id,
            join_code=join_code
        )
        db.session.add(tribe)
        db.session.commit()  # Commit to get the tribe ID
        
        # Add creator as admin member
        membership = TribeMembership(
            user_id=current_user.id,
            tribe_id=tribe.id,  # Now we have the tribe ID
            role='admin',
            notification_settings={
                'questions': True,
                'answers': True,
                'comments': True,
                'reactions': True,
                'digest': 'daily'
            }
        )
        db.session.add(membership)
        db.session.commit()
        
        flash('Tribe created successfully!', 'success')
        return render_template('tribes/create.html', tribe=tribe)
    
    return render_template('tribes/create.html')

@main.route('/tribes/join', methods=['GET', 'POST'])
@login_required
def join_tribe_by_code():
    """Join a tribe using its code"""
    code = request.args.get('tribe_code') or request.form.get('tribe_code')
    if not code:
        flash('Please provide a tribe code', 'error')
        return redirect(url_for('main.index'))
    
    tribe = Tribe.query.filter_by(join_code=code.upper()).first()
    if not tribe:
        flash('Invalid tribe code', 'error')
        return redirect(url_for('main.index'))
    
    # Check if already a member
    existing_membership = TribeMembership.query.filter_by(
        user_id=current_user.id,
        tribe_id=tribe.id
    ).first()
    
    if existing_membership:
        flash('You are already a member of this tribe', 'info')
        return redirect(url_for('main.view_tribe', tribe_id=tribe.id))
    
    # Create membership
    membership = TribeMembership(
        user_id=current_user.id,
        tribe_id=tribe.id,
        role='member',
        notification_settings={
            'questions': True,
            'answers': True,
            'comments': True,
            'reactions': True,
            'digest': 'daily'
        }
    )
    db.session.add(membership)
    db.session.commit()
    
    flash('Welcome to the tribe!', 'success')
    return redirect(url_for('main.view_tribe', tribe_id=tribe.id))

@main.route('/tribes/<int:tribe_id>')
@login_required
def view_tribe(tribe_id):
    """View tribe details and activity"""
    tribe = Tribe.query.get_or_404(tribe_id)
    membership = TribeMembership.query.filter_by(
        user_id=current_user.id,
        tribe_id=tribe_id
    ).first_or_404()
    
    return render_template('tribes/view.html',
                         tribe=tribe,
                         membership=membership)

@main.route('/tribes/<int:tribe_id>/invite', methods=['POST'])
@login_required
def invite_member(tribe_id):
    """Invite a new member to the tribe"""
    tribe = Tribe.query.get_or_404(tribe_id)
    
    # Check if user has permission to invite
    membership = TribeMembership.query.filter_by(
        user_id=current_user.id,
        tribe_id=tribe_id
    ).first_or_404()
    
    if membership.role not in ['admin', 'member']:
        flash('You do not have permission to invite members', 'error')
        return redirect(url_for('main.view_tribe', tribe_id=tribe_id))
    
    email = request.form.get('email')
    
    # Check if already a member
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        existing_membership = TribeMembership.query.filter_by(
            user_id=existing_user.id,
            tribe_id=tribe_id
        ).first()
        if existing_membership:
            flash('This person is already a member of the tribe', 'info')
            return redirect(url_for('main.view_tribe', tribe_id=tribe_id))
    
    # Create invitation
    token = secrets.token_urlsafe(32)
    invitation = TribeInvitation(
        tribe_id=tribe_id,
        email=email,
        token=token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(invitation)
    db.session.commit()
    
    # Send invitation email
    send_invitation_email(email, tribe, token)
    
    flash(f'Invitation sent to {email}', 'success')
    return redirect(url_for('main.view_tribe', tribe_id=tribe_id))

@main.route('/tribes/<int:tribe_id>/settings', methods=['GET', 'POST'])
@login_required
def tribe_settings(tribe_id):
    """Manage tribe settings"""
    tribe = Tribe.query.get_or_404(tribe_id)
    membership = TribeMembership.query.filter_by(
        user_id=current_user.id,
        tribe_id=tribe_id
    ).first_or_404()
    
    if membership.role != 'admin':
        flash('Only tribe admins can modify settings', 'error')
        return redirect(url_for('main.view_tribe', tribe_id=tribe_id))
    
    if request.method == 'POST':
        tribe.name = request.form.get('name')
        tribe.description = request.form.get('description')
        db.session.commit()
        flash('Tribe settings updated', 'success')
        return redirect(url_for('main.view_tribe', tribe_id=tribe_id))
    
    return render_template('tribes/settings.html', tribe=tribe)

@main.route('/tribes/<int:tribe_id>/notifications', methods=['GET', 'POST'])
@login_required
def notification_settings(tribe_id):
    """Manage personal notification settings for a tribe"""
    membership = TribeMembership.query.filter_by(
        user_id=current_user.id,
        tribe_id=tribe_id
    ).first_or_404()
    
    if request.method == 'POST':
        membership.notification_settings = {
            'questions': request.form.get('notify_questions') == 'on',
            'answers': request.form.get('notify_answers') == 'on',
            'comments': request.form.get('notify_comments') == 'on',
            'reactions': request.form.get('notify_reactions') == 'on',
            'digest': request.form.get('digest_frequency')
        }
        db.session.commit()
        flash('Notification settings updated', 'success')
        return redirect(url_for('main.view_tribe', tribe_id=tribe_id))
    
    return render_template('tribes/notifications.html', 
                         membership=membership)

# Register blueprints
app.register_blueprint(main)
app.register_blueprint(auth)
app.register_blueprint(family)
app.register_blueprint(questions)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=3001)
