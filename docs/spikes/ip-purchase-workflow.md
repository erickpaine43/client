markdown
# IP Purchase and Tracking Workflow Spike

## Overview

This spike investigates the current IP purchase process through Hostwinds VPS provisioning and proposes an automated workflow integrated with our Convex backend and existing reputation management system.

## Business Context

PenguinMails requires dedicated IP addresses for SMTP servers to maintain 95%+ email deliverability rates - a core business metric for cold email success. The current manual process creates scalability bottlenecks for clients sending 10K+ emails monthly.

## Current Architecture Analysis

### Existing Hostwinds Integration

The project already has functional Terraform scripts for Hostwinds VPS management:

```terraform
# ./scripts/terraform/add-instance/main.tf
resource "terracurl_request" "add_instance" {
  url    = "https://clients.hostwinds.com/cloud/api.php"
  method = "POST"
  request_body = format("action=add_instance&template=%s&rid=%d&qty=1&keys[]=%s&srvrname=%s&billingcycle=%s&location_id=%d&API=%s", 
    urlencode(var.template), var.rid, urlencode(var.ssh_key_name), 
    urlencode(var.server_name), var.billingcycle, var.location_id, urlencode(var.API))
}
Configuration Requirements
terraform
# ./scripts/terraform/add-instance/variables.tf
variable "API" {
  description = "Your Hostwinds API key"
  type        = string
  sensitive   = true
}

variable "template" {
  description = "Template UUID for VPS"
  type        = string
}

variable "rid" {
  description = "Resource ID from get_price_list"
  type        = number
}

variable "location_id" {
  description = "Location ID from get_locations"
  type        = number
}

variable "server_name" {
  description = "Name of VPS instance"
  type        = string
  default     = "TerraformVPS"
}

variable "billingcycle" {
  description = "Billing cycle"
  type        = string
  default     = "monthly"

  validation {
    condition     = contains(["hourly", "monthly"], var.billingcycle)
    error_message = "Allowed values for billingcycle are \"hourly\" or \"monthly\"."
  }
}
Reputation Management UI
The application already includes reputation tracking components:

tsx
// ./app/[locale]/dashboard/(domains&ips)/domains/[domainId]/accounts/[accountId]/content.tsx
<div className="text-2xl font-bold">{reputation}%</div>
<CardTitle>{t.reputationGrowth}</CardTitle>
<LineChart dataKey="reputation" />
Problem Statement
The current IP provisioning process is manual and disconnected from our core analytics platform:

Manual Execution: Terraform scripts require manual operation

No Lifecycle Tracking: IP assignments not tracked in Convex database

UI Disconnect: Reputation dashboard exists but lacks automated data integration

Resource Waste: No automated cleanup of unused IP addresses

Proposed Solution
Schema Extension
typescript
// convex/schema.ts - Add to existing schema
ipPurchases: defineTable({
  companyId: v.string(),
  userId: v.string(),
  status: v.union(
    v.literal('requested'),
    v.literal('confirmed'),
    v.literal('purchasing'),
    v.literal('assigned'),
    v.literal('releasing'),
    v.literal('released')
  ),
  hostwindsConfig: v.object({
    template: v.string(),
    resourceId: v.number(),
    locationId: v.number(),
    billingCycle: v.string(),
  }),
  reputationScore: v.optional(v.number()),
  domainId: v.optional(v.string()),
})
.index("by_company_status", ["companyId", "status"])
Workflow Integration
text
User Request → Convex Mutation → Terraform Execution → IP Assignment → Reputation Tracking
Implementation Roadmap
Phase 1: Core Tracking (1.5 weeks)
Implement ipPurchases table in Convex schema

Create basic mutations for IP lifecycle

Integrate with existing Terraform scripts

Phase 2: Automation Engine (1 week)
Async job processing for Terraform execution

Error handling and retry logic

Health monitoring system

Phase 3: UI Integration (1 week)
Connect with existing reputation dashboard

IP management interface

Automated reporting

Risks and Mitigations
Technical Risks
Hostwinds API rate limits: Queue system with exponential backoff

Terraform execution failures: Error handling with manual override

Business Risks
Deliverability impact: Staging testing before production

Cost management: Auto-cleanup of unused IPs

Recommendations
Approve Implementation - Foundation exists with working Terraform scripts

Start with Phase 1 - Basic tracking to unblock automation

Leverage existing investment - No reinvention required

Success Metrics
IP provisioning time: <10 minutes (from hours)

Maintain 95%+ deliverability rate SLA

30% reduction in unused IP costs

50% increase in client onboarding capacity

Next Steps
Technical review with engineering team

Sprint planning for Phase 1 implementation

Integration testing with existing systems
