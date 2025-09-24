#!/bin/bash
export MONGODB_URI=$(aws ssm get-parameter --name "/StackName/mongodb-uri" --with-decryption --region us-west-1 --query "Parameter.Value" --output text)
export JWT_SECRET=$(aws ssm get-parameter --name "/StackName/jwt-secret" --with-decryption --region us-west-1 --query "Parameter.Value" --output text)
export REFRESH_SECRET=$(aws ssm get-parameter --name "/StackName/refresh-secret" --with-decryption --region us-west-1 --query "Parameter.Value" --output text)
export HASH_SALT=$(aws ssm get-parameter --name "/StackName/hash-salt" --with-decryption --region us-west-1 --query "Parameter.Value" --output text)
export EMAIL_USER=$(aws ssm get-parameter --name "/StackName/email-user" --with-decryption --region us-west-1 --query "Parameter.Value" --output text)
export EMAIL_PASS=$(aws ssm get-parameter --name "/StackName/email-pass" --with-decryption --region us-west-1 --query "Parameter.Value" --output text)
export NODE_ENV="prod"
export PORT=4000
export SALT_ROUNDS=10

# Dynamically get CloudFront URL for CORS, fallback to wildcard for initial deployment
export CORS_ORIGIN="$(aws cloudformation describe-stacks --stack-name StackName --region us-west-1 --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' --output text 2>/dev/null || echo '*')"

cd /opt/server
exec node server.js