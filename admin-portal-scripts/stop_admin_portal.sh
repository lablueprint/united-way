#!/bin/bash

cd /opt/admin-portal

if [ -f admin-portal.pid ]; then
    PID=$(cat admin-portal.pid)

    if ps -p $PID > /dev/null; then
        echo "Stopping Admin Portal (PID: $PID)..."
        kill $PID

        # Wait for process to fully stop
        sleep 2

        if ps -p $PID > /dev/null; then
            echo "Process still running, force killing..."
            kill -9 $PID
        fi

        echo "Admin Portal stopped."
        rm -f admin-portal.pid
    else
        echo "Process not running, removing stale PID file."
        rm -f admin-portal.pid
    fi
else
    echo "No PID file found. Admin Portal may not be running."
fi