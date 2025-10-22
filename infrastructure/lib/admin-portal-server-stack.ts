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
  public readonly cloudFrontDistribution: cloudfront.Distribution;

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
      frontendCloudfrontCertificate = acm.Certificate.fromCertificateArn(
        this, 
        'FrontendCloudfrontCertificate', 
        cloudFrontCertificateArn!
      );
    }

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

    // Set frontend URL based on whether we have custom domain
    if (useCustomDomain && frontendDomainName) {
      new route53.ARecord(this, 'FrontendAliasRecord', {
        zone: hostedZone!,
        recordName: frontendDomainName,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
      });
      
      this.frontendUrl = `https://${frontendDomainName}`;
    } else {
      this.frontendUrl = `https://${distribution.distributionDomainName}`;
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

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

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
      containerInsights: environment === 'prod',
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
        logRetention: logs.RetentionDays.ONE_WEEK,
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
      // REMOVED: Container health check - let ALB handle all health checking
      // This prevents tasks from being killed before grace period expires
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
      healthCheckGracePeriod: cdk.Duration.seconds(600), // 10 MINUTES - very generous
      serviceName: `${this.stackName}-api-service`,
      // TEMPORARILY DISABLED: Circuit breaker causes deployment loops
      // circuitBreaker: {
      //   rollback: true,
      // },
      // Add deployment configuration
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
      // Add security groups
      ...(albSecurityGroup && { securityGroups: [albSecurityGroup] }),
      ...(ecsSecurityGroup && { taskSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS } }),
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
    
    // Configure deployment to be more cautious
    const cfnService = fargateService.service.node.defaultChild as ecs.CfnService;
    cfnService.deploymentConfiguration = {
      minimumHealthyPercent: 0,   // Allow all tasks to be replaced (no rolling deployment)
      maximumPercent: 200,        // Can scale to 200% during deployment
      // Deployment circuit breaker disabled temporarily
    };
    
    // Apply ECS security group to the service
    if (ecsSecurityGroup) {
      fargateService.service.connections.addSecurityGroup(ecsSecurityGroup);
    }

    // Simple health check - just verify API responds
    fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(15),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 10,
      healthyHttpCodes: '200-499', // Very lenient - even 404 better than timeout
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
    albCertificate?: acm.ICertificate,
    cloudfrontCertificate?: acm.ICertificate,
    domainName?: string,
    albSecurityGroup?: ec2.SecurityGroup,
    ecsSecurityGroup?: ec2.SecurityGroup,
  ) {
    const cluster = new ecs.Cluster(this, 'FrontendCluster', {
      vpc,
      containerInsights: environment === 'prod',
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
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: 'production',
        // Use runtime environment variable instead
        NEXT_PUBLIC_API_URL: apiEndpoint,
      },
      portMappings: [
        {
          containerPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
      ],
      // REMOVED: Container health check - let ALB handle all health checking
      // This prevents tasks from being killed before grace period expires
    });

    const serviceProps: ecsPatterns.ApplicationLoadBalancedFargateServiceProps = {
      cluster,
      taskDefinition,
      desiredCount: config.frontendDesiredCount,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(600), // 10 MINUTES - very generous
      serviceName: `${this.stackName}-frontend-service`,
      circuitBreaker: {
        rollback: true,
      },
      // Add deployment configuration
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS,
      },
      // Add security groups
      ...(albSecurityGroup && { securityGroups: [albSecurityGroup] }),
      ...(ecsSecurityGroup && { taskSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS } }),
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
    
    // Configure deployment to be more cautious
    const cfnService = frontendService.service.node.defaultChild as ecs.CfnService;
    cfnService.deploymentConfiguration = {
      minimumHealthyPercent: 0,   // Allow all tasks to be replaced
      maximumPercent: 200,        // Can scale to 200% during deployment
      // Deployment circuit breaker disabled temporarily
    };
    
    // Apply ECS security group to the service
    if (ecsSecurityGroup) {
      frontendService.service.connections.addSecurityGroup(ecsSecurityGroup);
    }

    // Simple health check - just verify Next.js responds
    frontendService.targetGroup.configureHealthCheck({
      path: '/',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(15),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 10,
      healthyHttpCodes: '200-399',
    });

    const frontendScaling = frontendService.service.autoScaleTaskCount({
      minCapacity: config.frontendMinCount,
      maxCapacity: config.frontendMaxCount,
    });

    frontendScaling.scaleOnCpuUtilization('FrontendCpuScaling', {
      targetUtilizationPercent: 70,
    });

    const distributionProps: cloudfront.DistributionProps = {
      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(frontendService.loadBalancer, {
          protocolPolicy: albCertificate 
            ? cloudfront.OriginProtocolPolicy.HTTPS_ONLY 
            : cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
          httpsPort: 443,
          // ADDED: Longer timeouts for Next.js
          readTimeout: cdk.Duration.seconds(60),
          keepaliveTimeout: cdk.Duration.seconds(5),
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
      ...(cloudfrontCertificate && domainName && {
        domainNames: [domainName],
        certificate: cloudfrontCertificate,
      }),
    };

    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', distributionProps);

    return { frontendService, distribution };
  }

  private getEnvironmentConfig(environment: string) {
    const configs = {
      dev: {
        // INCREASED: Give containers more resources
        cpu: 512,           // Was 256
        memory: 1024,       // Was 512
        desiredCount: 1,
        minCount: 1,
        maxCount: 2,
        frontendCpu: 512,   // Was 256
        frontendMemory: 1024, // Was 512
        frontendDesiredCount: 1,
        frontendMinCount: 1,
        frontendMaxCount: 2,
      },
      staging: {
        cpu: 1024,          // Was 512
        memory: 2048,       // Was 1024
        desiredCount: 1,
        minCount: 1,
        maxCount: 3,
        frontendCpu: 1024,  // Was 512
        frontendMemory: 2048, // Was 1024
        frontendDesiredCount: 1,
        frontendMinCount: 1,
        frontendMaxCount: 3,
      },
      prod: {
        cpu: 2048,          // Was 1024
        memory: 4096,       // Was 2048
        desiredCount: 2,
        minCount: 2,
        maxCount: 10,
        frontendCpu: 2048,  // Was 1024
        frontendMemory: 4096, // Was 2048
        frontendDesiredCount: 2,
        frontendMinCount: 2,
        frontendMaxCount: 10,
      },
    };

    return configs[environment as keyof typeof configs] || configs.dev;
  }
}