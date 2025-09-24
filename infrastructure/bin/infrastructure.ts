#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { AdminPortalServerStack } from '../lib/admin-portal-server-stack';

const app = new cdk.App();

// Get environment from context or environment variable
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';

// Get secrets from environment variables or context
const mongodbUri = app.node.tryGetContext('mongodb-uri') || process.env.MONGODB_URI || '';
const jwtSecret = app.node.tryGetContext('jwt-secret') || process.env.JWT_SECRET || '';
const hashSalt = app.node.tryGetContext('hash-salt') || process.env.HASH_SALT || '';
const emailUser = app.node.tryGetContext('email-user') || process.env.EMAIL_USER || '';
const emailPass = app.node.tryGetContext('email-pass') || process.env.EMAIL_PASS || '';
const refreshSecret = app.node.tryGetContext('refresh-secret') || process.env.REFRESH_SECRET || '';

// Domain (optional)
const domainName = app.node.tryGetContext('domain-name') || process.env.DOMAIN_NAME;

// Validation
const requiredSecrets = {
  'MongoDB URI': mongodbUri,
  'JWT Secret': jwtSecret,
  'Hash Salt': hashSalt,
  'Refresh Secret': refreshSecret,
  'Email User': emailUser,
  'Email Pass': emailPass,
};

const missingSecrets = Object.entries(requiredSecrets)
  .filter(([, value]) => !value || value.trim().length === 0)
  .map(([name]) => name);

if (missingSecrets.length > 0) {
  throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}. Set them via context or environment variables.`);
}

// Create stack for the specified environment
new AdminPortalServerStack(app, `AdminPortalServerStack-${environment}`, {
  environment: environment as 'dev' | 'staging' | 'prod',
  mongodbUri,
  jwtSecret,
  refreshSecret,
  hashSalt,
  emailUser,
  emailPass,
  domainName
});

app.synth();