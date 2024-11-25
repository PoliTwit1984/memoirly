from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import Question, FamilyMember
from config import db, logger
from utils import improve_question_with_ai, generate_questions

questions = Blueprint('questions', __name__)

@questions.route('/api/improve_question/<int:member_id>', methods=['POST'])
@login_required
def improve_question(member_id):
    try:
        logger.debug("Entering improve_question route")
        member = FamilyMember.query.get_or_404(member_id)
        if member.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'Question cannot be empty'}), 400
        
        logger.debug(f"Calling improve_question_with_ai with question: {question} and relationship: {member.relationship}")
        improved = improve_question_with_ai(question, member.relationship)
        logger.debug(f"Received improved question: {improved}")
        
        return jsonify({'improved': improved})
    except Exception as e:
        logger.error(f"Error in improve_question route: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@questions.route('/api/add_question/<int:member_id>', methods=['POST'])
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
        position=max_position + 1,
        is_custom=True
    )
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify({'success': True, 'question': {
        'id': question.id,
        'content': question.content,
        'position': question.position
    }})

@questions.route('/api/generate_more_questions/<int:member_id>')
@login_required
def generate_more_questions(member_id):
    member = FamilyMember.query.get_or_404(member_id)
    if member.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get the highest current position
    max_position = db.session.query(db.func.max(Question.position)).filter_by(family_member_id=member_id).scalar() or -1
    
    # Generate new questions
    questions = generate_questions(member.relationship, member.notes)
    new_questions = []
    
    # Add questions to database
    for i, q in enumerate(questions):
        question = Question(
            content=q,
            family_member_id=member.id,
            position=max_position + i + 1
        )
        db.session.add(question)
        db.session.commit()  # Commit each question to get its ID
        new_questions.append({
            'id': question.id,
            'content': q,
            'answered': False,
            'position': question.position
        })
    
    return jsonify({'questions': new_questions})

@questions.route('/api/delete_question/<int:question_id>', methods=['DELETE'])
@login_required
def delete_question(question_id):
    question = Question.query.get_or_404(question_id)
    member = FamilyMember.query.get(question.family_member_id)
    
    if member.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if question.answered_at:
        return jsonify({'error': 'Cannot delete answered questions'}), 400
        
    # Get all questions with higher positions
    higher_questions = Question.query.filter(
        Question.family_member_id == question.family_member_id,
        Question.position > question.position
    ).all()
    
    # Decrement their positions
    for q in higher_questions:
        q.position -= 1
    
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({'success': True})

@questions.route('/api/reorder_questions/<int:member_id>', methods=['POST'])
@login_required
def reorder_questions(member_id):
    member = FamilyMember.query.get_or_404(member_id)
    if member.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    question_order = data.get('questionOrder', [])
    
    # Update positions
    for position, question_id in enumerate(question_order):
        question = Question.query.get(question_id)
        if question and question.family_member_id == member_id:
            question.position = position
    
    db.session.commit()
    return jsonify({'success': True})
