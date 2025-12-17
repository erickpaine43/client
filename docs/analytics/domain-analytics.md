# Domain Analytics Documentation

## Overview

Domain analytics provide comprehensive insights into domain performance, reputation, deliverability metrics, and health indicators. This documentation covers the domain analytics system architecture, key metrics, and implementation patterns.

## Key Metrics

### Deliverability Metrics

#### Delivery Rate

Percentage of emails successfully delivered to recipient inboxes:

```typescript
interface DeliveryMetrics {
  sent: number;
  delivered: number;
  bounced: number;
  deliveryRate: number; // (delivered / sent) * 100
}
```

#### Bounce Rate

Percentage of emails that bounced (hard and soft bounces):

```typescript
interface BounceMetrics {
  hardBounces: number;
  softBounces: number;
  totalBounces: number;
  bounceRate: number; // (totalBounces / sent) * 100
}
```

#### Spam Rate

Percentage of emails marked as spam or sent to spam folders:

```typescript
interface SpamMetrics {
  spamComplaints: number;
  spamRate: number; // (spamComplaints / delivered) * 100
  spamFolderRate: number; // Estimated spam folder placement
}
```

### Engagement Metrics

#### Open Rate

Percentage of delivered emails that were opened:

```typescript
interface EngagementMetrics {
  opens: number;
  uniqueOpens: number;
  openRate: number; // (uniqueOpens / delivered) * 100
  multipleOpens: number; // opens - uniqueOpens
}
```

#### Click Rate

Percentage of delivered emails that received clicks:

```typescript
interface ClickMetrics {
  clicks: number;
  uniqueClicks: number;
  clickRate: number; // (uniqueClicks / delivered) * 100
  clickToOpenRate: number; // (uniqueClicks / uniqueOpens) * 100
}
```

### Reputation Metrics

#### Domain Reputation Score

Overall domain health score based on multiple factors:

```typescript
interface ReputationMetrics {
  reputationScore: number; // 0-100 scale
  factors: {
    deliverabilityScore: number;
    engagementScore: number;
    authenticationScore: number;
    volumeConsistency: number;
    complaintRate: number;
  };
  trend: "improving" | "stable" | "declining";
}
```

#### Authentication Status

Email authentication configuration and performance:

```typescript
interface AuthenticationMetrics {
  spf: {
    configured: boolean;
    passRate: number;
    issues: string[];
  };
  dkim: {
    configured: boolean;
    passRate: number;
    keyRotationDate: Date;
    issues: string[];
  };
  dmarc: {
    configured: boolean;
    policy: "none" | "quarantine" | "reject";
    passRate: number;
    alignmentIssues: string[];
  };
}
```

## Data Collection

### Email Service Provider Integration

```typescript
interface DomainAnalyticsCollector {
  collectDeliveryMetrics(domain: string, timeRange: TimeRange): Promise<DeliveryMetrics>;
  collectEngagementMetrics(domain: string, timeRange: TimeRange): Promise<EngagementMetrics>;
  collectReputationMetrics(domain: string): Promise<ReputationMetrics>;
  collectAuthenticationMetrics(domain: string): Promise<AuthenticationMetrics>;
}

class MailgunAnalyticsCollector implements DomainAnalyticsCollector {
  async collectDeliveryMetrics(domain: string, timeRange: TimeRange): Promise<DeliveryMetrics> {
    const response = await this.mailgunClient.get(`/domains/${domain}/stats/total`, {
      event: ['accepted', 'delivered', 'failed'],
      start: timeRange.start.toISOString(),
      end: timeRange.end.toISOString(),
    });

    return {
      sent: response.stats.find(s => s.event === 'accepted')?.total_count || 0,
      delivered: response.stats => s.event === 'delivered')?.total_count || 0,
      bounced: response.stats.find(s => s.event === 'failed')?.total_count || 0,
      deliveryRate: this.calculateDeliveryRate(response.stats),
    };
  }
}
```

### Real-time Monitoring

```typescript
interface DomainHealthMonitor {
  monitorDeliverability(domain: string): Observable<DeliveryAlert>;
  monitorReputation(domain: string): Observable<ReputationAlert>;
  monitorAuthentication(domain: string): Observable<AuthenticationAlert>;
}

class RealTimeDomainMonitor implements DomainHealthMonitor {
  monitorDeliverability(domain: string): Observable<DeliveryAlert> {
    return interval(300000) // Check every 5 minutes
      .pipe(
        switchMap(() => this.checkDeliverability(domain)),
        filter((metrics) => this.isDeliverabilityAlert(metrics)),
        map((metrics) => this.createDeliveryAlert(metrics))
      );
  }

  private isDeliverabilityAlert(metrics: DeliveryMetrics): boolean {
    return metrics.deliveryRate < 95 || metrics.bounceRate > 5;
  }
}
```

## Analytics Dashboard Components

### Domain Health Card

```typescript
interface DomainHealthCardProps {
  domain: string;
  metrics: DomainMetrics;
  timeRange: TimeRange;
  onRefresh: () => void;
}

const DomainHealthCard: React.FC<DomainHealthCardProps> = ({
  domain,
  metrics,
  timeRange,
  onRefresh
}) => {
  const healthScore = calculateHealthScore(metrics);
  const healthStatus = getHealthStatus(healthScore);

  return (
    <Card className="domain-health-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{domain}</span>
          <Badge variant={healthStatus.variant}>
            {healthStatus.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <MetricDisplay
            label="Delivery Rate"
            value={`${metrics.deliveryRate.toFixed(1)}%`}
            trend={metrics.deliveryTrend}
          />
          <MetricDisplay
            label="Reputation Score"
            value={metrics.reputationScore}
            trend={metrics.reputationTrend}
          />
          <MetricDisplay
            label="Open Rate"
            value={`${metrics.openRate.toFixed(1)}%`}
            trend={metrics.engagementTrend}
          />
          <MetricDisplay
            label="Bounce Rate"
            value={`${metrics.bounceRate.toFixed(1)}%`}
            trend={metrics.bounceTrend}
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

### Deliverability Trends Chart

```typescript
interface DeliverabilityTrendsProps {
  domain: string;
  data: DomainMetricsTimeSeries[];
  timeRange: TimeRange;
}

const DeliverabilityTrends: React.FC<DeliverabilityTrendsProps> = ({
  domain,
  data,
  timeRange
}) => {
  const chartData = data.map(point => ({
    date: point.timestamp,
    deliveryRate: point.deliveryRate,
    bounceRate: point.bounceRate,
    openRate: point.openRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deliverability Trends - {domain}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="deliveryRate"
              stroke="#10b981"
              name="Delivery Rate"
            />
            <Line
              type="monotone"
              dataKey="bounceRate"
              stroke="#ef4444"
              name="Bounce Rate"
            />
            <Line
              type="monotone"
              dataKey="openRate"
              stroke="#3b82f6"
              name="Open Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

### Authentication Status Panel

```typescript
interface AuthenticationStatusProps {
  domain: string;
  authMetrics: AuthenticationMetrics;
  onConfigureAuth: (type: 'spf' | 'dkim' | 'dmarc') => void;
}

const AuthenticationStatus: React.FC<AuthenticationStatusProps> = ({
  domain,
  authMetrics,
  onConfigureAuth
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Authentication - {domain}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AuthenticationItem
            type="SPF"
            configured={authMetrics.spf.configured}
            passRate={authMetrics.spf.passRate}
            issues={authMetrics.spf.issues}
            onConfigure={() => onConfigureAuth('spf')}
          />
          <AuthenticationItem
            type="DKIM"
            configured={authMetrics.dkim.configured}
            passRate={authMetrics.dkim.passRate}
            issues={authMetrics.dkim.issues}
            onConfigure={() => onConfigureAuth('dkim')}
          />
          <AuthenticationItem
            type="DMARC"
            configured={authMetrics.dmarc.configured}
            passRate={authMetrics.dmarc.passRate}
            issues={authMetrics.dmarc.alignmentIssues}
            onConfigure={() => onConfigureAuth('dmarc')}
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

## Performance Optimization

### Caching Strategy

```typescript
interface DomainAnalyticsCache {
  getCachedMetrics(
    domain: string,
    timeRange: TimeRange
  ): Promise<DomainMetrics | null>;
  setCachedMetrics(
    domain: string,
    timeRange: TimeRange,
    metrics: DomainMetrics
  ): Promise<void>;
  invalidateCache(domain: string): Promise<void>;
}

class RedisDomainAnalyticsCache implements DomainAnalyticsCache {
  constructor(private redis: Redis) {}

  async getCachedMetrics(
    domain: string,
    timeRange: TimeRange
  ): Promise<DomainMetrics | null> {
    const key = this.generateCacheKey(domain, timeRange);
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  }

  async setCachedMetrics(
    domain: string,
    timeRange: TimeRange,
    metrics: DomainMetrics
  ): Promise<void> {
    const key = this.generateCacheKey(domain, timeRange);
    const ttl = this.calculateTTL(timeRange);

    await this.redis.setex(key, ttl, JSON.stringify(metrics));
  }

  private generateCacheKey(domain: string, timeRange: TimeRange): string {
    return `domain_analytics:${domain}:${timeRange.start.getTime()}-${timeRange.end.getTime()}`;
  }

  private calculateTTL(timeRange: TimeRange): number {
    const now = new Date();
    const isRecent = timeRange.end.getTime() > now.getTime() - 3600000; // 1 hour

    return isRecent ? 300 : 3600; // 5 minutes for recent data, 1 hour for historical
  }
}
```

### Batch Processing

```typescript
interface DomainAnalyticsBatchProcessor {
  processDomainsBatch(
    domains: string[],
    timeRange: TimeRange
  ): Promise<Map<string, DomainMetrics>>;
}

class ConcurrentDomainProcessor implements DomainAnalyticsBatchProcessor {
  constructor(
    private collector: DomainAnalyticsCollector,
    private concurrencyLimit: number = 5
  ) {}

  async processDomainsBatch(
    domains: string[],
    timeRange: TimeRange
  ): Promise<Map<string, DomainMetrics>> {
    const results = new Map<string, DomainMetrics>();

    // Process domains in batches to avoid rate limiting
    const batches = this.chunkArray(domains, this.concurrencyLimit);

    for (const batch of batches) {
      const batchPromises = batch.map(async (domain) => {
        try {
          const metrics = await this.collector.collectAllMetrics(
            domain,
            timeRange
          );
          return { domain, metrics };
        } catch (error) {
          console.error(`Failed to collect metrics for ${domain}:`, error);
          return { domain, metrics: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(({ domain, metrics }) => {
        if (metrics) {
          results.set(domain, metrics);
        }
      });

      // Rate limiting delay between batches
      await this.delay(1000);
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

## Alerting and Monitoring

### Alert Configuration

```typescript
interface DomainAlert {
  id: string;
  domain: string;
  type: "deliverability" | "reputation" | "authentication" | "volume";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metrics: Record<string, number>;
  timestamp: Date;
  resolved: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  domain: string;
  condition: AlertCondition;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
}

interface AlertCondition {
  metric: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte";
  threshold: number;
  timeWindow: number; // minutes
}

class DomainAlertManager {
  private alertRules: Map<string, AlertRule[]> = new Map();

  async evaluateAlerts(
    domain: string,
    metrics: DomainMetrics
  ): Promise<DomainAlert[]> {
    const rules = this.alertRules.get(domain) || [];
    const alerts: DomainAlert[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const isTriggered = this.evaluateCondition(rule.condition, metrics);

      if (isTriggered) {
        alerts.push({
          id: generateId(),
          domain,
          type: this.getAlertType(rule.condition.metric),
          severity: rule.severity,
          message: this.generateAlertMessage(rule, metrics),
          metrics: this.extractRelevantMetrics(rule.condition.metric, metrics),
          timestamp: new Date(),
          resolved: false,
        });
      }
    }

    return alerts;
  }

  private evaluateCondition(
    condition: AlertCondition,
    metrics: DomainMetrics
  ): boolean {
    const value = this.getMetricValue(condition.metric, metrics);

    switch (condition.operator) {
      case "gt":
        return value > condition.threshold;
      case "lt":
        return value < condition.threshold;
      case "gte":
        return value >= condition.threshold;
      case "lte":
        return value <= condition.threshold;
      case "eq":
        return value === condition.threshold;
      default:
        return false;
    }
  }
}
```

### Notification System

```typescript
interface NotificationChannel {
  type: "email" | "slack" | "webhook";
  config: Record<string, any>;
  enabled: boolean;
}

class DomainAlertNotifier {
  constructor(private channels: NotificationChannel[]) {}

  async sendAlert(alert: DomainAlert): Promise<void> {
    const enabledChannels = this.channels.filter((c) => c.enabled);

    const notifications = enabledChannels.map((channel) =>
      this.sendToChannel(channel, alert)
    );

    await Promise.allSettled(notifications);
  }

  private async sendToChannel(
    channel: NotificationChannel,
    alert: DomainAlert
  ): Promise<void> {
    switch (channel.type) {
      case "email":
        await this.sendEmailAlert(channel.config, alert);
        break;
      case "slack":
        await this.sendSlackAlert(channel.config, alert);
        break;
      case "webhook":
        await this.sendWebhookAlert(channel.config, alert);
        break;
    }
  }

  private async sendSlackAlert(config: any, alert: DomainAlert): Promise<void> {
    const message = {
      text: `Domain Alert: ${alert.domain}`,
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          fields: [
            { title: "Domain", value: alert.domain, short: true },
            {
              title: "Severity",
              value: alert.severity.toUpperCase(),
              short: true,
            },
            { title: "Type", value: alert.type, short: true },
            { title: "Message", value: alert.message, short: false },
          ],
          timestamp: Math.floor(alert.timestamp.getTime() / 1000),
        },
      ],
    };

    await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  }
}
```

## Best Practices

### 1. Metric Collection

- Collect metrics at regular intervals
- Use appropriate time windows for different metrics
- Implement proper error handling and retries

### 2. Performance Optimization

- Cache frequently accessed metrics
- Use batch processing for multiple domains
- Implement rate limiting for API calls

### 3. Alerting Strategy

- Set appropriate thresholds based on historical data
- Implement alert fatigue prevention
- Use escalation policies for critical issues

### 4. Data Retention

- Archive historical data appropriately
- Implement data cleanup policies
- Consider storage costs vs. analytical value

## Troubleshooting

### Common Issues

1. **Low Delivery Rates**
   - Check SPF/DKIM/DMARC configuration
   - Review bounce reasons
   - Monitor IP reputation

2. **High Bounce Rates**
   - Validate email lists
   - Check for syntax errors
   - Monitor hard vs. soft bounces

3. **Poor Engagement**
   - Review email content quality
   - Check send timing
   - Analyze audience segmentation

4. **Authentication Failures**
   - Verify DNS records
   - Check key rotation schedules
   - Monitor alignment issues

## Related Documentation

- [DNS Configuration Guide](../infrastructure/dns-setup.md)
- [Email Authentication Guide](../infrastructure/email-auth.md)
- [Domain Types Documentation](../../types/domains/README.md)
- [Analytics Architecture](./README.md)

## External Resources

- [Mailgun Analytics API](https://documentation.mailgun.com/en/latest/api-stats.html)
- [SendGrid Analytics](https://docs.sendgrid.com/api-reference/stats)
- [Email Deliverability Best Practices](https://www.mailgun.com/blog/email-deliverability-best-practices/)
- [Domain Reputation Monitoring](https://www.validity.com/blog/domain-reputation/)
