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

export interface NextJsExpressStackProps extends cdk.StackProps {
  environment: 'dev' | 'staging' | 'prod';
  mongodbUri: string;
  jwtSecret: string;
}

export class NextJsExpressStack extends cdk.Stack {
  public readonly frontendBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly codeDeployApp: codedeploy.ServerApplication;

  constructor(scope: Construct, id: string, props: NextJsExpressStackProps) {
    super(scope, id, props);

    const { environment, mongodbUri, jwtSecret } = props;

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

    // S3 Bucket for Next.js static files
    this.frontendBucket = new s3.Bucket(this, 'NextJSBucket', {
      bucketName: `${id.toLowerCase()}-nextjs-${environment}-${cdk.Aws.ACCOUNT_ID}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS_ONLY,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Parameter Store for secrets
    const mongodbParameter = new ssm.StringParameter(this, 'MongoDBURI', {
      parameterName: `/${id}/mongodb-uri`,
      stringValue: mongodbUri,
    });

    const jwtSecretParameter = new ssm.StringParameter(this, 'JWTSecret', {
      parameterName: `/${id}/jwt-secret`,
      stringValue: jwtSecret,
    });

    // IAM role for Express API instances
    const apiRole = new iam.Role(this, 'ExpressAPIRole', {
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
              ],
            }),
          ],
        }),
      },
    });

    // Security Groups
    const albSecurityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc,
      description: 'Security group for ALB',
    });
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

    const apiSecurityGroup = new ec2.SecurityGroup(this, 'APISecurityGroup', {
      vpc,
      description: 'Security group for Express API',
    });
    apiSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(3000));

    // User Data script for API instances
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'yum update -y',
      'curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -',
      'yum install -y nodejs ruby awscli',
      'npm install -g pm2',

      // Install CodeDeploy agent
      `wget https://aws-codedeploy-${cdk.Aws.REGION}.s3.${cdk.Aws.REGION}.amazonaws.com/latest/install`,
      'chmod +x ./install',
      './install auto',

      // Create app user and directory
      'useradd -r expressapi',
      'mkdir -p /opt/expressapi',
      'chown -R expressapi:expressapi /opt/expressapi',

      // Create startup script that fetches secrets
      `cat > /opt/expressapi/start-server.sh << 'EOF'
      #!/bin/bash
      export MONGODB_URI=$(aws ssm get-parameter --name "${mongodbParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export JWT_SECRET=$(aws ssm get-parameter --name "${jwtSecretParameter.parameterName}" --with-decryption --region ${cdk.Aws.REGION} --query "Parameter.Value" --output text)
      export NODE_ENV=production
      export PORT=3000
      export CORS_ORIGIN=https://CLOUDFRONT_DOMAIN_PLACEHOLDER

      cd /opt/expressapi
      exec node server.js
      EOF`,

      'chmod +x /opt/expressapi/start-server.sh',
      'chown expressapi:expressapi /opt/expressapi/start-server.sh',

      // Create systemd service
      `cat > /etc/systemd/system/expressapi.service << 'EOF'
      [Unit]
      Description=Express API Server
      After=network.target

      [Service]
      Type=simple
      User=expressapi
      WorkingDirectory=/opt/expressapi
      ExecStart=/opt/expressapi/start-server.sh
      Restart=always
      RestartSec=10

      [Install]
      WantedBy=multi-user.target
      EOF`,
      'systemctl daemon-reload',
      'systemctl enable expressapi.service'
    );

    // Auto Scaling Group
    const asg = new autoscaling.AutoScalingGroup(this, 'ExpressASG', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        config.instanceSize
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      minCapacity: config.minInstances,
      maxCapacity: config.maxInstances,
      desiredCapacity: config.desiredInstances,
      userData,
      role: apiRole,
      securityGroup: apiSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
    });

    // Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ExpressTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [asg],
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3
      },
    });

    // ALB Listener
    alb.addListener('Listener', {
      port: 80,
      defaultTargetGroups: [targetGroup],
    });

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(alb, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        },
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // Handle Next.js client-side routing
        },
      ],
    });

    // Update the CORS_ORIGIN in the user data script
    // This is a bit of a hack, but works for the startup script
    userData.addCommands(
      `sed -i 's/CLOUDFRONT_DOMAIN_PLACEHOLDER/${this.distribution.distributionDomainName}/g' /opt/expressapi/start-server.sh`
    );

    // S3 Bucket for CodeDeploy deployments
    const deploymentBucket = new s3.Bucket(this, 'DeploymentBucket', {
      bucketName: `${id.toLowerCase()}-deployment-${environment}-${cdk.Aws.ACCOUNT_ID}`,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // CodeDeploy Application
    this.codeDeployApp = new codedeploy.ServerApplication(this, 'CodeDeployApp', {
      applicationName: `ExpressAPI-${environment}`,
    });

    // CodeDeploy Deployment Group
    new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
      application: this.codeDeployApp,
      deploymentGroupName: `ExpressAPIGroup-${environment}`,
      autoScalingGroups: [asg],
      deploymentConfig: environment === 'prod'
        ? codedeploy.ServerDeploymentConfig.ONE_AT_A_TIME
        : codedeploy.ServerDeploymentConfig.ALL_AT_ONCE,
      autoRollback: {
        failedDeployment: true,
        stoppedDeployment: true,
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'FrontendURL', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront URL for the frontend',
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName,
      description: 'S3 bucket name for frontend deployment',
    });

    new cdk.CfnOutput(this, 'DeploymentBucketName', {
      value: deploymentBucket.bucketName,
      description: 'S3 bucket name for CodeDeploy artifacts',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distribution.distributionId,
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