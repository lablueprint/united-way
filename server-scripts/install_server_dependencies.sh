#!/bin/bash

# Install dependencies for the Server
echo "Installing dependencies..."

# Navigate to the application directory
cd /opt/server || exit 1

# Ensure correct ownership
chown -R server:server /opt/server

# Install Node.js dependencies
if [ -f package.json ]; then
    echo "Installing npm dependencies..."
    
    # Run npm install as the server user
    sudo -u server npm ci --production --silent || {
        echo "npm ci failed, trying npm install..."
        sudo -u server npm install --production --silent
    }
    
    if [ $? -eq 0 ]; then
        echo "Dependencies installed successfully"
    else
        echo "Failed to install dependencies"
        exit 1
    fi
else
    echo "No package.json found, skipping npm install"
fi

# Ensure the start script is executable
if [ -f /opt/server/start-server.sh ]; then
    chmod +x /opt/server/start-server.sh
    chown server:server /opt/server/start-server.sh
fi

echo "Dependencies installation completed"
exit 0