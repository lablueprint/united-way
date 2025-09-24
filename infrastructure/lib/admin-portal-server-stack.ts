import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
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
  domainName?: string;
}

export class AdminPortalServerStack extends cdk.Stack {
  public readonly apiEndpoint: string;
  public readonly frontendUrl: string;
  public readonly cloudFrontDistribution: cloudfront.Distribution;
  public readonly frontendEcrRepository: ecr.Repository;
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

    // Parameter Store for secrets
    const secrets = this.createParameterStore(id, {
      mongodbUri,
      jwtSecret,
      refreshSecret,
      hashSalt,
      emailUser,
      emailPass,
    });

    // ===============================
    // Express API on ECS Fargate
    // ===============================
    const apiService = this.createExpressApiService(vpc, secrets, environment, config);

    // Public endpoint (with HTTPS via ALB)
    this.apiEndpoint = `https://${apiService.loadBalancer.loadBalancerDnsName}`;

    // Internal endpoint for server-side calls (HTTP, stays within VPC)
    const apiInternalEndpoint = `http://${apiService.loadBalancer.loadBalancerDnsName}`;

    // ===============================
    // Next.js Frontend on ECS Fargate
    // ===============================
    const { frontendService, distribution, ecrRepo, cluster } = this.createNextJsFrontend(
      vpc,
      environment,
      config,
      this.apiEndpoint,
      apiInternalEndpoint
    );

    // Add explicit dependencies to ensure VPC resources are ready
    frontendService.node.addDependency(vpc);
    apiService.node.addDependency(vpc);

    this.cloudFrontDistribution = distribution;
    this.frontendUrl = `https://${distribution.distributionDomainName}`;
    this.frontendEcrRepository = ecrRepo;
    this.frontendEcsService = frontendService.service;
    this.frontendCluster = cluster;

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.apiEndpoint,
      description: 'Express API endpoint (public)',
    });

    new cdk.CfnOutput(this, 'ApiInternalEndpoint', {
      value: apiInternalEndpoint,
      description: 'Express API endpoint (internal, for server-side calls)',
    });

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: this.frontendUrl,
      description: 'Next.js frontend URL (via CloudFront)',
    });

    new cdk.CfnOutput(this, 'FrontendLoadBalancerUrl', {
      value: `http://${frontendService.loadBalancer.loadBalancerDnsName}`,
      description: 'Next.js frontend direct URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'FrontendECRRepositoryUri', {
      value: ecrRepo.repositoryUri,
      description: 'ECR Repository URI for frontend Docker images',
    });

    new cdk.CfnOutput(this, 'FrontendECSClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster name for frontend',
    });

    new cdk.CfnOutput(this, 'FrontendECSServiceName', {
      value: frontendService.service.serviceName,
      description: 'ECS Service name for frontend',
    });
  }

  private createParameterStore(id: string, secrets: Record<string, string>) {
    const parameters: Record<string, ssm.StringParameter> = {};

    Object.entries(secrets).forEach(([key, value]) => {
      if (!value || value.trim().length === 0) {
        throw new Error(`${key} cannot be empty`);
      }

      parameters[key] = new ssm.StringParameter(this, `${key}Parameter`, {
        parameterName: `/${id}/${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
        stringValue: value,
        description: `${key} for ${id}`,
      });
    });

    return parameters;
  }

  private createExpressApiService(
    vpc: ec2.Vpc,
    secrets: Record<string, ssm.StringParameter>,
    environment: string,
    config: any
  ) {
    const cluster = new ecs.Cluster(this, 'ApiCluster', {
      vpc,
      containerInsights: environment === 'prod',
    });

    const taskRole = new iam.Role(this, 'ApiTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
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
              resources: Object.values(secrets).map(param => param.parameterArn),
            }),
          ],
        }),
      },
    });

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'ApiService', {
      cluster,
      cpu: config.cpu,
      memoryLimitMiB: config.memory,
      desiredCount: config.desiredCount,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../server'),
        containerPort: 4000,
        environment: {
          NODE_ENV: 'production',
          PORT: '4000',
          REGION: cdk.Aws.REGION,
          PARAMETER_PREFIX: `/${this.stackName}`,
        },
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: 'api',
          logRetention: logs.RetentionDays.ONE_WEEK,
        }),
        taskRole: taskRole
      },
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(120), // Increased from 60
    });

    fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5, // Increased from 3
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(10), // Added explicit timeout
    });

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
    apiInternalEndpoint: string
  ) {
    // ECR Repository for Next.js images
    const ecrRepo = new ecr.Repository(this, 'FrontendRepository', {
      repositoryName: `${this.stackName.toLowerCase()}-frontend`,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: environment !== 'prod',
      imageScanOnPush: true,
      lifecycleRules: [
        {
          description: 'Keep last 10 images',
          maxImageCount: 10,
          rulePriority: 1,
        },
      ],
    });

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
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/docker/library/node:18-alpine'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'frontend',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: 'production',
        // Public endpoint - used by browser for client-side API calls
        NEXT_PUBLIC_API_URL: apiEndpoint,
        // Internal endpoint - used by Next.js server for SSR API calls
        API_URL: apiInternalEndpoint,
        PORT: '3000',
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

    return { frontendService, distribution, ecrRepo, cluster };
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