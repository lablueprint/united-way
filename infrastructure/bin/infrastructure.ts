#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AdminPortalServerStack } from '../lib/admin-portal-server-stack';

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'dev';

// Get secrets from context
const mongodbUri = app.node.tryGetContext('mongodb-uri');
const jwtSecret = app.node.tryGetContext('jwt-secret');
const refreshSecret = app.node.tryGetContext('refresh-secret');
const hashSalt = app.node.tryGetContext('hash-salt');
const emailUser = app.node.tryGetContext('email-user');
const emailPass = app.node.tryGetContext('email-pass');

// CHANGED: Get optional domain configuration from context
const domainName = app.node.tryGetContext('domain-name');
const hostedZoneId = app.node.tryGetContext('hosted-zone-id');
const cloudFrontCertificateArn = app.node.tryGetContext('cloudfront-certificate-arn');

// Validate required secrets
if (!mongodbUri || !jwtSecret || !refreshSecret || !hashSalt || !emailUser || !emailPass) {
  throw new Error('Missing required context variables. Please provide all secrets via --context flags.');
}

const stackProps: any = {
  environment: environment as 'dev' | 'staging' | 'prod',
  mongodbUri,
  jwtSecret,
  refreshSecret,
  hashSalt,
  emailUser,
  emailPass
};

// CHANGED: Only add domain if both are provided
if (domainName && hostedZoneId) {
  stackProps.domainName = domainName;
  stackProps.hostedZoneId = hostedZoneId;
  stackProps.cloudFrontCertificateArn = cloudFrontCertificateArn;
  console.log(`Deploying with custom domain: ${domainName}`);
} else {
  console.log('Deploying without custom domain (using AWS-generated URLs)');
}

new AdminPortalServerStack(
  app, 
  `AdminPortalServerStack-${environment}`,
  stackProps
);

app.synth();