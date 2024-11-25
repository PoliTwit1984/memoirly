from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, login_required, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from config import db, login_manager

auth = Blueprint('auth', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth.route('/register', methods=['GET', 'POST'])
def register():
    next_action = request.args.get('next')
    tribe_code = request.args.get('code')
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        name = request.form.get('name')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists')
            return redirect(url_for('auth.register', next=next_action, code=tribe_code))
        
        hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(email=email, password=hashed_password, name=name)
        db.session.add(new_user)
        db.session.commit()
        
        login_user(new_user)

        # Handle post-registration redirects based on the next parameter
        if next_action == 'join_tribe' and tribe_code:
            return redirect(url_for('main.join_tribe_by_code', tribe_code=tribe_code))
        elif next_action == 'create_tribe':
            return redirect(url_for('main.create_tribe'))
        else:
            return redirect(url_for('main.list_tribes'))
    
    return render_template('register.html', next=next_action, tribe_code=tribe_code)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    next_action = request.args.get('next')
    tribe_code = request.args.get('code')
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            
            # Handle post-login redirects based on the next parameter
            if next_action == 'join_tribe' and tribe_code:
                return redirect(url_for('main.join_tribe_by_code', tribe_code=tribe_code))
            elif next_action == 'create_tribe':
                return redirect(url_for('main.create_tribe'))
            else:
                return redirect(url_for('main.list_tribes'))
        else:
            flash('Invalid credentials')
    
    return render_template('login.html', next=next_action, tribe_code=tribe_code)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))
