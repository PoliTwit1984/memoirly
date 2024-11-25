# Tribez Mobile Application

## Project Overview
Tribez is a mobile application built with React Native and Expo, designed to help people create and manage their tribes (communities). The backend is powered by Python Flask with Azure Cosmos DB for data storage.

## Current Project Status
- Backend: Running with basic API endpoints and Cosmos DB integration
- Frontend: In development, currently resolving build and dependency issues
- Testing: Initial test setup complete, working on resolving test environment issues

## Tech Stack
### Frontend
- React Native / Expo
- TypeScript
- React Navigation for routing
- Jest for testing
- Custom UI components with theme support

### Backend
- Python Flask
- Azure Cosmos DB
- JWT for authentication
- RESTful API architecture

## Project Structure
```
tribez/
├── backend/
│   ├── app/
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── __init__.py
│   └── run.py
├── frontend/
│   └── tribez-mobile/
│       ├── app/
│       ├── components/
│       ├── services/
│       ├── utils/
│       └── ...
└── docs/
    └── various documentation files
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python run.py
   ```
   The server will start on http://localhost:5002

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/tribez-mobile
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Use Expo Go app to run on your device or emulator

## Current Development Focus
1. Resolving frontend build issues:
   - Fixing expo-font/server module resolution
   - Resolving web platform dependencies
2. Implementing core features:
   - Authentication system
   - Tribe creation and management
   - User profiles
   - Real-time communication

## Testing
- Backend: Python unittest
- Frontend: Jest and React Testing Library
- Current focus: Resolving test environment configuration issues

## API Documentation
The backend provides RESTful endpoints for:
- User authentication (/auth)
- Tribe management (/tribes)
- User profiles (/users)
- Tribe membership (/tribe-members)

Detailed API documentation is available in the docs directory.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Environment Variables
Required environment variables:
- COSMOS_ENDPOINT
- COSMOS_KEY
- JWT_SECRET_KEY
- FLASK_ENV

## Known Issues
1. expo-font/server module resolution error in web platform
2. Test environment configuration needs updates
3. Web platform bundling issues

## Next Steps
1. Resolve current build and dependency issues
2. Complete core feature implementation
3. Add comprehensive test coverage
4. Implement security measures
5. Set up CI/CD pipeline

## License
MIT License - see LICENSE file for details

## Contact
Project maintained by the Tribez team
