# DNS Configuration Guide

## Overview

This guide covers DNS configuration for domain management, email authentication, and deliverability optimization. Proper DNS setup is crucial for email delivery success and domain reputation.

## DNS Record Types

### Required Records

#### MX Records

Mail Exchange records direct email to your mail servers:

```
Priority  Host    Value
10        @       mail.yourdomain.com
20        @       backup-mail.yourdomain.com
```

#### SPF Records

Sender Policy Framework prevents email spoofing:

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com include:mailgun.org ~all
```

#### DKIM Records

DomainKeys Identified Mail provides email authentication:

```
Type: TXT
Host: selector1._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

#### DMARC Records

Domain-based Message Authentication, Reporting & Conformance:

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### Optional Records

#### BIMI Records

Brand Indicators for Message Identification:

```
Type: TXT
Host: default._bimi
Value: v=BIMI1; l=https://yourdomain.com/logo.svg
```

#### MTA-STS Records

Mail Transfer Agent Strict Transport Security:

```
Type: TXT
Host: _mta-sts
Value: v=STSv1; id=20240101T000000
```

## Configuration Steps

### 1. Domain Verification

Before configuring DNS records, verify domain ownership:

```bash
# Check current DNS configuration
dig MX yourdomain.com
dig TXT yourdomain.com

# Verify SPF record
dig TXT yourdomain.com | grep spf1

# Check DKIM record
dig TXT selector1._domainkey.yourdomain.com
```

### 2. SPF Configuration

Configure SPF to authorize sending servers:

```
# Basic SPF record
v=spf1 include:_spf.google.com ~all

# Multiple providers
v=spf1 include:_spf.google.com include:mailgun.org include:sendgrid.net ~all

# Custom IP addresses
v=spf1 ip4:192.168.1.1 ip6:2001:db8::1 include:_spf.google.com ~all
```

### 3. DKIM Setup

Generate and configure DKIM keys:

```bash
# Generate DKIM key pair
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key

# Extract public key for DNS
openssl rsa -in private.key -pubout -outform DER | base64 -w 0
```

### 4. DMARC Policy

Implement DMARC policy gradually:

```
# Phase 1: Monitor only
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com

# Phase 2: Quarantine suspicious emails
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=25

# Phase 3: Reject unauthorized emails
v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com
```

## DNS Providers

### Cloudflare

Configuration via Cloudflare dashboard:

1. Navigate to DNS management
2. Add required records
3. Ensure proxy status is appropriate (usually DNS only for email records)

### Route 53

Configuration via AWS console or CLI:

```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "TXT",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "\"v=spf1 include:_spf.google.com ~all\""
          }
        ]
      }
    }
  ]
}
```

### Google Domains

Configuration via Google Domains interface:

1. Access DNS settings
2. Add custom resource records
3. Configure TTL values appropriately

## Validation and Testing

### DNS Propagation

Check DNS propagation globally:

```bash
# Check from multiple locations
dig @8.8.8.8 TXT yourdomain.com
dig @1.1.1.1 TXT yourdomain.com
dig @208.67.222.222 TXT yourdomain.com
```

### Email Authentication Testing

Test email authentication setup:

```bash
# Test SPF
dig TXT yourdomain.com | grep spf1

# Test DKIM
dig TXT selector1._domainkey.yourdomain.com

# Test DMARC
dig TXT _dmarc.yourdomain.com
```

### Deliverability Testing

Use online tools to test configuration:

- MXToolbox.com
- Mail-tester.com
- DMARC Analyzer
- SPF Record Checker

## Common Issues

### SPF Record Problems

```
# Too many DNS lookups (limit: 10)
v=spf1 include:provider1.com include:provider2.com ... (too many includes)

# Solution: Use IP addresses or consolidate providers
v=spf1 ip4:192.168.1.0/24 include:consolidated-provider.com ~all
```

### DKIM Signature Issues

```
# Invalid key format
k=rsa; p=InvalidKeyData

# Solution: Ensure proper key encoding
k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

### DMARC Policy Conflicts

```
# Conflicting alignment
v=DMARC1; p=reject; aspf=s; adkim=s

# Solution: Adjust alignment requirements
v=DMARC1; p=quarantine; aspf=r; adkim=r
```

## Best Practices

### 1. Gradual Implementation

- Start with monitoring (p=none)
- Gradually increase enforcement
- Monitor DMARC reports regularly

### 2. Record Management

- Use appropriate TTL values (300-3600 seconds)
- Document all DNS changes
- Maintain backup configurations

### 3. Security Considerations

- Protect DKIM private keys
- Regular key rotation
- Monitor for unauthorized changes

### 4. Monitoring and Maintenance

- Set up DMARC reporting
- Regular DNS health checks
- Update records when changing providers

## Troubleshooting

### DNS Resolution Issues

```bash
# Check authoritative nameservers
dig NS yourdomain.com

# Query specific nameserver
dig @ns1.yourdomain.com TXT yourdomain.com

# Check TTL and caching
dig TXT yourdomain.com +noall +answer
```

### Email Delivery Problems

1. **Check SPF alignment**: Ensure sending domain matches SPF record
2. **Verify DKIM signatures**: Confirm DKIM keys are properly configured
3. **Review DMARC reports**: Analyze authentication failures
4. **Test with multiple providers**: Gmail, Outlook, Yahoo, etc.

### Performance Optimization

- Minimize DNS lookups in SPF records
- Use appropriate TTL values
- Consider DNS caching strategies
- Monitor DNS query performance

## Related Documentation

- [Email Authentication Guide](./email-auth.md)
- [Cloudflare Configuration](./cloudflare.md)
- [Domain Management](../../types/domains/README.md)
- [Domain Analytics](../analytics/domain-analytics.md)

## External Resources

- [RFC 7208 - SPF](https://tools.ietf.org/html/rfc7208)
- [RFC 6376 - DKIM](https://tools.ietf.org/html/rfc6376)
- [RFC 7489 - DMARC](https://tools.ietf.org/html/rfc7489)
- [BIMI Specification](https://bimigroup.org/bimi-rfc/)
