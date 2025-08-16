# 🚀 Quick Setup Guide

## Prerequisites
- Docker and Docker Compose
- Git

## 🏃‍♂️ Quick Start with Docker

1. **Clone and navigate to project**
   ```bash
   git clone <your-repo-url>
   cd smart-polling-platform
   ```

2. **Start development environment**
   ```bash
   make dev
   # or
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin: http://localhost:8000/admin

## 🏃‍♂️ Production with Docker

1. **Start production environment**
   ```bash
   make prod
   # or
   docker-compose up -d
   ```

2. **Access the application**
   - Main App: http://localhost
   - Admin: http://localhost/admin

## 🔧 Docker Commands

### Development
```bash
# Start development environment
make dev

# Build development containers
make dev-build

# View development logs
make dev-logs

# Stop development environment
make down
```

### Production
```bash
# Start production environment
make prod

# Build production containers
make prod-build

# View production logs
make prod-logs

# Stop production environment
make down
```

### Useful Commands
```bash
# View all logs
make logs

# Clean up containers and volumes
make clean

# Run tests
make test

# Check service health
make health

# Database operations
make db-reset
make db-shell

# Backend operations
make backend-shell
make backend-migrate
make backend-collectstatic
```

## 📱 First Steps

1. **Visit the homepage**: http://localhost:3000
2. **Create your first poll**: Click "Create Poll"
3. **Add conditional questions**: Set up dependencies between questions
4. **Test the logic**: Participate in your own poll
5. **View results**: See real-time charts and analytics

## 🎯 Sample Poll Creation

Create a poll with this conditional flow:
- Q1: "Do you own a car?" (Yes/No)
- Q2: "What brand?" (depends on Q1 = "Yes")
- Q3: "Why not?" (depends on Q1 = "No")

## 🆘 Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check if port 8000 is available
- Run `python manage.py check` for configuration issues

### Frontend Issues
- Ensure Node.js version is 16+
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and run `npm install` again

### Database Issues
- Delete `backend/db.sqlite3` and run migrations again
- Check file permissions on the backend directory

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure ports 3000 and 8000 are not in use
4. Check the README.md for detailed documentation
