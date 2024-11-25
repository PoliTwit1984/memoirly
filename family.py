from flask import Blueprint, render_template, request, redirect, url_for, jsonify, flash, current_app
from flask_login import login_required, current_user
from models import FamilyMember, Question
from config import db
from utils import generate_questions, allowed_file
from datetime import datetime
from werkzeug.utils import secure_filename
import os

family = Blueprint('family', __name__)

@family.route('/dashboard')
@login_required
def dashboard():
    family_members = FamilyMember.query.filter_by(user_id=current_user.id).all()
    return render_template('dashboard.html', family_members=family_members)

@family.route('/add_family_member', methods=['GET', 'POST'])
@login_required
def add_family_member():
    if request.method == 'POST':
        name = request.form.get('name')
        relationship = request.form.get('relationship')
        if relationship == 'Other':
            relationship = request.form.get('other_relationship')
        notes = request.form.get('notes')
        email = request.form.get('email')
        
        new_member = FamilyMember(
            name=name,
            relationship=relationship,
            notes=notes,
            email=email,
            user_id=current_user.id
        )
        db.session.add(new_member)
        db.session.flush()  # Get the new member's ID
        
        # Generate AI questions
        questions = generate_questions(relationship, notes)
        position = 0
        
        for q in questions:
            question = Question(
                content=q['content'],
                category=q['category'],
                family_member_id=new_member.id,
                created_by_id=current_user.id,  # Set the creator
                position=position,
                visibility='circle',  # Set default visibility
                is_collaborative=False,  # Set default collaboration setting
                is_custom=False  # This is an AI-generated question
            )
            position += 1
            db.session.add(question)
        
        db.session.commit()
        
        return redirect(url_for('family.dashboard'))
    
    return render_template('add_family_member.html')

@family.route('/family_member/<int:member_id>')
@login_required
def family_member_detail(member_id):
    member = FamilyMember.query.get_or_404(member_id)
    if member.user_id != current_user.id:
        return redirect(url_for('family.dashboard'))
    return render_template('family_member_detail.html', member=member)

@family.route('/answer/<int:member_id>', methods=['GET', 'POST'])
def answer_questions(member_id):
    member = FamilyMember.query.get_or_404(member_id)
    if request.method == 'POST':
        for question in member.questions:
            answer = request.form.get(f'answer_{question.id}')
            if answer:
                question.answer = answer
                question.answered_at = datetime.utcnow()
                
            # Handle image upload
            image = request.files.get(f'image_{question.id}')
            if image and allowed_file(image.filename):
                filename = secure_filename(image.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                image.save(filepath)
                question.image_path = filename
        
        db.session.commit()
        flash('Thank you for sharing your memories!')
        return redirect(url_for('main.thank_you'))
    
    return render_template('answer_questions.html', member=member)

@family.route('/api/generate_link/<int:member_id>')
@login_required
def generate_link(member_id):
    member = FamilyMember.query.get_or_404(member_id)
    if member.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    link = url_for('family.answer_questions', member_id=member_id, _external=True)
    return jsonify({'link': link})

@family.route('/api/add_question/<int:member_id>', methods=['POST'])
@login_required
def add_question(member_id):
    member = FamilyMember.query.get_or_404(member_id)
    if member.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    question_text = data.get('question', '').strip()
    
    if not question_text:
        return jsonify({'error': 'Question cannot be empty'}), 400
    
    # Get the highest current position
    max_position = db.session.query(db.func.max(Question.position)).filter_by(family_member_id=member_id).scalar() or -1
    
    # Create new question
    question = Question(
        content=question_text,
        family_member_id=member_id,
        created_by_id=current_user.id,  # Set the creator
        position=max_position + 1,
        category='Custom Questions',  # Custom questions get their own category
        visibility='circle',  # Set default visibility
        is_collaborative=False,  # Set default collaboration setting
        is_custom=True  # This is a custom question
    )
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify({'success': True, 'question': {
        'id': question.id,
        'content': question.content,
        'position': question.position,
        'category': question.category
    }})
