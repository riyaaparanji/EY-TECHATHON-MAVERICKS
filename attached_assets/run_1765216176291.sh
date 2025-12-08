#!/usr/bin/env bash
set -e
# Start backend
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ../frontend
if [ ! -d node_modules ]; then
  npm install --legacy-peer-deps
fi
npm run dev
# on exit, kill backend
kill $BACKEND_PID
