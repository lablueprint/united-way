#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { NextJsExpressStack } from '../lib/nextjs-express-stack';

const app = new cdk.App();

// Get environment from context or environment variable
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';

// Get secrets from environment variables or context
const mongodbUri = app.node.tryGetContext('mongodb-uri') || process.env.MONGODB_URI || '';
const jwtSecret = app.node.tryGetContext('jwt-secret') || process.env.JWT_SECRET || '';

if (!mongodbUri || !jwtSecret) {
  throw new Error('MongoDB URI and JWT Secret are required. Set them via context or environment variables.');
}

// Create stack for the specified environment
new NextJsExpressStack(app, `NextJsExpress-${environment}`, {
  environment: environment as 'dev' | 'staging' | 'prod',
  mongodbUri,
  jwtSecret,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();