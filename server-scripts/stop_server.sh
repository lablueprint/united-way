#!/bin/bash

# Stop the Server service
echo "Stopping Server service..."

# Stop systemd service if it exists and is running
if systemctl is-active --quiet server.service; then
    echo "Stopping server.service..."
    systemctl stop server.service
    
    # Wait for the service to stop
    timeout=30
    while [ $timeout -gt 0 ] && systemctl is-active --quiet server.service; do
        echo "Waiting for service to stop... ($timeout seconds remaining)"
        sleep 1
        ((timeout--))
    done
    
    if systemctl is-active --quiet server.service; then
        echo "Service did not stop gracefully, force stopping..."
        systemctl kill server.service
    fi
fi

# Kill any remaining Node processes running on port 4000
echo "Checking for processes on port 4000..."
PIDS=$(lsof -ti:4000 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "Killing processes on port 4000: $PIDS"
    kill -TERM $PIDS 2>/dev/null
    sleep 5
    
    # Force kill if still running
    PIDS=$(lsof -ti:4000 2>/dev/null)
    if [ ! -z "$PIDS" ]; then
        echo "Force killing processes: $PIDS"
        kill -KILL $PIDS 2>/dev/null
    fi
fi

echo "Server application stopped successfully"
exit 0