# Domain Management Service

## Overview

The Domain Management Service provides comprehensive functionality for managing email domains, including domain verification, DNS configuration, authentication setup, and health monitoring. This service integrates with various DNS providers and email service providers to ensure optimal domain configuration.

## Architecture

### Service Structure

```
lib/services/domain/
├── README.md                    # This documentation
├── domain-service.ts           # Main domain service
├── dns-manager.ts              # DNS record management
├── verification-service.ts     # Domain verification
├── authentication-setup.ts     # SPF/DKIM/DMARC configuration
├── health-monitor.ts           # Domain health monitoring
├── providers/                  # DNS provider integrations
│   ├── cloudflare.ts          # Cloudflare DNS integration
│   ├── route53.ts             # AWS Route 53 integra
 └── google-domains.ts      # Google Domains integration
└── __tests__/                 # Service tests
    ├── domain-service.test.ts
    └── dns-manager.test.ts
```

### Core Interfaces

```typescript
interface DomainService {
  // Domain lifecycle management
  addDomain(domain: string, config: DomainConfig): Promise<Domain>;
  verifyDomain(domainId: string): Promise<VerificationResult>;
  updateDomain(
    domainId: string,
    updates: Partial<DomainConfig>
  ): Promise<Domain>;
  deleteDomain(domainId: string): Promise<void>;

  // DNS management
  configureDNS(
    domainId: string,
    records: DNSRecord[]
  ): Promise<DNSConfigResult>;
  validateDNSConfiguration(domainId: string): Promise<DNSValidationResult>;

  // Authentication setup
  setupAuthentication(
    domainId: string,
    config: AuthConfig
  ): Promise<AuthSetupResult>;
  rotateKeys(domainId: string): Promise<KeyRotationResult>;

  // Health monitoring
  checkDomainHealth(domainId: string): Promise<DomainHealthStatus>;
  getDomainMetrics(
    domainId: string,
    timeRange: TimeRange
  ): Promise<DomainMetrics>;
}
```

## Domain Lifecycle Management

### Adding a Domain

```typescript
interface DomainConfig {
  name: string;
  purpose: "sending" | "receiving" | "both";
  emailProvider: "mailgun" | "sendgrid" | "ses" | "custom";
  dnsProvider: "cloudflare" | "route53" | "google" | "manual";
  authenticationConfig: {
    enableSPF: boolean;
    enableDKIM: boolean;
    enableDMARC: boolean;
    dmarcPolicy: "none" | "quarantine" | "reject";
  };
}

class DomainManagementService implements DomainService {
  async addDomain(domain: string, config: DomainConfig): Promise<Domain> {
    // Validate domain format
    this.validateDomainFormat(domain);

    // Check domain availability
    await this.checkDomainAvailability(domain);

    // Create domain record
    const domainRecord = await this.createDomainRecord(domain, config);

    // Initialize DNS configuration
    if (config.dnsProvider !== "manual") {
      await this.initializeDNSConfiguration(domainRecord, config);
    }

    // Set up authentication if requested
    if (this.shouldSetupAuthentication(config)) {
      await this.setupAuthentication(
        domainRecord.id,
        config.authenticationConfig
      );
    }

    // Start health monitoring
    await this.startHealthMonitoring(domainRecord.id);

    return domainRecord;
  }

  private validateDomainFormat(domain: string): void {
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;

    if (!domainRegex.test(domain)) {
      throw new Error(`Invalid domain format: ${domain}`);
    }

    if (domain.length > 253) {
      throw new Error(`Domain name too long: ${domain}`);
    }
  }
}
```

### Domain Verification

```typescript
interface VerificationMethod {
  type: "dns" | "file" | "email";
  instructions: string;
  verificationCode: string;
  expiresAt: Date;
}

interface VerificationResult {
  verified: boolean;
  method: VerificationMethod;
  verifiedAt?: Date;
  errors?: string[];
}

class DomainVerificationService {
  async verifyDomain(domainId: string): Promise<VerificationResult> {
    const domain = await this.getDomain(domainId);
    const verificationMethods = await this.getVerificationMethods(domain);

    // Try each verification method
    for (const method of verificationMethods) {
      const result = await this.attemptVerification(domain, method);

      if (result.verified) {
        await this.markDomainAsVerified(domainId, method);
        return result;
      }
    }

    return {
      verified: false,
      method: verificationMethods[0],
      errors: ["Domain verification failed for all methods"],
    };
  }

  private async attemptVerification(
    domain: Domain,
    method: VerificationMethod
  ): Promise<VerificationResult> {
    switch (method.type) {
      case "dns":
        return this.verifyViaDNS(domain, method);
      case "file":
        return this.verifyViaFile(domain, method);
      case "email":
        return this.verifyViaEmail(domain, method);
      default:
        throw new Error(`Unsupported verification method: ${method.type}`);
    }
  }

  private async verifyViaDNS(
    domain: Domain,
    method: VerificationMethod
  ): Promise<VerificationResult> {
    try {
      const txtRecords = await this.dnsResolver.resolveTxt(domain.name);
      const verificationRecord = txtRecords.find((record) =>
        record.includes(method.verificationCode)
      );

      return {
        verified: !!verificationRecord,
        method,
        verifiedAt: verificationRecord ? new Date() : undefined,
      };
    } catch (error) {
      return {
        verified: false,
        method,
        errors: [`DNS verification failed: ${error.message}`],
      };
    }
  }
}
```

## DNS Management

### DNS Record Configuration

```typescript
interface DNSRecord {
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV";
  name: string;
  value: string;
  ttl: number;
  priority?: number; // For MX and SRV records
}

interface DNSProvider {
  createRecord(domain: string, record: DNSRecord): Promise<DNSRecord>;
  updateRecord(
    domain: string,
    recordId: string,
    record: Partial<DNSRecord>
  ): Promise<DNSRecord>;
  deleteRecord(domain: string, recordId: string): Promise<void>;
  listRecords(domain: string): Promise<DNSRecord[]>;
  validateConfiguration(domain: string): Promise<DNSValidationResult>;
}

class CloudflareDNSProvider implements DNSProvider {
  constructor(
    private apiKey: string,
    private email: string
  ) {}

  async createRecord(domain: string, record: DNSRecord): Promise<DNSRecord> {
    const zoneId = await this.getZoneId(domain);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        method: "POST",
        headers: {
          "X-Auth-Email": this.email,
          "X-Auth-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: record.type,
          name: record.name,
          content: record.value,
          ttl: record.ttl,
          priority: record.priority,
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        `Failed to create DNS record: ${result.errors[0]?.message}`
      );
    }

    return this.mapCloudflareRecord(result.result);
  }

  async validateConfiguration(domain: string): Promise<DNSValidationResult> {
    const records = await this.listRecords(domain);
    const validation: DNSValidationResult = {
      valid: true,
      issues: [],
      recommendations: [],
    };

    // Validate MX records
    const mxRecords = records.filter((r) => r.type === "MX");
    if (mxRecords.length === 0) {
      validation.issues.push("No MX records found");
      validation.valid = false;
    }

    // Validate SPF record
    const spfRecords = records.filter(
      (r) => r.type === "TXT" && r.value.startsWith("v=spf1")
    );
    if (spfRecords.length === 0) {
      validation.recommendations.push(
        "Consider adding SPF record for email authentication"
      );
    } else if (spfRecords.length > 1) {
      validation.issues.push(
        "Multiple SPF records found - only one is allowed"
      );
      validation.valid = false;
    }

    return validation;
  }
}
```

### Automated DNS Configuration

```typescript
class AutomatedDNSConfigurator {
  constructor(
    private dnsProvider: DNSProvider,
    private emailProvider: EmailProvider
  ) {}

  async configureForEmailSending(domain: string): Promise<DNSConfigResult> {
    const requiredRecords: DNSRecord[] = [];

    // Get email provider specific records
    const providerRecords =
      await this.emailProvider.getRequiredDNSRecords(domain);
    requiredRecords.push(...providerRecords);

    // Add standard email records
    requiredRecords.push(
      // MX record
      {
        type: "MX",
        name: "@",
        value: `mail.${domain}`,
        ttl: 3600,
        priority: 10,
      },
      // SPF record
      {
        type: "TXT",
        name: "@",
        value: await this.generateSPFRecord(domain),
        ttl: 3600,
      }
    );

    // Create records
    const results = await Promise.allSettled(
      requiredRecords.map((record) =>
        this.dnsProvider.createRecord(domain, record)
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");

    return {
      success: failed.length === 0,
      recordsCreated: successful,
      recordsFailed: failed.length,
      errors: failed.map((f) => f.reason?.message || "Unknown error"),
    };
  }

  private async generateSPFRecord(domain: string): Promise<string> {
    const includes = await this.emailProvider.getSPFIncludes();
    return `v=spf1 ${includes.join(" ")} ~all`;
  }
}
```

## Authentication Setup

### SPF/DKIM/DMARC Configuration

```typescript
interface AuthConfig {
  spf: {
    enabled: boolean;
    includes: string[];
    ipAddresses: string[];
    policy: "pass" | "fail" | "softfail" | "neutral";
  };
  dkim: {
    enabled: boolean;
    keyLength: 1024 | 2048 | 4096;
    selector: string;
    rotationSchedule: "monthly" | "quarterly" | "yearly";
  };
  dmarc: {
    enabled: boolean;
    policy: "none" | "quarantine" | "reject";
    subdomainPolicy?: "none" | "quarantine" | "reject";
    reportingEmails: string[];
    percentage: number;
    alignment: {
      spf: "relaxed" | "strict";
      dkim: "relaxed" | "strict";
    };
  };
}

class EmailAuthenticationService {
  async setupAuthentication(
    domainId: string,
    config: AuthConfig
  ): Promise<AuthSetupResult> {
    const domain = await this.getDomain(domainId);
    const results: AuthSetupResult = {
      spf: { configured: false },
      dkim: { configured: false },
      dmarc: { configured: false },
      errors: [],
    };

    try {
      // Configure SPF
      if (config.spf.enabled) {
        results.spf = await this.configureSPF(domain, config.spf);
      }

      // Configure DKIM
      if (config.dkim.enabled) {
        results.dkim = await this.configureDKIM(domain, config.dkim);
      }

      // Configure DMARC (requires SPF or DKIM)
      if (
        config.dmarc.enabled &&
        (results.spf.configured || results.dkim.configured)
      ) {
        results.dmarc = await this.configureDMARC(domain, config.dmarc);
      }
    } catch (error) {
      results.errors.push(error.message);
    }

    return results;
  }

  private async configureSPF(
    domain: Domain,
    config: AuthConfig["spf"]
  ): Promise<SPFResult> {
    const spfRecord = this.buildSPFRecord(config);

    try {
      await this.dnsProvider.createRecord(domain.name, {
        type: "TXT",
        name: "@",
        value: spfRecord,
        ttl: 3600,
      });

      return {
        configured: true,
        record: spfRecord,
      };
    } catch (error) {
      return {
        configured: false,
        error: error.message,
      };
    }
  }

  private async configureDKIM(
    domain: Domain,
    config: AuthConfig["dkim"]
  ): Promise<DKIMResult> {
    // Generate DKIM key pair
    const keyPair = await this.generateDKIMKeys(config.keyLength);

    // Store private key securely
    await this.storePrivateKey(domain.id, keyPair.privateKey);

    // Create DNS record with public key
    const dkimRecord = `v=DKIM1; k=rsa; p=${keyPair.publicKey}`;

    try {
      await this.dnsProvider.createRecord(domain.name, {
        type: "TXT",
        name: `${config.selector}._domainkey`,
        value: dkimRecord,
        ttl: 3600,
      });

      return {
        configured: true,
        selector: config.selector,
        publicKey: keyPair.publicKey,
      };
    } catch (error) {
      return {
        configured: false,
        error: error.message,
      };
    }
  }

  private buildSPFRecord(config: AuthConfig["spf"]): string {
    const parts = ["v=spf1"];

    // Add includes
    config.includes.forEach((include) => {
      parts.push(`include:${include}`);
    });

    // Add IP addresses
    config.ipAddresses.forEach((ip) => {
      const mechanism = ip.includes(":") ? "ip6" : "ip4";
      parts.push(`${mechanism}:${ip}`);
    });

    // Add policy
    const policyMap = {
      pass: "+all",
      fail: "-all",
      softfail: "~all",
      neutral: "?all",
    };

    parts.push(policyMap[config.policy]);

    return parts.join(" ");
  }
}
```

## Health Monitoring

### Domain Health Checks

```typescript
interface DomainHealthStatus {
  overall: "healthy" | "warning" | "critical";
  checks: {
    dns: HealthCheck;
    authentication: HealthCheck;
    deliverability: HealthCheck;
    reputation: HealthCheck;
  };
  lastChecked: Date;
  nextCheck: Date;
}

interface HealthCheck {
  status: "pass" | "warning" | "fail";
  message: string;
  details?: Record<string, any>;
  lastChecked: Date;
}

class DomainHealthMonitor {
  async checkDomainHealth(domainId: string): Promise<DomainHealthStatus> {
    const domain = await this.getDomain(domainId);

    const [dnsCheck, authCheck, deliverabilityCheck, reputationCheck] =
      await Promise.all([
        this.checkDNSHealth(domain),
        this.checkAuthenticationHealth(domain),
        this.checkDeliverabilityHealth(domain),
        this.checkReputationHealth(domain),
      ]);

    const overall = this.calculateOverallHealth([
      dnsCheck,
      authCheck,
      deliverabilityCheck,
      reputationCheck,
    ]);

    return {
      overall,
      checks: {
        dns: dnsCheck,
        authentication: authCheck,
        deliverability: deliverabilityCheck,
        reputation: reputationCheck,
      },
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
  }

  private async checkDNSHealth(domain: Domain): Promise<HealthCheck> {
    try {
      const validation = await this.dnsProvider.validateConfiguration(
        domain.name
      );

      if (validation.valid) {
        return {
          status: "pass",
          message: "DNS configuration is valid",
          lastChecked: new Date(),
        };
      } else {
        return {
          status: validation.issues.length > 0 ? "fail" : "warning",
          message: `DNS issues found: ${validation.issues.join(", ")}`,
          details: {
            issues: validation.issues,
            recommendations: validation.recommendations,
          },
          lastChecked: new Date(),
        };
      }
    } catch (error) {
      return {
        status: "fail",
        message: `DNS check failed: ${error.message}`,
        lastChecked: new Date(),
      };
    }
  }

  private async checkAuthenticationHealth(
    domain: Domain
  ): Promise<HealthCheck> {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Check SPF
      const spfRecords = await this.dnsResolver.resolveTxt(domain.name);
      const spfRecord = spfRecords.find((record) =>
        record.startsWith("v=spf1")
      );

      if (!spfRecord) {
        issues.push("No SPF record found");
      } else if (this.countSPFLookups(spfRecord) > 10) {
        warnings.push("SPF record has too many DNS lookups");
      }

      // Check DKIM
      const dkimSelector = await this.getDKIMSelector(domain.id);
      if (dkimSelector) {
        const dkimRecords = await this.dnsResolver.resolveTxt(
          `${dkimSelector}._domainkey.${domain.name}`
        );
        if (dkimRecords.length === 0) {
          issues.push("DKIM record not found");
        }
      } else {
        warnings.push("No DKIM configuration found");
      }

      // Check DMARC
      const dmarcRecords = await this.dnsResolver.resolveTxt(
        `_dmarc.${domain.name}`
      );
      if (dmarcRecords.length === 0) {
        warnings.push("No DMARC record found");
      }

      if (issues.length > 0) {
        return {
          status: "fail",
          message: `Authentication issues: ${issues.join(", ")}`,
          details: { issues, warnings },
          lastChecked: new Date(),
        };
      } else if (warnings.length > 0) {
        return {
          status: "warning",
          message: `Authentication warnings: ${warnings.join(", ")}`,
          details: { warnings },
          lastChecked: new Date(),
        };
      } else {
        return {
          status: "pass",
          message: "Email authentication is properly configured",
          lastChecked: new Date(),
        };
      }
    } catch (error) {
      return {
        status: "fail",
        message: `Authentication check failed: ${error.message}`,
        lastChecked: new Date(),
      };
    }
  }
}
```

## Integration Examples

### Using the Domain Service

```typescript
// Initialize the domain service
const domainService = new DomainManagementService({
  dnsProvider: new CloudflareDNSProvider(apiKey, email),
  emailProvider: new MailgunProvider(apiKey),
  healthMonitor: new DomainHealthMonitor(),
});

// Add a new domain
const domain = await domainService.addDomain("example.com", {
  name: "example.com",
  purpose: "sending",
  emailProvider: "mailgun",
  dnsProvider: "cloudflare",
  authenticationConfig: {
    enableSPF: true,
    enableDKIM: true,
    enableDMARC: true,
    dmarcPolicy: "quarantine",
  },
});

// Verify the domain
const verificationResult = await domainService.verifyDomain(domain.id);

if (verificationResult.verified) {
  console.log("Domain verified successfully");

  // Check domain health
  const healthStatus = await domainService.checkDomainHealth(domain.id);
  console.log("Domain health:", healthStatus.overall);
} else {
  console.log("Domain verification failed:", verificationResult.errors);
}
```

### React Component Integration

```typescript
const DomainManagement: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const domainList = await domainService.listDomains();
      setDomains(domainList);
    } catch (error) {
      console.error('Failed to load domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (domainConfig: DomainConfig) => {
    try {
      const newDomain = await domainService.addDomain(domainConfig.name, domainConfig);
      setDomains(prev => [...prev, newDomain]);
    } catch (error) {
      console.error('Failed to add domain:', error);
    }
  };

  if (loading) {
    return <div>Loading domains...</div>;
  }

  return (
    <div>
      <h1>Domain Management</h1>
      <DomainList domains={domains} />
      <AddDomainForm onSubmit={handleAddDomain} />
    </div>
  );
};
```

## Testing

### Unit Tests

```typescript
describe("DomainManagementService", () => {
  let service: DomainManagementService;
  let mockDNSProvider: jest.Mocked<DNSProvider>;
  let mockEmailProvider: jest.Mocked<EmailProvider>;

  beforeEach(() => {
    mockDNSProvider = createMockDNSProvider();
    mockEmailProvider = createMockEmailProvider();

    service = new DomainManagementService({
      dnsProvider: mockDNSProvider,
      emailProvider: mockEmailProvider,
      healthMonitor: createMockHealthMonitor(),
    });
  });

  describe("addDomain", () => {
    it("should add a domain with proper configuration", async () => {
      const config: DomainConfig = {
        name: "test.com",
        purpose: "sending",
        emailProvider: "mailgun",
        dnsProvider: "cloudflare",
        authenticationConfig: {
          enableSPF: true,
          enableDKIM: true,
          enableDMARC: true,
          dmarcPolicy: "quarantine",
        },
      };

      mockDNSProvider.createRecord.mockResolvedValue({
        type: "TXT",
        name: "@",
        value: "v=spf1 include:mailgun.org ~all",
        ttl: 3600,
      });

      const result = await service.addDomain("test.com", config);

      expect(result.name).toBe("test.com");
      expect(result.status).toBe("pending_verification");
      expect(mockDNSProvider.createRecord).toHaveBeenCalled();
    });

    it("should throw error for invalid domain format", async () => {
      const config: DomainConfig = {
        name: "invalid..domain",
        purpose: "sending",
        emailProvider: "mailgun",
        dnsProvider: "cloudflare",
        authenticationConfig: {
          enableSPF: false,
          enableDKIM: false,
          enableDMARC: false,
          dmarcPolicy: "none",
        },
      };

      await expect(
        service.addDomain("invalid..domain", config)
      ).rejects.toThrow("Invalid domain format");
    });
  });
});
```

## Best Practices

### 1. Domain Configuration

- Always verify domain ownership before configuration
- Use appropriate TTL values for DNS records
- Implement gradual DMARC policy enforcement

### 2. Security

- Store DKIM private keys securely
- Rotate keys regularly
- Monitor for unauthorized DNS changes

### 3. Monitoring

- Implement comprehensive health checks
- Set up alerting for critical issues
- Regular validation of DNS configuration

### 4. Error Handling

- Provide clear error messages
- Implement retry logic for transient failures
- Log all configuration changes

## Related Documentation

- [Domain Types](../../../types/domains/README.md)
- [DNS Configuration Guide](../../../docs/infrastructure/dns-setup.md)
- [Email Authentication Guide](../../../docs/infrastructure/email-auth.md)
- [Domain Analytics](../../../docs/analytics/domain-analytics.md)

## External Resources

- [RFC 1035 - Domain Names](https://tools.ietf.org/html/rfc1035)
- [RFC 7208 - SPF](https://tools.ietf.org/html/rfc7208)
- [RFC 6376 - DKIM](https://tools.ietf.org/html/rfc6376)
- [RFC 7489 - DMARC](https://tools.ietf.org/html/rfc7489)
