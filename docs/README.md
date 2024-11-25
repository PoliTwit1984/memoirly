# Memoirly

Memoirly is a Flask-based web application designed to help preserve family memories through guided questions and storytelling. The application uses AI to generate personalized questions based on family relationships and allows family members to share their stories, memories, and photos.

## Features

- User authentication and account management
- Add and manage family members
- AI-generated personalized questions based on relationships
- Categorized questions organized into meaningful themes
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

The application will be available at `http://localhost:3001`

## Key Components

### Models

- **User**: Manages user accounts and authentication
- **FamilyMember**: Stores family member information and relationships
- **Question**: Handles questions, answers, categories, and associated media

### Routes

- **auth.py**: Handles user registration, login, and logout
- **family.py**: Manages family member creation and management
- **questions.py**: Handles question generation, improvement, and management
- **main.py**: Core application routes and initialization

### Features

1. **AI Integration**
   - Generates 25 personalized questions based on relationships
   - Questions are categorized into five meaningful themes:
     * Childhood and Early Life
     * Family Relationships
     * Major Life Events
     * Life Wisdom and Values
     * Fun and Quirky Reflections
   - Improves questions for better engagement
   - Uses Claude AI for natural language processing

2. **Family Member Management**
   - Add family members with relationships
   - Customize questions for each member
   - Generate shareable links for answers

3. **Question Management**
   - AI-generated categorized starter questions
   - Custom question addition with category assignment
   - Question reordering within categories
   - Question improvement suggestions
   - Question deletion with position management

4. **Answer Collection**
   - Text-based answers
   - Photo upload support
   - Answer tracking and management
   - Organized display by question categories

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
- API endpoints follow a consistent structure:
  * `/api/questions/...` for question operations
  * `/api/family/...` for family member operations

## Security Features

- Password hashing for user accounts
- Secure file upload handling
- User session management
- Protected routes with login requirements
- Secure link generation for sharing

## Question Categories

The application organizes questions into five distinct categories to capture a comprehensive range of memories and experiences:

1. **Childhood and Early Life**
   - Early memories and experiences
   - Family traditions and customs
   - Personal milestones and achievements

2. **Family Relationships**
   - Connections with family members
   - Family dynamics and influences
   - Shared experiences and bonds

3. **Major Life Events**
   - Significant moments and decisions
   - Challenges and how they were overcome
   - Personal and professional milestones

4. **Life Wisdom and Values**
   - Life lessons and insights
   - Personal values and beliefs
   - Advice for future generations

5. **Fun and Quirky Reflections**
   - Favorite memories and moments
   - Hobbies and interests
   - Light-hearted stories and anecdotes

Each category is designed to elicit different types of memories and stories, creating a well-rounded collection of family history.
