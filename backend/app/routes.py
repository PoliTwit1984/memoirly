from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, Tribe, TribeMember
import bcrypt
import uuid
import random
import string

main = Blueprint('main', __name__)

def generate_tribe_code():
    """Generate a random 8-character tribe code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@main.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    try:
        # Check if user exists
        query = "SELECT * FROM c WHERE c.email = @email"
        parameters = [{"name": "@email", "value": data['email']}]
        existing_users = list(current_app.containers['users'].query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        if existing_users:
            return jsonify({'error': 'Email already registered'}), 400
        
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        user = User(data['email'], hashed_password.decode('utf-8'))
        user_dict = user.to_dict()
        current_app.containers['users'].create_item(body=user_dict)
        
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token, 'user_id': user.id}), 201
    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    try:
        # Find user
        query = "SELECT * FROM c WHERE c.email = @email"
        parameters = [{"name": "@email", "value": data['email']}]
        users = list(current_app.containers['users'].query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        if not users or not bcrypt.checkpw(
            data['password'].encode('utf-8'),
            users[0]['password'].encode('utf-8')
        ):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        user = users[0]
        access_token = create_access_token(identity=user['id'])
        return jsonify({'token': access_token, 'user_id': user['id']}), 200
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@main.route('/api/tribe', methods=['POST'])
@jwt_required()
def create_tribe():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Missing tribe name'}), 400
    
    try:
        # Generate a unique tribe code
        while True:
            code = generate_tribe_code()
            query = "SELECT * FROM c WHERE c.code = @code"
            parameters = [{"name": "@code", "value": code}]
            existing_tribes = list(current_app.containers['tribes'].query_items(
                query=query,
                parameters=parameters,
                enable_cross_partition_query=True
            ))
            if not existing_tribes:
                break
        
        # Create tribe
        tribe = Tribe(data['name'], code)
        tribe_dict = tribe.to_dict()
        current_app.containers['tribes'].create_item(body=tribe_dict)
        
        # Create tribe member
        member = TribeMember(user_id, tribe.id, 'admin')
        member_dict = member.to_dict()
        current_app.containers['tribe_members'].create_item(body=member_dict)
        
        return jsonify({
            'id': tribe.id,
            'name': tribe.name,
            'code': tribe.code
        }), 201
    except Exception as e:
        print(f"Error in create_tribe: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@main.route('/api/tribe/join', methods=['POST'])
@jwt_required()
def join_tribe():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data or not data.get('code'):
        return jsonify({'error': 'Missing tribe code'}), 400
    
    try:
        # Find tribe
        query = "SELECT * FROM c WHERE c.code = @code"
        parameters = [{"name": "@code", "value": data['code']}]
        tribes = list(current_app.containers['tribes'].query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        if not tribes:
            return jsonify({'error': 'Invalid tribe code'}), 404
        
        tribe = tribes[0]
        
        # Check if user is already a member
        query = """
        SELECT * FROM c 
        WHERE c.user_id = @user_id 
        AND c.tribe_id = @tribe_id
        """
        parameters = [
            {"name": "@user_id", "value": user_id},
            {"name": "@tribe_id", "value": tribe['id']}
        ]
        existing_members = list(current_app.containers['tribe_members'].query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        if existing_members:
            return jsonify({'error': 'Already a member of this tribe'}), 400
        
        # Create tribe member
        member = TribeMember(user_id, tribe['id'], 'member')
        member_dict = member.to_dict()
        current_app.containers['tribe_members'].create_item(body=member_dict)
        
        return jsonify({
            'id': tribe['id'],
            'name': tribe['name'],
            'code': tribe['code']
        }), 200
    except Exception as e:
        print(f"Error in join_tribe: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@main.route('/api/tribes', methods=['GET'])
@jwt_required()
def get_user_tribes():
    user_id = get_jwt_identity()
    
    try:
        # Get user's tribe memberships
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        parameters = [{"name": "@user_id", "value": user_id}]
        memberships = list(current_app.containers['tribe_members'].query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        tribes = []
        for membership in memberships:
            # Get tribe details
            query = "SELECT * FROM c WHERE c.id = @tribe_id"
            parameters = [{"name": "@tribe_id", "value": membership['tribe_id']}]
            tribe_results = list(current_app.containers['tribes'].query_items(
                query=query,
                parameters=parameters,
                enable_cross_partition_query=True
            ))
            
            if tribe_results:
                tribe = tribe_results[0]
                tribes.append({
                    'id': tribe['id'],
                    'name': tribe['name'],
                    'code': tribe['code'],
                    'role': membership['role']
                })
        
        return jsonify({'tribes': tribes}), 200
    except Exception as e:
        print(f"Error in get_user_tribes: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Add CORS headers to all responses
@main.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
