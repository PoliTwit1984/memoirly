from flask import Blueprint, render_template, request, redirect, url_for, jsonify, flash, current_app, session
from flask_login import login_required, current_user
from models import Tribe, TribeMembership, TribeInvitation, User
from config import db
from datetime import datetime, timedelta
import secrets
from utils import send_invitation_email

tribes = Blueprint('tribes', __name__)

def generate_tribe_code():
    """Generate a unique 6-character code for tribe joining"""
    while True:
        code = secrets.token_urlsafe(4)[:6].upper()
        if not Tribe.query.filter_by(join_code=code).first():
            return code

@tribes.route('/tribes')
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

@tribes.route('/tribes/create', methods=['GET', 'POST'])
@login_required
def create_tribe():
    """Create a new tribe"""
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        
        # Create the tribe with a unique join code
        tribe = Tribe(
            name=name,
            description=description,
            owner_id=current_user.id,
            join_code=generate_tribe_code()
        )
        db.session.add(tribe)
        
        # Add creator as admin member
        membership = TribeMembership(
            user_id=current_user.id,
            tribe_id=tribe.id,
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
        return redirect(url_for('tribes.view_tribe', tribe_id=tribe.id))
    
    return render_template('tribes/create.html')

@tribes.route('/tribes/join', methods=['POST'])
@login_required
def join_tribe_by_code():
    """Join a tribe using its code"""
    code = request.form.get('tribe_code')
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
        return redirect(url_for('tribes.view_tribe', tribe_id=tribe.id))
    
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
    return redirect(url_for('tribes.view_tribe', tribe_id=tribe.id))

@tribes.route('/tribes/join/<token>')
def join_tribe(token):
    """Handle tribe invitation acceptance"""
    invitation = TribeInvitation.query.filter_by(token=token).first_or_404()
    
    # Check if invitation expired
    if invitation.expires_at < datetime.utcnow():
        flash('This invitation has expired', 'error')
        return redirect(url_for('main.index'))
    
    # Check if already accepted
    if invitation.accepted_at:
        flash('This invitation has already been used', 'info')
        return redirect(url_for('main.index'))
    
    if not current_user.is_authenticated:
        # Store token in session and redirect to register/login
        session['invitation_token'] = token
        return redirect(url_for('auth.register'))
    
    # Create membership
    membership = TribeMembership(
        user_id=current_user.id,
        tribe_id=invitation.tribe_id,
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
    
    # Mark invitation as accepted
    invitation.accepted_at = datetime.utcnow()
    db.session.commit()
    
    flash('Welcome to the tribe!', 'success')
    return redirect(url_for('tribes.view_tribe', tribe_id=invitation.tribe_id))

@tribes.route('/tribes/<int:tribe_id>')
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

@tribes.route('/tribes/<int:tribe_id>/invite', methods=['POST'])
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
        return redirect(url_for('tribes.view_tribe', tribe_id=tribe_id))
    
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
            return redirect(url_for('tribes.view_tribe', tribe_id=tribe_id))
    
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
    return redirect(url_for('tribes.view_tribe', tribe_id=tribe_id))

@tribes.route('/tribes/<int:tribe_id>/settings', methods=['GET', 'POST'])
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
        return redirect(url_for('tribes.view_tribe', tribe_id=tribe_id))
    
    if request.method == 'POST':
        tribe.name = request.form.get('name')
        tribe.description = request.form.get('description')
        db.session.commit()
        flash('Tribe settings updated', 'success')
        return redirect(url_for('tribes.view_tribe', tribe_id=tribe_id))
    
    return render_template('tribes/settings.html', tribe=tribe)

@tribes.route('/tribes/<int:tribe_id>/notifications', methods=['GET', 'POST'])
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
        return redirect(url_for('tribes.view_tribe', tribe_id=tribe_id))
    
    return render_template('tribes/notifications.html', 
                         membership=membership)
