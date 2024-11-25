# Memoirly

Memoirly is a Flask-based web application designed to help preserve family memories through guided questions and storytelling. The application uses AI to generate personalized questions based on family relationships and allows family members to share their stories, memories, and photos.

## Features

- User authentication and account management
- Add and manage family members
- AI-generated personalized questions based on relationships
- Question management (add, improve, reorder, delete)
- Photo upload support for answers
- Shareable links for family members to answer questions
- Responsive web interface

## Project Structure

```
memoirly/
├── config.py           # Flask app configuration and initialization
├── models.py          # Database models (User, FamilyMember, Question)
├── utils.py           # Helper functions and AI integration
├── auth.py            # Authentication routes
├── family.py          # Family member management routes
├── questions.py       # Question management routes
├── main.py           # Application entry point
├── templates/         # HTML templates
│   ├── components/   # Reusable template components
│   └── ...
└── static/           # Static files (CSS, uploads)
    ├── css/
    └── uploads/
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables in `.env`:
```
ANTHROPIC_API_KEY=your_api_key
UPLOAD_FOLDER=static/uploads
```

4. Initialize the database:
```bash
python init_db.py
```

5. Run the application:
```bash
python main.py
```

The application will be available at `http://localhost:3000`

## Key Components

### Models

- **User**: Manages user accounts and authentication
- **FamilyMember**: Stores family member information and relationships
- **Question**: Handles questions, answers, and associated media

### Routes

- **auth.py**: Handles user registration, login, and logout
- **family.py**: Manages family member creation and management
- **questions.py**: Handles question generation, improvement, and management
- **main.py**: Core application routes and initialization

### Features

1. **AI Integration**
   - Generates personalized questions based on relationships
   - Improves questions for better engagement
   - Uses Claude AI for natural language processing

2. **Family Member Management**
   - Add family members with relationships
   - Customize questions for each member
   - Generate shareable links for answers

3. **Question Management**
   - AI-generated starter questions
   - Custom question addition
   - Question reordering
   - Question improvement suggestions

4. **Answer Collection**
   - Text-based answers
   - Photo upload support
   - Answer tracking and management

## Dependencies

- Flask: Web framework
- Flask-SQLAlchemy: Database ORM
- Flask-Login: User authentication
- Anthropic: AI integration for question generation
- Werkzeug: Utilities for file handling and security
- Python-dotenv: Environment variable management

## Development

The project follows a modular structure for better maintainability:

- Each major feature has its own Blueprint
- Database models are separated by functionality
- Utility functions are isolated in utils.py
- Configuration is centralized in config.py

## Security Features

- Password hashing for user accounts
- Secure file upload handling
- User session management
- Protected routes with login requirements
- Secure link generation for sharing
