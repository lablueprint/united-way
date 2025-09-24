import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface AdminPortalServerStackProps extends cdk.StackProps {
  environment: 'dev' | 'staging' | 'prod';
  mongodbUri: string;
  jwtSecret: string;
  refreshSecret: string;
  hashSalt: string;
  emailUser: string;
  emailPass: string;
  domainName?: string;
}

export class AdminPortalServerStack extends cdk.Stack {
  public readonly apiEndpoint: string;
  public readonly frontendUrl: string;
  public readonly cloudFrontDistribution: cloudfront.Distribution;
  public readonly frontendEcsService: ecs.FargateService;
  public readonly frontendCluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: AdminPortalServerStackProps) {
    super(scope, id, props);

    const {
      environment,
      mongodbUri,
      jwtSecret,
      refreshSecret,
      hashSalt,
      emailUser,
      emailPass,
      domainName,
    } = props;

    const config = this.getEnvironmentConfig(environment);

    // Validate secrets
    const secrets = {
      mongodbUri,
      jwtSecret,
      refreshSecret,
      hashSalt,
      emailUser,
      emailPass,
    };

    Object.entries(secrets).forEach(([key, value]) => {
      if (!value || value.trim().length === 0) {
        throw new Error(`${key} cannot be empty`);
      }
    });

    // VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 26,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // ===============================
    // Express API on ECS Fargate
    // ===============================
    const apiService = this.createExpressApiService(vpc, secrets, environment, config);

    // Public endpoint (with HTTPS via ALB)
    this.apiEndpoint = `https://${apiService.loadBalancer.loadBalancerDnsName}`;

    // ===============================
    // Next.js Frontend on ECS Fargate
    // ===============================
    const { frontendService, distribution } = this.createNextJsFrontend(
      vpc,
      environment,
      config,
      this.apiEndpoint,
    );

    // Add explicit dependencies to ensure VPC resources are ready
    frontendService.node.addDependency(vpc);
    apiService.node.addDependency(vpc);

    this.cloudFrontDistribution = distribution;
    this.frontendUrl = `https://${distribution.distributionDomainName}`;

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.apiEndpoint,
      description: 'Express API endpoint (public)',
    });

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: this.frontendUrl,
      description: 'Next.js frontend URL (via CloudFront)',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });
  }

  private createExpressApiService(
    vpc: ec2.Vpc,
    secrets: Record<string, string>, // Now just plain strings, not SSM parameters
    environment: string,
    config: any
  ) {
    const cluster = new ecs.Cluster(this, 'ApiCluster', {
      vpc,
      containerInsights: environment === 'prod',
    });

    // Create task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTaskDef', {
      cpu: config.cpu,
      memoryLimitMiB: config.memory,
      family: `${this.stackName}-api-task`,
    });

    // Add container with secrets as environment variables
    const container = taskDefinition.addContainer('api', {
      image: ecs.ContainerImage.fromAsset('../server'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'api',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        // App configuration
        NODE_ENV: 'production',
        PORT: '4000',
        REGION: cdk.Aws.REGION,

        // Secrets directly as environment variables
        MONGODB_URI: secrets.mongodbUri,
        JWT_SECRET: secrets.jwtSecret,
        REFRESH_SECRET: secrets.refreshSecret,
        HASH_SALT: secrets.hashSalt,
        EMAIL_USER: secrets.emailUser,
        EMAIL_PASS: secrets.emailPass,

        // Flag to NOT use Parameter Store
        USE_PARAMETER_STORE: 'false',
      },
      // Container health check
      healthCheck: {
        command: [
          'CMD-SHELL',
          'curl -f http://localhost:4000/api/health || exit 1'
        ],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(180),
      },
    });

    container.addPortMappings({
      containerPort: 4000,
      protocol: ecs.Protocol.TCP,
    });

    // Create the Fargate service
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'ApiService', {
      cluster,
      taskDefinition,
      desiredCount: config.desiredCount,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(300), // 5 minutes
      serviceName: `${this.stackName}-api-service`,
      circuitBreaker: {
        rollback: true,
      },
    });

    // Configure ALB health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 10,
      interval: cdk.Duration.seconds(60),
      timeout: cdk.Duration.seconds(30),
      healthyHttpCodes: '200',
    });

    // Auto scaling
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: config.minCount,
      maxCapacity: config.maxCount,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    return fargateService;
  }

  private createNextJsFrontend(
    vpc: ec2.Vpc,
    environment: string,
    config: any,
    apiEndpoint: string,
  ) {
    // ECS Cluster for Frontend
    const cluster = new ecs.Cluster(this, 'FrontendCluster', {
      vpc,
      containerInsights: environment === 'prod',
      clusterName: `${this.stackName}-frontend-cluster`,
    });

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'FrontendTaskDef', {
      cpu: config.frontendCpu,
      memoryLimitMiB: config.frontendMemory,
    });

    // Container Definition
    const container = taskDefinition.addContainer('web', {
      image: ecs.ContainerImage.fromAsset('../admin-portal'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'frontend',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: 'production',
        // Public endpoint - used by browser for client-side API calls
        NEXT_PUBLIC_API_URL: apiEndpoint,
      },
      portMappings: [
        {
          containerPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
      ],
      healthCheck: {
        command: ['CMD-SHELL', 'wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(90), // Increased from 60
      },
    });

    // Fargate service
    const frontendService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'FrontendService', {
      cluster,
      taskDefinition,
      desiredCount: config.frontendDesiredCount,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(120), // Increased from 60
      serviceName: `${this.stackName}-frontend-service`,
    });

    // Configure health check
    frontendService.targetGroup.configureHealthCheck({
      path: '/',
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5, // Increased from 3
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(10),
    });

    // Auto scaling
    const frontendScaling = frontendService.service.autoScaleTaskCount({
      minCapacity: config.frontendMinCount,
      maxCapacity: config.frontendMaxCount,
    });

    frontendScaling.scaleOnCpuUtilization('FrontendCpuScaling', {
      targetUtilizationPercent: 70,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(frontendService.loadBalancer, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: new cloudfront.CachePolicy(this, 'FrontendCachePolicy', {
          cachePolicyName: `${this.stackName}-frontend-cache`,
          defaultTtl: cdk.Duration.seconds(0),
          minTtl: cdk.Duration.seconds(0),
          maxTtl: cdk.Duration.days(365),
          enableAcceptEncodingGzip: true,
          enableAcceptEncodingBrotli: true,
          headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
            'Accept',
            'Accept-Language',
            'Authorization'
          ),
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          cookieBehavior: cloudfront.CacheCookieBehavior.all(),
        }),
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      priceClass: environment === 'prod'
        ? cloudfront.PriceClass.PRICE_CLASS_ALL
        : cloudfront.PriceClass.PRICE_CLASS_100,
      comment: `${this.stackName} Frontend Distribution`,
    });

    return { frontendService, distribution };
  }

  private getEnvironmentConfig(environment: string) {
    const configs = {
      dev: {
        // API
        cpu: 256,
        memory: 512,
        desiredCount: 1,
        minCount: 1,
        maxCount: 2,
        // Frontend
        frontendCpu: 256,
        frontendMemory: 512,
        frontendDesiredCount: 1,
        frontendMinCount: 1,
        frontendMaxCount: 2,
      },
      staging: {
        cpu: 512,
        memory: 1024,
        desiredCount: 1,
        minCount: 1,
        maxCount: 3,
        frontendCpu: 512,
        frontendMemory: 1024,
        frontendDesiredCount: 1,
        frontendMinCount: 1,
        frontendMaxCount: 3,
      },
      prod: {
        cpu: 1024,
        memory: 2048,
        desiredCount: 2,
        minCount: 2,
        maxCount: 10,
        frontendCpu: 1024,
        frontendMemory: 2048,
        frontendDesiredCount: 2,
        frontendMinCount: 2,
        frontendMaxCount: 10,
      },
    };

    return configs[environment as keyof typeof configs] || configs.dev;
  }
}