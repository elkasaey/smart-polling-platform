#!/bin/bash

echo "Starting Smart Polling Platform..."
echo

echo "Starting Backend Server..."
cd backend
python manage.py runserver &
BACKEND_PID=$!
cd ..

echo
echo "Starting Frontend Server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for interrupt signal
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait
