#!/bin/bash

APP_DIR="/var/www/app1"
REPO_URL="git@github.com:SleepyZenitsu/chronos.git"
BRANCH="main"

# Navigate to the app directory
cd $APP_DIR || exit

# Pull the latest code
git reset --hard
git pull origin $BRANCH

# Install dependencies using Bun
bun install

# Stop any running instance (if necessary)
pkill -f "bun run" || true

# Start the app
nohup bun run src/index.js &

echo "Deployment complete!"
