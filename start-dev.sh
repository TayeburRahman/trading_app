#!/bin/bash

while true; do
  echo "🔁 Starting server at $(date)"
  npm run dev
  echo "❌ Server crashed at $(date). Restarting in 5s..."
  sleep 5
done

