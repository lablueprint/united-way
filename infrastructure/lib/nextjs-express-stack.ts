import * as cdk from 'aws-cdk-lib';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface AdminPortalServerStackProps extends cdk.StackProps {
  environment: 'dev' | 'staging' | 'prod';
  mongodbUri: string;
  jwtSecret: string;
  refreshSecret: string;
  hashSalt: string;
  emailUser: string;
  emailPass: string;
  domainName?: string; // Optional custom domain
}

export class AdminPortalServerStack extends cdk.Stack {
  public readonly serverCodeDeployApp: codedeploy.ServerApplication;
  public readonly adminPortalCodeDeployApp: codedeploy.ServerApplication;
  public readonly cloudFrontDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: AdminPortalServerStackProps) {
    super(scope, id, props);

    const { environment, mongodbUri, jwtSecret, refreshSecret, hashSalt, emailUser, emailPass, domainName } = props;

    // Environment-specific configuration
    const config = this.getEnvironmentConfig(environment);

    // VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: environment === 'prod' ? 2 : 1, // HA for prod
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    console.log('mongodb value:', mongodbUri);
    console.log('mongodb type:', typeof mongodbUri);
    console.log('mongodb length:', mongodbUri?.length);

    // Parameter Store for secrets
    const mongodbParameter = new ssm.StringParameter(this, 'MongoDBURI', {
      parameterName: `/${id}/mongodb-uri`,
      stringValue: mongodbUri,
      allowedPattern: '.*'
    });

    console.log('jwt value:', jwtSecret);
    console.log('jwt type:', typeof jwtSecret);
    console.log('jwt length:', jwtSecret?.length);


    const jwtSecretParameter = new ssm.StringParameter(this, 'JWTSecret', {
      parameterName: `/${id}/jwt-secret`,
      stringValue: jwtSecret,
      allowedPattern: '.*'
    });

    console.log('refresh value:', refreshSecret);
    console.log('refresh type:', typeof refreshSecret);
    console.log('refresh length:', refreshSecret?.length);

    const refreshSecretParameter = new ssm.StringParameter(this, 'RefreshSecret', {
      parameterName: `/${id}/refresh-secret`,
      stringValue: refreshSecret,
      allowedPattern: '.*'
    });

    console.log('hashSalt value:', hashSalt);
    console.log('hashSalt type:', typeof hashSalt);
    console.log('hashSalt length:', hashSalt?.length);

    const hashSaltParameter = new ssm.StringParameter(this, 'HashSalt', {
      parameterName: `/${id}/hash-salt`,
      stringValue: hashSalt,
      allowedPattern: '.*'
    });

    const emailUserParameter = new ssm.StringParameter(this, 'EmailUser', {
      parameterName: `/${id}/email-user`,
      stringValue: emailUser,
      allowedPattern: '.*'
    });

    const emailPassParameter = new ssm.StringParameter(this, 'EmailPass', {
      parameterName: `/${id}/email-pass`,
      stringValue: emailPass,
      allowedPattern: '.*'
    });

    // IAM role for Server instances
    const serverRole = new iam.Role(this, 'ServerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
      inlinePolicies: {
        ParameterStoreAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ssm:GetParameter',
                'ssm:GetParameters',
                'ssm:GetParametersByPath',
              ],
              resources: [
                mongodbParameter.parameterArn,
                jwtSecretParameter.parameterArn,
                refreshSecretParameter.parameterArn,
                hashSaltParameter.parameterArn,
                emailUserParameter.parameterArn,
                emailPassParameter.parameterArn,
              ],
            }),
          ],
        }),
      },
    });

    // IAM role for Admin Portal instances
    const adminPortalRole = new iam.Role(this, 'AdminPortalRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
    });

    // Security Groups
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc,
      description: 'Security group for ALB',
    });
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

    const serverSecurityGroup = new ec2.SecurityGroup(this, 'ServerSecurityGroup', {
      vpc,
      description: 'Security group for Server',
    });
    serverSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(4000));

    const adminPortalSecurityGroup = new ec2.SecurityGroup(this, 'AdminPortalSecurityGroup', {
      vpc,
      description: 'Security group for Admin Portal',
    });
    adminPortalSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(3000));

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
    });

    // User Data script for Server instances
    const serverUserData = ec2.UserData.forLinux();
    serverUserData.addCommands(
      'yum update -y',
      'curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -',
      'yum install -y nodejs ruby awscli',
      'npm install -g pm2',

      // Install CodeDeploy agent
      `wget https://aws-codedeploy-${cdk.Aws.REGION}.s3.${cdk.Aws.REGION}.amazonaws.com/latest/install`,
      'chmod +x ./install',
      './install auto',

      // Create app user and directory
      'useradd -r server',
      'mkdir -p /opt/server',
      'chown -R server:server /opt/server',

      // Create startup script that fetches secrets
      `cat > /opt/server/start-server.sh << 'EOF'
      #!/bin/bash
      export MONGODB_URI=$(aws ssm get-parameter --name "${mongodbParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export JWT_SECRET=$(aws ssm get-parameter --name "${jwtSecretParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export REFRESH_SECRET=$(aws ssm get-parameter --name "${refreshSecretParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export HASH_SALT=$(aws ssm get-parameter --name "${hashSaltParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export EMAIL_USER=$(aws ssm get-parameter --name "${emailUserParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export EMAIL_PASS=$(aws ssm get-parameter --name "${emailPassParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export NODE_ENV="prod"
      export PORT=4000
      export SALT_ROUNDS=10
      export CORS_ORIGIN=ADMIN_PORTAL_URL_PLACEHOLDER

      cd /opt/server
      exec node server.js
      EOF`,

      'chmod +x /opt/server/start-server.sh',
      'chown server:server /opt/server/start-server.sh',

      // Create systemd service
      `cat > /etc/systemd/system/server.service << 'EOF'
      [Unit]
      Description=Server Application
      After=network.target

      [Service]
      Type=simple
      User=server
      WorkingDirectory=/opt/server
      ExecStart=/opt/server/start-server.sh
      Restart=always
      RestartSec=10

      [Install]
      WantedBy=multi-user.target
      EOF`,
      'systemctl daemon-reload',
      'systemctl enable server.service'
    );

    // User Data script for Admin Portal instances
    const adminPortalUserData = ec2.UserData.forLinux();
    adminPortalUserData.addCommands(
      'yum update -y',
      'curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -',
      'yum install -y nodejs ruby awscli',
      'npm install -g pm2',

      // Install CodeDeploy agent
      `wget https://aws-codedeploy-${cdk.Aws.REGION}.s3.${cdk.Aws.REGION}.amazonaws.com/latest/install`,
      'chmod +x ./install',
      './install auto',

      // Create app user and directory
      'useradd -r adminportal',
      'mkdir -p /opt/admin-portal',
      'chown -R adminportal:adminportal /opt/admin-portal',

      // Create startup script
      `cat > /opt/admin-portal/start-admin-portal.sh << 'EOF'
      #!/bin/bash
      export NODE_ENV=production
      export PORT=3000
      export NEXT_PUBLIC_API_URL=SERVER_URL_PLACEHOLDER

      cd /opt/admin-portal
      exec npm start
      EOF`,

      'chmod +x /opt/admin-portal/start-admin-portal.sh',
      'chown adminportal:adminportal /opt/admin-portal/start-admin-portal.sh',

      // Create systemd service for admin portal
      `cat > /etc/systemd/system/admin-portal.service << 'EOF'
      [Unit]
      Description=Admin Portal Application
      After=network.target

      [Service]
      Type=simple
      User=adminportal
      WorkingDirectory=/opt/admin-portal
      ExecStart=/opt/admin-portal/start-admin-portal.sh
      Restart=always
      RestartSec=10

      [Install]
      WantedBy=multi-user.target
      EOF`,
      'systemctl daemon-reload',
      'systemctl enable admin-portal.service'
    );

    // Auto Scaling Group for Server
    const serverAsg = new autoscaling.AutoScalingGroup(this, 'ServerASG', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        config.instanceSize
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      minCapacity: config.minInstances,
      maxCapacity: config.maxInstances,
      desiredCapacity: config.desiredInstances,
      userData: serverUserData,
      role: serverRole,
      securityGroup: serverSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    // Auto Scaling Group for Admin Portal
    const adminPortalAsg = new autoscaling.AutoScalingGroup(this, 'AdminPortalASG', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        config.instanceSize
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      minCapacity: config.minInstances,
      maxCapacity: config.maxInstances,
      desiredCapacity: config.desiredInstances,
      userData: adminPortalUserData,
      role: adminPortalRole,
      securityGroup: adminPortalSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    // Target Groups
    const serverTargetGroup = new elbv2.ApplicationTargetGroup(this, 'ServerTargetGroup', {
      vpc,
      port: 4000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [serverAsg],
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        timeout: cdk.Duration.seconds(10),
      },
    });

    const adminPortalTargetGroup = new elbv2.ApplicationTargetGroup(this, 'AdminPortalTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [adminPortalAsg],
      healthCheck: {
        path: '/',
        interval: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        timeout: cdk.Duration.seconds(10),
      },
    });

    // ALB Listeners with path-based routing
    const listener = alb.addListener('Listener', {
      port: 80,
      defaultTargetGroups: [adminPortalTargetGroup],
    });

    // Route API traffic to Server target group
    listener.addTargetGroups('ServerTargetGroup', {
      targetGroups: [serverTargetGroup],
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      priority: 100,
    });

    // CloudFront Distribution
    this.cloudFrontDistribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(alb, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(alb, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
        '/_next/*': {
          origin: new origins.LoadBalancerV2Origin(alb, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        },
      },
      domainNames: domainName ? [domainName] : undefined,
      priceClass: environment === 'prod' ? cloudfront.PriceClass.PRICE_CLASS_ALL : cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // S3 Bucket for CodeDeploy deployments
    const deploymentBucket = new s3.Bucket(this, 'DeploymentBucket', {
      bucketName: `${id.toLowerCase()}-deployment-${environment}-${cdk.Aws.ACCOUNT_ID}`,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // CodeDeploy Application for Server
    this.serverCodeDeployApp = new codedeploy.ServerApplication(this, 'ServerCodeDeployApp', {
      applicationName: `Server-${environment}`,
    });

    // CodeDeploy Application for Admin Portal
    this.adminPortalCodeDeployApp = new codedeploy.ServerApplication(this, 'AdminPortalCodeDeployApp', {
      applicationName: `AdminPortal-${environment}`,
    });

    // CodeDeploy Deployment Group for Server
    new codedeploy.ServerDeploymentGroup(this, 'ServerDeploymentGroup', {
      application: this.serverCodeDeployApp,
      deploymentGroupName: `ServerGroup-${environment}`,
      autoScalingGroups: [serverAsg],
      deploymentConfig: environment === 'prod'
        ? codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME
        : codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,
      autoRollback: {
        failedDeployment: true,
        stoppedDeployment: true,
      },
    });

    // CodeDeploy Deployment Group for Admin Portal
    new codedeploy.ServerDeploymentGroup(this, 'AdminPortalDeploymentGroup', {
      application: this.adminPortalCodeDeployApp,
      deploymentGroupName: `AdminPortalGroup-${environment}`,
      autoScalingGroups: [adminPortalAsg],
      deploymentConfig: environment === 'prod'
        ? codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME
        : codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,
      autoRollback: {
        failedDeployment: true,
        stoppedDeployment: true,
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'DeploymentBucketName', {
      value: deploymentBucket.bucketName,
      description: 'S3 bucket name for CodeDeploy artifacts',
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
      description: 'Application Load Balancer DNS name',
    });

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${this.cloudFrontDistribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
    });

    new cdk.CfnOutput(this, 'ServerCodeDeployApplication', {
      value: this.serverCodeDeployApp.applicationName,
      description: 'CodeDeploy application name for Server',
    });

    new cdk.CfnOutput(this, 'AdminPortalCodeDeployApplication', {
      value: this.adminPortalCodeDeployApp.applicationName,
      description: 'CodeDeploy application name for Admin Portal',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.cloudFrontDistribution.distributionId,
      description: 'CloudFront distribution ID for cache invalidation',
    });
  }

  private getEnvironmentConfig(environment: string) {
    const configs = {
      dev: {
        instanceSize: ec2.InstanceSize.MICRO,
        minInstances: 1,
        maxInstances: 2,
        desiredInstances: 1,
      },
      staging: {
        instanceSize: ec2.InstanceSize.SMALL,
        minInstances: 1,
        maxInstances: 3,
        desiredInstances: 2,
      },
      prod: {
        instanceSize: ec2.InstanceSize.MEDIUM,
        minInstances: 2,
        maxInstances: 6,
        desiredInstances: 2,
      },
    };

    return configs[environment as keyof typeof configs] || configs.dev;
  }
}