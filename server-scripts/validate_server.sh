#!/bin/bash

# Validate that the Server service is running correctly
echo "Validating Server service..."

# Check if the service is active
if ! systemctl is-active --quiet server.service; then
    echo "Service is not active"
    systemctl status server.service
    exit 1
fi

# Check if the application is responding on the expected port
echo "Checking if application responds on port 4000..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -f -s http://localhost:4000/api/health >/dev/null 2>&1; then
        echo "Application is responding on port 4000"
        break
    fi
    
    echo "Waiting for application to respond... ($timeout seconds remaining)"
    sleep 2
    ((timeout-=2))
done

if [ $timeout -le 0 ]; then
    echo "Application failed to respond within the timeout period"
    echo "Service status:"
    systemctl status server.service
    echo "Service logs:"
    journalctl -u server.service --lines=20
    echo "Port check:"
    netstat -tlnp | grep :4000
    exit 1
fi

# Additional health check if the endpoint exists
if curl -f -s http://localhost:4000/api/health >/dev/null 2>&1; then
    echo "Health check endpoint is responding"
else
    echo "Warning: Health check endpoint not responding, but port is open"
fi

echo "Service validation completed successfully"
exit 0#!/bin/bash

# Validate that the Express API service is running correctly
echo "Validating Express API service..."

# Check if the service is active
if ! systemctl is-active --quiet expressapi.service; then
    echo "Service is not active"
    systemctl status expressapi.service
    exit 1
fi

# Check if the application is responding on the expected port
echo "Checking if application responds on port 3000..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -f -s http://localhost:3000/api/health >/dev/null 2>&1; then
        echo "Application is responding on port 3000"
        break
    fi
    
    echo "Waiting for application to respond... ($timeout seconds remaining)"
    sleep 2
    ((timeout-=2))
done

if [ $timeout -le 0 ]; then
    echo "Application failed to respond within the timeout period"
    echo "Service status:"
    systemctl status expressapi.service
    echo "Service logs:"
    journalctl -u expressapi.service --lines=20
    echo "Port check:"
    netstat -tlnp | grep :3000
    exit 1
fi

# Additional health check if the endpoint exists
if curl -f -s http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "Health check endpoint is responding"
else
    echo "Warning: Health check endpoint not responding, but port is open"
fi

echo "Service validation completed successfully"
exit 0