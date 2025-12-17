# Email Authentication Guide

## Overview

This guide covers email authentication mechanisms including SPF, DKIM, and DMARC configuration for optimal email deliverability and security. Proper authentication prevents spoofing and improves inbox placement rates.

## Authentication Mechanisms

### SPF (Sender Policy Framework)

SPF authorizes which servers can send email on behalf of your domain.

#### Basic SPF Configuration

```
# Basic SPF record
v=spf1 include:_spf.google.com ~all

# Multiple email providers
v=spf1 include:_spf.google.com include:mailgun.org include:sendgrid.net ~all

# Custom IP addresses
v=spf1 ip4:192.168.1.1 ip4:192.168.1.2 include:_spf.google.com ~all

# IPv6 support
v=spf1 ip4:192.168.1.0/24 ip6:2001:db8::/32 include:_spf.google.com ~all
```

#### SPF Mechanisms

| Mechanism | Description                | Example                           |
| --------- | -------------------------- | --------------------------------- |
| `all`     | Matches all IPs            | `~all` (soft fail)                |
| `ip4`     | IPv4 address/range         | `ip4:192.168.1.1`                 |
| `ip6`     | IPv6 address/range         | `ip6:2001:db8::1`                 |
| `a`       | A record lookup            | `a:mail.example.com`              |
| `mx`      | MX record lookup           | `mx:example.com`                  |
| `include` | Include another SPF record | `include:_spf.google.com`         |
| `exists`  | DNS lookup test            | `exists:%{ir}.%{l1r+-}._spf.%{d}` |

#### SPF Qualifiers

| Qualifier | Result    | Description             |
| --------- | --------- | ----------------------- |
| `+`       | Pass      | Explicitly authorized   |
| `-`       | Fail      | Not authorized          |
| `~`       | Soft Fail | Probably not authorized |
| `?`       | Neutral   | No policy               |

### DKIM (DomainKeys Identified Mail)

DKIM provides cryptographic authentication of email messages.

#### DKIM Key Generation

```bash
# Generate 2048-bit RSA key pair
openssl genrsa -out dkim_private.key 2048
openssl rsa -in dkim_private.key -pubout -out dkim_public.key

# Extract public key for DNS record
openssl rsa -in dkim_private.key -pubout -outform DER | base64 -w 0
```

#### DKIM DNS Record

```
# DNS TXT record format
Host: selector1._domainkey.yourdomain.com
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...

# With additional parameters
v=DKIM1; k=rsa; t=s; s=email; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

#### DKIM Parameters

| Parameter | Description     | Values                      |
| --------- | --------------- | --------------------------- |
| `v`       | Version         | `DKIM1`                     |
| `k`       | Key type        | `rsa`, `ed25519`            |
| `p`       | Public key      | Base64 encoded key          |
| `t`       | Testing mode    | `y` (testing), `s` (strict) |
| `s`       | Service type    | `email`, `*`                |
| `h`       | Hash algorithms | `sha1`, `sha256`            |

### DMARC (Domain-based Message Authentication)

DMARC builds on SPF and DKIM to provide policy enforcement and reporting.

#### DMARC Policy Levels

```
# Monitor only (recommended start)
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com

# Quarantine suspicious emails
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=25

# Reject unauthorized emails
v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com; sp=quarantine
```

#### DMARC Parameters

| Parameter | Description       | Values                         |
| --------- | ----------------- | ------------------------------ |
| `v`       | Version           | `DMARC1`                       |
| `p`       | Policy            | `none`, `quarantine`, `reject` |
| `sp`      | Subdomain policy  | `none`, `quarantine`, `reject` |
| `rua`     | Aggregate reports | Email address                  |
| `ruf`     | Forensic reports  | Email address                  |
| `pct`     | Percentage        | `0-100`                        |
| `adkim`   | DKIM alignment    | `r` (relaxed), `s` (strict)    |
| `aspf`    | SPF alignment     | `r` (relaxed), `s` (strict)    |

## Implementation Strategy

### Phase 1: Monitoring (Weeks 1-4)

1. **Deploy DMARC with p=none**

   ```
   v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com
   ```

2. **Collect and analyze reports**
   - Identify legitimate sending sources
   - Detect unauthorized usage
   - Understand email flow patterns

3. **Fix authentication issues**
   - Update SPF records for all legitimate sources
   - Configure DKIM for all sending services
   - Ensure proper alignment

### Phase 2: Quarantine (Weeks 5-8)

1. **Implement quarantine policy**

   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=25
   ```

2. **Gradual rollout**
   - Start with 25% of emails
   - Monitor delivery rates
   - Increase percentage gradually

3. **Address delivery issues**
   - Fix remaining authentication problems
   - Update third-party service configurations
   - Monitor user complaints

### Phase 3: Enforcement (Weeks 9-12)

1. **Full enforcement**

   ```
   v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com
   ```

2. **Continuous monitoring**
   - Regular report analysis
   - Proactive issue resolution
   - Performance optimization

## Configuration Examples

### Google Workspace

```
# SPF record
v=spf1 include:_spf.google.com ~all

# DKIM (configured in Google Admin Console)
# Google generates and manages DKIM keys automatically

# DMARC record
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; adkim=r; aspf=r
```

### Microsoft 365

```
# SPF record
v=spf1 include:spf.protection.outlook.com ~all

# DKIM (configured in Microsoft 365 Admin Center)
# Microsoft provides DKIM keys for configuration

# DMARC record
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; adkim=r; aspf=r
```

### Mailgun

```
# SPF record
v=spf1 include:mailgun.org ~all

# DKIM record (provided by Mailgun)
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...

# DMARC record
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### SendGrid

```
# SPF record
v=spf1 include:sendgrid.net ~all

# DKIM record (configured in SendGrid dashboard)
# SendGrid provides domain authentication setup

# DMARC record
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

## Testing and Validation

### Authentication Testing Tools

```bash
# Test SPF record
dig TXT yourdomain.com | grep spf1

# Test DKIM record
dig TXT selector1._domainkey.yourdomain.com

# Test DMARC record
dig TXT _dmarc.yourdomain.com

# Comprehensive testing
nslookup -type=TXT yourdomain.com
nslookup -type=TXT selector1._domainkey.yourdomain.com
nslookup -type=TXT _dmarc.yourdomain.com
```

### Online Validation Tools

- **MXToolbox**: Comprehensive DNS and email testing
- **DMARC Analyzer**: DMARC policy and report analysis
- **Mail Tester**: Email deliverability testing
- **SPF Record Checker**: SPF syntax validation
- **DKIM Validator**: DKIM signature verification

### Email Testing

```python
# Python script for testing email authentication
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_email_auth(sender, recipient, subject, body):
    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = recipient
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    # Send via authenticated SMTP
    server = smtplib.SMTP('smtp.yourdomain.com', 587)
    server.starttls()
    server.login(sender, 'password')
    server.send_message(msg)
    server.quit()
```

## DMARC Report Analysis

### Aggregate Reports (RUA)

Aggregate reports provide statistical data about email authentication:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feedback>
  <report_metadata>
    <org_name>google.com</org_name>
    <email>noreply-dmarc-support@google.com</email>
    <report_id>12345</report_id>
    <date_range>
      <begin>1609459200</begin>
      <end>1609545599</end>
    </date_range>
  </report_metadata>
  <policy_published>
    <domain>yourdomain.com</domain>
    <p>quarantine</p>
    <sp>none</sp>
    <pct>100</pct>
  </policy_published>
  <record>
    <row>
      <source_ip>192.168.1.1</source_ip>
      <count>100</count>
      <policy_evaluated>
        <disposition>none</disposition>
        <dkim>pass</dkim>
        <spf>pass</spf>
      </policy_evaluated>
    </row>
    <identifiers>
      <header_from>yourdomain.com</header_from>
    </identifiers>
    <auth_results>
      <dkim>
        <domain>yourdomain.com</domain>
        <result>pass</result>
        <selector>selector1</selector>
      </dkim>
      <spf>
        <domain>yourdomain.com</domain>
        <result>pass</result>
      </spf>
    </auth_results>
  </record>
</feedback>
```

### Report Analysis Tools

```python
# Python script for DMARC report analysis
import xml.etree.ElementTree as ET
from collections import defaultdict

def analyze_dmarc_report(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()

    stats = {
        'total_messages': 0,
        'pass_count': 0,
        'fail_count': 0,
        'sources': defaultdict(int)
    }

    for record in root.findall('.//record'):
        count = int(record.find('.//count').text)
        source_ip = record.find('.//source_ip').text
        dkim_result = record.find('.//dkim').text
        spf_result = record.find('.//spf').text

        stats['total_messages'] += count
        stats['sources'][source_ip] += count

        if dkim_result == 'pass' and spf_result == 'pass':
            stats['pass_count'] += count
        else:
            stats['fail_count'] += count

    return stats
```

## Troubleshooting

### Common SPF Issues

1. **Too many DNS lookups**

   ```
   # Problem: Exceeds 10 lookup limit
   v=spf1 include:provider1.com include:provider2.com ... (too many)

   # Solution: Consolidate or use IP addresses
   v=spf1 ip4:192.168.1.0/24 include:consolidated-provider.com ~all
   ```

2. **SPF record too long**

   ```
   # Problem: Exceeds 255 character limit
   v=spf1 include:very-long-provider-name.com include:another-very-long-provider.com ...

   # Solution: Use shorter includes or IP ranges
   v=spf1 ip4:192.168.1.0/24 include:short.com ~all
   ```

### Common DKIM Issues

1. **Invalid key format**

   ```
   # Problem: Incorrect key encoding
   p=InvalidKeyData

   # Solution: Proper base64 encoding
   p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
   ```

2. **Key rotation problems**
   ```
   # Problem: Old keys still in use
   # Solution: Gradual key rotation
   # 1. Add new key with different selector
   # 2. Update signing configuration
   # 3. Remove old key after transition period
   ```

### Common DMARC Issues

1. **Alignment failures**

   ```
   # Problem: Domain mismatch
   From: user@subdomain.yourdomain.com
   DKIM: d=yourdomain.com (alignment fails with strict mode)

   # Solution: Use relaxed alignment or fix domain matching
   v=DMARC1; p=quarantine; adkim=r; aspf=r
   ```

2. **Report delivery issues**

   ```
   # Problem: Reports not received
   rua=mailto:dmarc@yourdomain.com

   # Solution: Verify email address and DNS configuration
   # Check spam folders and email forwarding
   ```

## Best Practices

### 1. Gradual Implementation

- Start with monitoring (p=none)
- Analyze reports thoroughly
- Implement enforcement gradually

### 2. Key Management

- Use strong key lengths (2048-bit minimum)
- Rotate keys regularly (annually)
- Secure private key storage

### 3. Monitoring and Maintenance

- Regular report analysis
- Proactive issue resolution
- Performance monitoring

### 4. Documentation

- Document all configurations
- Maintain change logs
- Share knowledge with team

## Integration with Application

### Email Service Configuration

```typescript
// Email service with authentication
interface EmailAuthConfig {
  domain: string;
  dkimSelector: string;
  dkimPrivateKey: string;
  spfRecord: string;
  dmarcPolicy: "none" | "quarantine" | "reject";
}

class AuthenticatedEmailService {
  constructor(private config: EmailAuthConfig) {}

  async sendEmail(message: EmailMessage): Promise<void> {
    // Add DKIM signature
    const signedMessage = await this.signWithDKIM(message);

    // Verify SPF alignment
    this.validateSPFAlignment(message);

    // Send email
    await this.deliverEmail(signedMessage);
  }

  private async signWithDKIM(
    message: EmailMessage
  ): Promise<SignedEmailMessage> {
    // DKIM signing implementation
  }

  private validateSPFAlignment(message: EmailMessage): void {
    // SPF alignment validation
  }
}
```

### Monitoring Integration

```typescript
// DMARC report processing
interface DMARCReport {
  domain: string;
  reportId: string;
  dateRange: { begin: Date; end: Date };
  records: DMARCRecord[];
}

interface DMARCRecord {
  sourceIP: string;
  count: number;
  disposition: "none" | "quarantine" | "reject";
  dkimResult: "pass" | "fail";
  spfResult: "pass" | "fail";
}

class DMARCAnalyzer {
  async processReport(report: DMARCReport): Promise<AnalysisResult> {
    const analysis = {
      totalMessages: 0,
      passRate: 0,
      failureReasons: [],
      suspiciousSources: [],
    };

    for (const record of report.records) {
      analysis.totalMessages += record.count;

      if (record.dkimResult === "pass" && record.spfResult === "pass") {
        analysis.passRate += record.count;
      } else {
        this.analyzeFailure(record, analysis);
      }
    }

    analysis.passRate = (analysis.passRate / analysis.totalMessages) * 100;

    return analysis;
  }
}
```

## Related Documentation

- [DNS Configuration Guide](./dns-setup.md)
- [Cloudflare Configuration](./cloudflare.md)
- [Domain Management](../../types/domains/README.md)
- [Email Service Integration](../../lib/services/email/README.md)

## External Resources

- [DMARC.org](https://dmarc.org/)
- [RFC 7208 - SPF](https://tools.ietf.org/html/rfc7208)
- [RFC 6376 - DKIM](https://tools.ietf.org/html/rfc6376)
- [RFC 7489 - DMARC](https://tools.ietf.org/html/rfc7489)
- [Email Authentication Best Practices](https://www.m3aawg.org/sites/default/files/m3aawg-email-authentication-recommended-best-practices-09-2020.pdf)
