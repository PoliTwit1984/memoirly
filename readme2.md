# Tribez Application

## Overview
Tribez is a cross-platform mobile and web application built with Expo React Native and Flask. It enables users to create and join tribes, fostering community engagement through a simple and intuitive interface.

## Tech Stack

### Frontend
- Expo React Native with TypeScript
- Expo Router for file-based navigation
- AsyncStorage for local data persistence
- Axios for API communication
- JWT for authentication
- Custom responsive design system
- Platform-specific optimizations for web and native

### Backend
- Flask (Python)
- Flask-JWT-Extended for authentication
- Azure Cosmos DB for data storage
- CORS support
- Bcrypt for password hashing

## Features

### Authentication
- User registration with email/password
- JWT-based authentication
- Secure password hashing
- Protected routes
- Form validation with error handling
- Responsive design for mobile and desktop
- Keyboard handling optimizations
- Toast notifications (web) and alerts (mobile)

### Tribe Management
- Create new tribes
- Join existing tribes via invite codes
- View tribe memberships
- Role-based access (admin/member)

### User Interface
- Tab-based navigation
- Tribe discovery section
- Profile management
- Settings interface
- Responsive components
- Platform-specific optimizations
- Loading states and animations
- Error handling and user feedback

## Project Structure

```
tribez/
├── backend/                     # Flask backend
│   ├── app/                     
│   │   ├── __init__.py         # App initialization
│   │   ├── routes.py           # API endpoints
│   │   └── models.py           # Data models
│   ├── requirements.txt        # Python dependencies
│   └── run.py                  # Entry point
└── frontend/                   # Expo React Native frontend
    └── tribez-mobile/          
        ├── app/                # Expo Router pages
        │   ├── _layout.tsx     # Root layout
        │   ├── index.tsx       # Auth screen
        │   └── (tabs)/         # Authenticated screens
        ├── components/         # Reusable components
        ├── services/           # API services
        ├── utils/              # Utility functions
        ├── hooks/              # Custom hooks
        └── constants/          # Theme and constants
```

## Setup Instructions

### Backend Setup
1. Create Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables in `.env`:
```
COSMOS_ENDPOINT=your_cosmos_endpoint
COSMOS_KEY=your_cosmos_key
SECRET_KEY=your_flask_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
```

4. Run the Flask server:
```bash
python run.py
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend/tribez-mobile
npm install
```

2. Start the Expo development server:
```bash
npx expo start
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Tribes
- `POST /api/tribe` - Create new tribe
- `POST /api/tribe/join` - Join existing tribe
- `GET /api/tribes` - Get user's tribes

## Error Handling

The application implements comprehensive error handling:
- Form validation with field-level errors
- API error handling with user-friendly messages
- Network error detection and handling
- Platform-specific error presentation (Toast for web, Alert for mobile)

## Responsive Design

The UI is optimized for both mobile and desktop:
- Mobile-first approach
- Responsive layout adjustments
- Platform-specific UI components
- Touch-friendly inputs on mobile
- Keyboard handling optimizations
- Smooth animations and transitions

## Development Status
- Authentication system complete with error handling
- Responsive UI components implemented
- Platform-specific optimizations in place
- Keyboard handling and form validation complete
- Error handling system implemented
- Toast notifications for web platform

See tasks2.md for current progress and upcoming tasks.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
MIT License
