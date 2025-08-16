# 🚀 Quick Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- Git

## 🏃‍♂️ Quick Start (Windows)

1. **Clone and navigate to project**
   ```bash
   git clone <your-repo-url>
   cd smart-polling-platform
   ```

2. **Run the startup script**
   ```bash
   start.bat
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🏃‍♂️ Quick Start (Mac/Linux)

1. **Clone and navigate to project**
   ```bash
   git clone <your-repo-url>
   cd smart-polling-platform
   ```

2. **Make script executable and run**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🔧 Manual Setup

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
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
