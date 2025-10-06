# Convex Admin Functions

This directory contains Convex functions for admin operations, implementing audit logging, session management, and system monitoring with real-time capabilities.

## 📁 File Structure

```
convex/
├── schema.ts                    # Convex schema with admin tables
├── adminAudit.ts                # Admin audit logging and session management
├── adminEvents.ts               # System events and monitoring
├── index.ts                     # API exports and documentation
└── README.md                    # This file
```

## 🎯 Purpose & Architecture

### Admin Data Separation Strategy

Convex is used specifically for **admin operations** to ensure:
- **Cross-tenant admin access** without compromising business data isolation
- **Audit compliance** with detailed admin action tracking
- **Session management** for secure admin authentication
- **Performance isolation** - admin operations don't impact user-facing performance
- **Security boundaries** - admin data has different access patterns than business data

### Integration with NileDB

- **Business Data**: Stored in NileDB (users, companies, campaigns, billing, etc.)
- **Admin Metadata**: Stored in Convex (audit logs, sessions, system events)
- **Admin User Data**: Stored in NileDB user_profiles (isPenguinmailsStaff, roles, status)

## 🚀 Key Features

### ✅ Comprehensive Audit Logging

- Complete admin action tracking (user changes, company updates, billing modifications)
- Automatic session management with activity monitoring
- Security event logging with configurable severity levels
- Cross-tenant audit trails for compliance

### ✅ Real-time Admin Monitoring

- Live admin session tracking
- Real-time security alerts
- System event monitoring with severity filtering
- Performance isolation for admin operations

### ✅ Secure Admin Authentication

- Session-based admin authentication
- Automatic session expiration and cleanup
- Failed attempt logging and monitoring
- Integration with NileDB user profiles for role verification

## 📊 Core Admin Functions

### Admin Audit Logging (`adminAudit.ts`)

#### Session Management

```typescript
// Create admin session
createAdminSession(adminUserId, sessionToken, ipAddress, userAgent, deviceInfo?)

// Update session activity
updateAdminSessionActivity(sessionId, ipAddress, userAgent)

// End admin session
endAdminSession(sessionId, adminUserId, ipAddress, userAgent)
```

#### Audit Logging

```typescript
// Log admin action
logAdminAction(adminUserId, action, resourceType, resourceId, changes, metadata)

// Get recent admin activity
getRecentAdminActivity(limit?)

// Get admin activity for specific user
getAdminUserActivity(adminUserId, limit?)

// Get admin activity for specific resource
getResourceAdminActivity(resourceType, resourceId, limit?)

// Get admin activity by tenant
getTenantAdminActivity(tenantId, limit?)
```

### System Events (`adminEvents.ts`)

#### Event Management

```typescript
// Log system event
logSystemEvent(eventType, severity, message, details?, adminUserId?, tenantId?)

// Log security alert
logSecurityAlert(message, details, adminUserId?, tenantId?)

// Log configuration change
logConfigChange(message, details, adminUserId)
```

#### Event Monitoring

```typescript
// Get system events with filters
getSystemEvents(eventType?, severity?, resolved?, limit?)

// Get recent security alerts
getRecentSecurityAlerts(limit?)

// Get unresolved critical events
getUnresolvedCriticalEvents()

// Get system health summary
getSystemHealthSummary()

// Resolve system event
resolveSystemEvent(eventId, resolution, resolvedBy)

// Clean up old resolved events
cleanupOldEvents()
```

## 🔧 Usage Examples

### Admin Session Management

```typescript
import { api } from "./convex/_generated/api";

// Create admin session when user logs in
const sessionId = await convex.mutation(api.adminAudit.createAdminSession, {
  adminUserId: "user-123",
  sessionToken: "session-token-abc",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  deviceInfo: {
    browser: "Chrome",
    os: "macOS",
    device: "Desktop"
  }
});

// Update session activity
await convex.mutation(api.adminAudit.updateAdminSessionActivity, {
  sessionId,
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0..."
});

// End session when user logs out
await convex.mutation(api.adminAudit.endAdminSession, {
  sessionId,
  adminUserId: "user-123",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0..."
});
```

### Admin Audit Logging

```typescript
// Log admin action (user status change)
await convex.mutation(api.adminAudit.logAdminAction, {
  adminUserId: "admin-123",
  action: "user_status_change",
  resourceType: "user",
  resourceId: "user-456",
  tenantId: "tenant-789",
  oldValues: { status: "active" },
  newValues: { status: "suspended" },
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  notes: "User suspended for policy violation",
  metadata: { reason: "spam_complaints", duration: "7_days" }
});

// Get recent admin activity
const recentActivity = await convex.query(api.adminAudit.getRecentAdminActivity, {
  limit: 50
});

recentActivity.forEach(activity => {
  console.log(`${activity.adminUserId} performed ${activity.action} on ${activity.resourceType} ${activity.resourceId}`);
});
```

### System Event Monitoring

```typescript
// Log security alert
await convex.mutation(api.adminEvents.logSecurityAlert, {
  message: "Multiple failed login attempts",
  details: {
    ipAddress: "192.168.1.100",
    failedAttempts: 5,
    targetUser: "user-123"
  },
  adminUserId: "admin-123",
  tenantId: "tenant-789"
});

// Get system health summary
const healthSummary = await convex.query(api.adminEvents.getSystemHealthSummary);

console.log(`System Health:`);
console.log(`- Total Events (24h): ${healthSummary.total}`);
console.log(`- Critical Events: ${healthSummary.critical}`);
console.log(`- Unresolved Issues: ${healthSummary.unresolved}`);

// Get unresolved critical events
const criticalEvents = await convex.query(api.adminEvents.getUnresolvedCriticalEvents);

criticalEvents.forEach(event => {
  console.log(`🚨 CRITICAL: ${event.message} (${event.eventType})`);
});
```

### Admin Dashboard Data

```typescript
// Get active admin sessions
const activeSessions = await convex.query(api.adminAudit.getActiveAdminSessions);

console.log(`Active admin sessions: ${activeSessions.length}`);
activeSessions.forEach(session => {
  console.log(`- ${session.adminUserId} from ${session.ipAddress} (${session.deviceInfo?.browser})`);
});

// Get recent security alerts
const securityAlerts = await convex.query(api.adminEvents.getRecentSecurityAlerts, {
  limit: 10
});

securityAlerts.forEach(alert => {
  console.log(`🔐 ALERT: ${alert.message} (${alert.timestamp})`);
});
```

## 🔄 Real-time Admin Monitoring

### React Hook Example

```typescript
import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";

function AdminDashboard() {
  // Real-time active admin sessions
  const activeSessions = useQuery(api.adminAudit.getActiveAdminSessions);

  // Real-time system health
  const systemHealth = useQuery(api.adminEvents.getSystemHealthSummary);

  // Real-time recent admin activity
  const recentActivity = useQuery(api.adminAudit.getRecentAdminActivity, {
    limit: 20
  });

  if (!activeSessions || !systemHealth || !recentActivity) {
    return <div>Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="health-summary">
        <h3>System Health (24h)</h3>
        <p>Total Events: {systemHealth.total}</p>
        <p>Critical Issues: {systemHealth.critical}</p>
        <p>Unresolved: {systemHealth.unresolved}</p>
      </div>

      <div className="active-sessions">
        <h3>Active Admin Sessions ({activeSessions.length})</h3>
        {activeSessions.map(session => (
          <div key={session._id} className="session-item">
            <span>{session.adminUserId}</span>
            <span>{session.ipAddress}</span>
            <span>{session.deviceInfo?.browser}</span>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h3>Recent Admin Activity</h3>
        {recentActivity.map(activity => (
          <div key={activity._id} className="activity-item">
            <span>{activity.adminUserId}</span>
            <span>{activity.action}</span>
            <span>{activity.resourceType}: {activity.resourceId}</span>
            <span>{new Date(activity.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 📈 Performance Considerations

### Indexing Strategy

- **Audit Logs**: `adminUserId`, `resourceType_tenantId`, `timestamp` for efficient admin activity queries
- **Sessions**: `adminUserId`, `isActive`, `expiresAt` for session management and cleanup
- **System Events**: `eventType`, `severity`, `timestamp` for monitoring and alerting

### Security-First Design

- All admin operations require proper authentication
- Audit logging captures all admin actions for compliance
- Session management with automatic expiration
- Cross-tenant operations while maintaining data security

### Query Optimization

- Use specific filters to limit audit log retrieval
- Implement pagination for large activity datasets
- Real-time subscriptions for live admin monitoring
- Efficient cleanup processes for old audit data

## 🔐 Security Features

### Audit Trail Compliance

```typescript
// Every admin action is automatically logged
await convex.mutation(api.adminAudit.logAdminAction, {
  adminUserId: "admin-123",
  action: "user_status_change",
  resourceType: "user",
  resourceId: "user-456",
  oldValues: { status: "active" },
  newValues: { status: "suspended" },
  ipAddress: request.ip,
  userAgent: request.headers.get("user-agent"),
  notes: "Security violation suspension",
  metadata: { violation_type: "policy_breached", severity: "high" }
});
```

### Session Security

```typescript
// Automatic session management
const sessionId = await convex.mutation(api.adminAudit.createAdminSession, {
  adminUserId: userId,
  sessionToken: generateSecureToken(),
  ipAddress: getClientIP(request),
  userAgent: request.headers.get("user-agent"),
  deviceInfo: detectDeviceInfo(request)
});

// Sessions auto-expire and are tracked
setInterval(() => {
  convex.mutation(api.adminAudit.updateAdminSessionActivity, {
    sessionId,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent")
  });
}, 5 * 60 * 1000); // Every 5 minutes
```

## 🚨 Important Notes

1. **Admin Authentication Required**: All functions require valid admin session
2. **Comprehensive Audit Logging**: Every admin action is automatically logged
3. **Cross-Tenant Operations**: Admin functions can access data across all tenants
4. **Real-time Monitoring**: Live updates for security events and admin activity
5. **Data Retention**: Audit logs kept for 7 years per compliance requirements
6. **Session Management**: Automatic cleanup of expired admin sessions
7. **Security First**: All operations validate permissions and log activities

## 🔄 Admin System Integration

### Integration with NileDB Admin Users

Admin functions work alongside NileDB's user management:

```typescript
// Admin verification flow
// 1. Check if user has admin privileges in NileDB
const userData = await nileDb.query(
  "SELECT profile FROM users WHERE id = $1",
  [userId]
);

if (!userData.profile?.isPenguinmailsStaff) {
  throw new Error("Admin access required");
}

// 2. Use Convex for admin operations
await convex.mutation(api.adminAudit.createAdminSession, {
  adminUserId: userId,
  // ... session data
});
```

### Cross-System Admin Authentication

```typescript
// Complete admin auth flow
import { verifyAdminAccess } from "@/lib/auth/adminAuth";

const adminResult = await verifyAdminAccess(userId);

if (adminResult.isAuthorized) {
  // Create Convex admin session
  const sessionId = await convex.mutation(api.adminAudit.createAdminSession, {
    adminUserId: userId,
    sessionToken: generateSecureToken(),
    ipAddress: request.ip,
    userAgent: request.headers.get("user-agent")
  });

  return { sessionId, role: adminResult.role };
}
```

## 🛡️ Compliance & Security

### Audit Compliance

- **GDPR Ready**: Admin actions logged with user consent tracking
- **7-Year Retention**: Audit logs retained for compliance requirements
- **Complete Trail**: Every admin action tracked with full context

### Security Monitoring

```typescript
// Automatic security event logging
if (suspiciousActivity) {
  await convex.mutation(api.adminEvents.logSecurityAlert, {
    message: "Suspicious admin activity detected",
    details: {
      activity: suspiciousActivity,
      riskLevel: "high",
      userId: adminUserId,
      ipAddress: request.ip
    },
    adminUserId: adminUserId,
    tenantId: affectedTenant
  });
}
```

This implementation provides a comprehensive admin operations platform with Convex, supporting audit compliance, security monitoring, session management, and cross-tenant administrative capabilities.
