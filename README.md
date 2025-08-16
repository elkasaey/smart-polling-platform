# 🗳️ Smart Polling Platform

A full-stack web application that allows users to create intelligent polls with conditional logic and view real-time results. Built with Django backend and React frontend.

## ✨ Features

- **Conditional Logic**: Create dynamic polls that show relevant questions based on previous answers
- **Real-time Results**: View live poll results with beautiful charts and analytics
- **Multiple Question Types**: Support for single choice, multiple choice, and text input questions
- **Anonymous Responses**: Allow both authenticated and anonymous poll participation
- **Poll Expiration**: Set expiration dates for polls
- **Responsive Design**: Modern, mobile-friendly UI built with React and Material-UI

## 🏗️ Architecture

### Backend (Django)
- **Framework**: Django 4.2.7 with Django REST Framework
- **Database**: SQLite (can be easily configured for PostgreSQL/MySQL)
- **Real-time**: WebSocket support via Django Channels
- **Authentication**: Session-based authentication with support for anonymous users

### Frontend (React)
- **Framework**: React 18 with React Router for navigation
- **Styling**: Custom CSS with responsive design
- **Charts**: Recharts library for data visualization
- **HTTP Client**: Axios for API communication

### Key Components

#### Backend Models
- **Poll**: Main poll entity with metadata
- **Question**: Individual questions with conditional logic support
- **Choice**: Options for multiple choice questions
- **Answer**: User responses stored as JSON for flexibility

#### Conditional Logic System
The platform implements a sophisticated conditional logic system:
- Questions can depend on previous question answers
- Support for multiple operators: equals, not equals, contains, not contains
- Dynamic question visibility based on user responses
- Validation to ensure conditional logic integrity

#### API Endpoints
- `POST /api/polls/` - Create new polls
- `GET /api/polls/:id/` - Retrieve poll details
- `POST /api/answers/submit/:id/` - Submit poll answers
- `GET /api/polls/:id/results/` - Get poll results
- `GET /api/participation/:id/questions/` - Get questions with conditional logic

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-polling-platform
   ```

2. **Start development environment**
   ```bash
   make dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin: http://localhost:8000/admin

### Production Deployment

1. **Start production environment**
   ```bash
   make prod
   ```

2. **Access the application**
   - Main App: http://localhost
   - Admin: http://localhost/admin

### Docker Commands

```bash
# Development
make dev          # Start development environment
make dev-build    # Build development containers
make dev-logs     # View development logs

# Production
make prod         # Start production environment
make prod-build   # Build production containers
make prod-logs    # View production logs

# General
make down         # Stop all containers
make logs         # View all logs
make clean        # Clean up containers and volumes
make test         # Run tests
make health       # Check service health
```

## 📖 Usage Examples

### Creating a Poll with Conditional Logic

1. Navigate to `/create` in the frontend
2. Fill in poll details (title, description, expiration)
3. Add questions:
   - **Question 1**: "Do you own a car?" (Single choice: Yes/No)
   - **Question 2**: "What brand?" (Single choice, depends on Q1 = "Yes")
   - **Question 3**: "Why not?" (Text input, depends on Q1 = "No")

### Sample Conditional Flow
```
Q1: Do you own a car? (Yes/No)
├─ If Yes → Q2: What brand? (Toyota, Honda, Ford, etc.)
└─ If No → Q3: Why not? (Text input)
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Database Configuration
The default configuration uses SQLite. To use PostgreSQL:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'smart_polling',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 API Documentation

### Poll Creation
```json
POST /api/polls/
{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our services",
  "allow_anonymous": true,
  "questions": [
    {
      "text": "How satisfied are you?",
      "question_type": "single_choice",
      "is_required": true,
      "choices": [
        {"text": "Very Satisfied"},
        {"text": "Satisfied"},
        {"text": "Neutral"},
        {"text": "Dissatisfied"}
      ]
    },
    {
      "text": "What would you improve?",
      "question_type": "text",
      "is_required": false,
      "depends_on": {
        "question_id": 0,
        "value": "Dissatisfied",
        "operator": "equals"
      }
    }
  ]
}
```

### Answer Submission
```json
POST /api/answers/submit/{poll_id}/
{
  "answers": [
    {
      "question_id": 1,
      "answer_value": 2
    },
    {
      "question_id": 2,
      "answer_value": "Better customer service"
    }
  ]
}
```

## 🚧 Future Improvements

With more time, I would implement:

1. **Advanced Analytics**: More sophisticated data visualization and insights
2. **User Management**: User registration, profiles, and poll history
3. **Poll Templates**: Pre-built poll templates for common use cases
4. **Export Features**: Export results to CSV, PDF, or Excel
5. **Real-time Updates**: WebSocket implementation for live result updates
6. **Advanced Conditional Logic**: More complex branching and skip logic
7. **Mobile App**: Native mobile applications for iOS and Android
8. **Integration APIs**: Webhook support and third-party integrations
9. **Multi-language Support**: Internationalization for global users
10. **Advanced Security**: Rate limiting, CAPTCHA, and fraud prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django and Django REST Framework for the robust backend
- React team for the amazing frontend framework
- Recharts for beautiful data visualization
- Material-UI for design inspiration

---

**Built with ❤️ for smart surveys and better data collection**
