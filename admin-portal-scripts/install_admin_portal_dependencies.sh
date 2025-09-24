#!/bin/bash
set -e

echo "Installing Admin Portal dependencies..."

cd /opt/admin-portal

# Install only production dependencies
npm install --production

echo "Dependencies installed."
