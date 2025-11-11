import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
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
  hostedZoneId?: string;
  cloudFrontCertificateArn?: string;
}

export class AdminPortalServerStack extends cdk.Stack {
  public readonly apiEndpoint: string;
  public readonly frontendUrl: string;
  public readonly cloudFrontDistribution: cloudfront.Distribution | null;

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
      hostedZoneId,
      cloudFrontCertificateArn,
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

    // Validate custom domain configuration
    const useCustomDomain = !!(
      domainName && 
      domainName.trim().length > 0 &&
      hostedZoneId && 
      hostedZoneId.trim().length > 0 &&
      cloudFrontCertificateArn &&
      cloudFrontCertificateArn.trim().length > 0
    );

    let hostedZone: route53.IHostedZone | undefined;
    let apiCertificate: acm.ICertificate | undefined;
    let frontendAlbCertificate: acm.ICertificate | undefined;
    let frontendCloudfrontCertificate: acm.ICertificate | undefined;
    let apiDomainName: string | undefined;
    let frontendDomainName: string | undefined;

    if (useCustomDomain) {
      hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: hostedZoneId!,
        zoneName: domainName!,
      });

      apiDomainName = `api-${environment}.${domainName}`;
      frontendDomainName = environment === 'prod' 
        ? domainName 
        : `${environment}.${domainName}`;

      // API certificate - created in the stack's region
      apiCertificate = new acm.Certificate(this, 'ApiCertificate', {
        domainName: apiDomainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });

      // Frontend ALB certificate - created in the stack's region
      frontendAlbCertificate = new acm.Certificate(this, 'FrontendAlbCertificate', {
        domainName: frontendDomainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });

      // CloudFront certificate - imported from us-east-1 (created separately)
      // Only for production
      if (environment === 'prod') {
        frontendCloudfrontCertificate = acm.Certificate.fromCertificateArn(
          this, 
          'FrontendCloudfrontCertificate', 
          cloudFrontCertificateArn!
        );
      }
    }

    // VPC - NO NAT GATEWAY (saves ~$32-45/month)
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: 0, // CHANGED: Remove expensive NAT gateway
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Add VPC Endpoints for AWS services (replaces NAT gateway)
    vpc.addInterfaceEndpoint('EcrEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
    });

    vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    // ===============================
    // Security Groups
    // ===============================
    
    // ALB Security Group for API
    const apiAlbSecurityGroup = new ec2.SecurityGroup(this, 'ApiAlbSecurityGroup', {
      vpc,
      description: 'Security group for API ALB',
      allowAllOutbound: true,
    });
    
    // Allow HTTP/HTTPS from internet to API ALB
    apiAlbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from internet'
    );
    apiAlbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from internet'
    );
    
    // ECS Security Group for API
    const apiEcsSecurityGroup = new ec2.SecurityGroup(this, 'ApiEcsSecurityGroup', {
      vpc,
      description: 'Security group for API ECS tasks',
      allowAllOutbound: true,
    });
    
    // Allow traffic from API ALB to API ECS tasks
    apiEcsSecurityGroup.addIngressRule(
      apiAlbSecurityGroup,
      ec2.Port.tcp(4000),
      'Allow traffic from API ALB'
    );
    
    // ALB Security Group for Frontend
    const frontendAlbSecurityGroup = new ec2.SecurityGroup(this, 'FrontendAlbSecurityGroup', {
      vpc,
      description: 'Security group for Frontend ALB',
      allowAllOutbound: true,
    });
    
    // Allow HTTP/HTTPS from internet to Frontend ALB
    frontendAlbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP from internet'
    );
    frontendAlbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS from internet'
    );
    
    // ECS Security Group for Frontend
    const frontendEcsSecurityGroup = new ec2.SecurityGroup(this, 'FrontendEcsSecurityGroup', {
      vpc,
      description: 'Security group for Frontend ECS tasks',
      allowAllOutbound: true,
    });
    
    // Allow traffic from Frontend ALB to Frontend ECS tasks
    frontendEcsSecurityGroup.addIngressRule(
      frontendAlbSecurityGroup,
      ec2.Port.tcp(3000),
      'Allow traffic from Frontend ALB'
    );
    
    // CRITICAL: Allow Frontend ECS to call API ECS
    apiEcsSecurityGroup.addIngressRule(
      frontendEcsSecurityGroup,
      ec2.Port.tcp(4000),
      'Allow traffic from Frontend ECS tasks'
    );
    
    // Also allow Frontend ALB to call API (for SSR)
    apiEcsSecurityGroup.addIngressRule(
      frontendAlbSecurityGroup,
      ec2.Port.tcp(4000),
      'Allow traffic from Frontend ALB for SSR'
    );
    
    // ===============================
    // Express API on ECS Fargate
    // ===============================
    const apiService = this.createExpressApiService(
      vpc, 
      secrets, 
      environment, 
      config,
      apiCertificate,
      apiAlbSecurityGroup,
      apiEcsSecurityGroup,
    );

    // FIXED: Set API endpoint immediately after creation
    // This ensures the frontend can use it during build
    let internalApiEndpoint: string;
    if (useCustomDomain && apiDomainName) {
      this.apiEndpoint = `https://${apiDomainName}`;
      internalApiEndpoint = `http://${apiService.loadBalancer.loadBalancerDnsName}`;
      
      new route53.ARecord(this, 'ApiAliasRecord', {
        zone: hostedZone!,
        recordName: apiDomainName,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.LoadBalancerTarget(apiService.loadBalancer)
        ),
      });
    } else {
      this.apiEndpoint = `http://${apiService.loadBalancer.loadBalancerDnsName}`;
      internalApiEndpoint = this.apiEndpoint;
    }

    // ===============================
    // Next.js Frontend on ECS Fargate
    // ===============================
    // FIXED: Use internal ALB endpoint for build and runtime
    const { frontendService, distribution } = this.createNextJsFrontend(
      vpc,
      environment,
      config,
      internalApiEndpoint, // Use ALB DNS directly
      frontendAlbCertificate,
      frontendCloudfrontCertificate,
      frontendDomainName,
      frontendAlbSecurityGroup,
      frontendEcsSecurityGroup,
    );

    // FIXED: Add explicit dependency so frontend waits for API
    frontendService.node.addDependency(apiService);

    // Set frontend URL - no CloudFront, always use ALB
    if (useCustomDomain && frontendDomainName) {
      // Create Route53 record pointing to ALB
      new route53.ARecord(this, 'FrontendAliasRecord', {
        zone: hostedZone!,
        recordName: frontendDomainName,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.LoadBalancerTarget(frontendService.loadBalancer)
        ),
      });
      
      this.frontendUrl = `https://${frontendDomainName}`;
    } else {
      // No custom domain, use ALB DNS directly
      this.frontendUrl = `http://${frontendService.loadBalancer.loadBalancerDnsName}`;
    }

    this.cloudFrontDistribution = distribution;

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.apiEndpoint,
      description: 'Express API endpoint (public)',
    });

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: this.frontendUrl,
      description: 'Next.js frontend URL',
    });

    if (distribution) {
      new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
        value: (distribution as cloudfront.Distribution).distributionId,
        description: 'CloudFront Distribution ID',
      });
    }

    // ADDED: Output internal endpoints for debugging
    new cdk.CfnOutput(this, 'ApiLoadBalancerDns', {
      value: apiService.loadBalancer.loadBalancerDnsName,
      description: 'API ALB DNS (internal)',
    });

    new cdk.CfnOutput(this, 'FrontendLoadBalancerDns', {
      value: frontendService.loadBalancer.loadBalancerDnsName,
      description: 'Frontend ALB DNS (internal)',
    });
    
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID',
    });

    if (!useCustomDomain) {
      new cdk.CfnOutput(this, 'DomainNote', {
        value: 'Using AWS-generated URLs. Add domainName, hostedZoneId, and cloudFrontCertificateArn to use custom domain.',
        description: 'Domain Configuration',
      });
    }

    // Cost savings note
    new cdk.CfnOutput(this, 'CostOptimizationNote', {
      value: `ULTRA cost optimized: Single task per service, minimal resources, no CloudFront, no NAT gateway, 1-day logs`,
      description: 'Cost Optimization Applied',
    });
  }

  private createExpressApiService(
    vpc: ec2.Vpc,
    secrets: Record<string, string>,
    environment: string,
    config: any,
    certificate?: acm.ICertificate,
    albSecurityGroup?: ec2.SecurityGroup,
    ecsSecurityGroup?: ec2.SecurityGroup,
  ) {
    const cluster = new ecs.Cluster(this, 'ApiCluster', {
      vpc,
      containerInsights: false, // CHANGED: Disable even for prod (saves ~$5/month)
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTaskDef', {
      cpu: config.cpu,
      memoryLimitMiB: config.memory,
      family: `${this.stackName}-api-task`,
    });

    const container = taskDefinition.addContainer('api', {
      image: ecs.ContainerImage.fromAsset('../server'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'api',
        logRetention: logs.RetentionDays.ONE_DAY, // CHANGED: Minimal retention (saves ~$10/month)
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '4000',
        REGION: cdk.Aws.REGION,
        MONGODB_URI: secrets.mongodbUri,
        JWT_SECRET: secrets.jwtSecret,
        REFRESH_SECRET: secrets.refreshSecret,
        HASH_SALT: secrets.hashSalt,
        EMAIL_USER: secrets.emailUser,
        EMAIL_PASS: secrets.emailPass,
        USE_PARAMETER_STORE: 'false',
      },
    });

    container.addPortMappings({
      containerPort: 4000,
      protocol: ecs.Protocol.TCP,
    });

    const serviceProps: ecsPatterns.ApplicationLoadBalancedFargateServiceProps = {
      cluster,
      taskDefinition,
      desiredCount: config.desiredCount,
      publicLoadBalancer: true,
      assignPublicIp: true, // ADDED: Required when no NAT gateway
      healthCheckGracePeriod: cdk.Duration.seconds(300), // REDUCED: 5 minutes
      serviceName: `${this.stackName}-api-service`,
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
      ...(albSecurityGroup && { securityGroups: [albSecurityGroup] }),
      ...(ecsSecurityGroup && { taskSubnets: { subnetType: ec2.SubnetType.PUBLIC } }), // CHANGED: Public subnet
      ...(certificate && {
        certificate: certificate,
        redirectHTTP: true,
      }),
    };

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this, 
      'ApiService', 
      serviceProps
    );
    
    // Configure deployment - must allow at least 150% for AZ rebalancing
    const cfnService = fargateService.service.node.defaultChild as ecs.CfnService;
    cfnService.deploymentConfiguration = {
      minimumHealthyPercent: 0,
      maximumPercent: 150,
    };
    
    // Apply ECS security group to the service
    if (ecsSecurityGroup) {
      fargateService.service.connections.addSecurityGroup(ecsSecurityGroup);
    }

    // Simple health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      interval: cdk.Duration.seconds(60), // CHANGED: Less frequent checks
      timeout: cdk.Duration.seconds(15),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5, // CHANGED: More lenient
      healthyHttpCodes: '200-499',
    });

    // CHANGED: No auto-scaling (saves complexity and potential extra tasks)
    // Manual scaling only when needed

    return fargateService;
  }

  private createNextJsFrontend(
    vpc: ec2.Vpc,
    environment: string,
    config: any,
    apiEndpoint: string,
    albCertificate?: acm.ICertificate,
    cloudfrontCertificate?: acm.ICertificate,
    domainName?: string,
    albSecurityGroup?: ec2.SecurityGroup,
    ecsSecurityGroup?: ec2.SecurityGroup,
  ) {
    const cluster = new ecs.Cluster(this, 'FrontendCluster', {
      vpc,
      containerInsights: false, // CHANGED: Disable to save costs
      clusterName: `${this.stackName}-frontend-cluster`,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'FrontendTaskDef', {
      cpu: config.frontendCpu,
      memoryLimitMiB: config.frontendMemory,
    });

    const container = taskDefinition.addContainer('web', {
      image: ecs.ContainerImage.fromAsset('../admin-portal'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'frontend',
        logRetention: logs.RetentionDays.ONE_DAY, // CHANGED: Minimal retention
      }),
      environment: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: apiEndpoint,
      },
      portMappings: [
        {
          containerPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
      ],
    });

    const serviceProps: ecsPatterns.ApplicationLoadBalancedFargateServiceProps = {
      cluster,
      taskDefinition,
      desiredCount: config.frontendDesiredCount,
      publicLoadBalancer: true,
      assignPublicIp: true, // ADDED: Required when no NAT gateway
      healthCheckGracePeriod: cdk.Duration.seconds(300), // REDUCED: 5 minutes
      serviceName: `${this.stackName}-frontend-service`,
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
      ...(albSecurityGroup && { securityGroups: [albSecurityGroup] }),
      ...(ecsSecurityGroup && { taskSubnets: { subnetType: ec2.SubnetType.PUBLIC } }), // CHANGED: Public subnet
      ...(albCertificate && {
        certificate: albCertificate,
        redirectHTTP: true,
      }),
    };

    const frontendService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this, 
      'FrontendService',
      serviceProps
    );
    
    // Configure deployment - must allow at least 150% for AZ rebalancing
    const cfnService = frontendService.service.node.defaultChild as ecs.CfnService;
    cfnService.deploymentConfiguration = {
      minimumHealthyPercent: 0,
      maximumPercent: 150, // FIXED: Must be >100 for AZ rebalancing
    };
    
    // Apply ECS security group to the service
    if (ecsSecurityGroup) {
      frontendService.service.connections.addSecurityGroup(ecsSecurityGroup);
    }

    // Simple health check
    frontendService.targetGroup.configureHealthCheck({
      path: '/',
      interval: cdk.Duration.seconds(60), // CHANGED: Less frequent checks
      timeout: cdk.Duration.seconds(15),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5, // CHANGED: More lenient
      healthyHttpCodes: '200-399',
    });

    // CHANGED: No auto-scaling for cost savings

    // CHANGED: Never use CloudFront (saves ~$10-20/month even for prod)
    // Access ALB directly for all environments
    let distribution: cloudfront.Distribution | null = null;

    return { frontendService, distribution };
  }

  private getEnvironmentConfig(environment: string) {
    const configs = {
      dev: {
        cpu: 256,                   // MINIMUM
        memory: 512,                // MINIMUM
        desiredCount: 1,            // SINGLE TASK
        minCount: 1,
        maxCount: 1,                // NO AUTO-SCALING
        frontendCpu: 256,           // MINIMUM
        frontendMemory: 512,        // MINIMUM
        frontendDesiredCount: 1,    // SINGLE TASK
        frontendMinCount: 1,
        frontendMaxCount: 1,        // NO AUTO-SCALING
      },
      staging: {
        cpu: 256,
        memory: 512,
        desiredCount: 1,            // SINGLE TASK
        minCount: 1,
        maxCount: 1,
        frontendCpu: 256,
        frontendMemory: 512,
        frontendDesiredCount: 1,    // SINGLE TASK
        frontendMinCount: 1,
        frontendMaxCount: 1,
      },
      prod: {
        cpu: 256,
        memory: 512,
        desiredCount: 1,
        minCount: 1,
        maxCount: 1,
        frontendCpu: 256,
        frontendMemory: 512,
        frontendDesiredCount: 1,
        frontendMinCount: 1,
      },
    };

    return configs[environment as keyof typeof configs] || configs.dev;
  }
}