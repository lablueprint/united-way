#!/bin/bash
set -e

export NODE_ENV="prod"
export PORT=3000

# Get CloudFront URL for environment variable
export NEXT_PUBLIC_API_URL="$(aws cloudformation describe-stacks \
  --stack-name StackName \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
  --output text 2>/dev/null || echo 'http://localhost:4000')"

cd /opt/admin-portal

echo "Starting Admin Portal with API URL: $NEXT_PUBLIC_API_URL"

# Start app in background, save PID to file
npm start

echo $! > admin-portal.pid

echo "Admin Portal started with PID $(cat admin-portal.pid)"