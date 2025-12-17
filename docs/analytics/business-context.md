# Analytics System Refactoring: Proposal for Business Review

## 1. Executive Summary

Our current analytics system has developed organically, leading to scattered logic, inconsistent data definitions, and a heavy reliance on mock data. This makes it difficult to maintain, scale, and trust the accuracy of our metrics. 

This document proposes a comprehensive refactoring of the analytics system to a **scalable, domain-driven architecture**. This new architecture will provide a single source of truth for all analytics data, improve performance, and lay a solid foundation for future features. 

We are seeking business approval on the proposed architecture and a standardized set of key performance indicators (KPIs) to ensure the new system meets the needs of the business and our users.

## 2. Current Situation: A Fragmented System

Our recent audit of the codebase revealed several critical issues with the current analytics implementation:

-   **Scattered Logic**: Analytics calculations are spread across at least four different server action files. There is no central place for analytics, which means the same metric (e.g., "open rate") may be calculated differently in different parts of the application.
-   **Inconsistent Data**: We have found at least four different and conflicting definitions for what a "campaign performance" metric is. This lack of a standard definition makes it impossible to ensure data consistency.
-   **Analytics Mixed with Core Business Objects**: Analytics data is frequently mixed into our core data structures for campaigns, domains, and mailboxes. This creates unnecessary complexity and makes it harder to manage our core business logic.
-   **Reliance on Mock Data**: The system is heavily dependent on mock data, which makes it difficult to transition to a live, production-ready analytics system.

These issues lead to a system that is difficult to maintain, prone to errors, and not scalable.

## 3. The Proposed Solution: A Scalable, Domain-Driven Architecture

We propose to refactor the analytics system based on the principles of **Domain-Driven Design**. This means we will separate analytics concerns by domain (campaigns, domains, mailboxes, etc.) into their own dedicated services.

This new architecture will feature:

-   **Centralized Domain Services**: Each domain (e.g., Campaign Analytics, Domain Analytics) will have its own service responsible for all its related data and calculations. This eliminates scattered logic.
-   **A Single Source of Truth**: We will establish a standardized, canonical definition for every analytics metric.
-   **Separation of Concerns**: Analytics data will be separated from core business objects, leading to a cleaner and more maintainable codebase.
-   **Scalable Data Storage**: We will use a hybrid database strategy (OLTP for transactional data, OLAP for analytics logs) to ensure performance and cost-effectiveness as we scale.

This approach will result in a more robust, reliable, and scalable analytics system that can grow with our business.

## 4. Key Conflicts to Resolve & Decisions Needed

To move forward, we need business input on the following conflicts we've identified:

1.  **Conflicting Definitions of "Campaign Performance"**: We have multiple, inconsistent data structures for campaign analytics. 
    -   **Proposal**: We will standardize on a single, flat `CampaignPerformanceMetrics` structure as defined in our technical design. This will become the single source of truth for campaign analytics.
    -   **Action Required**: Please confirm that the proposed standardized metrics below are correct and complete.

2.  **Inconsistent Calculation Methods**: Metrics like "open rate" and "click rate" are calculated inconsistently throughout the codebase.
    -   **Proposal**: We will centralize all calculation logic within the new domain services to ensure that every metric is calculated the same way, every time.
    -   **Action Required**: Please review and approve the proposed standardized metric definitions below.

## 5. Proposed Standardized Metrics for Approval

We propose to standardize on the following set of key performance indicators (KPIs) across all relevant domains. Please review and confirm that this list aligns with business requirements.

### Core Performance Metrics:

-   **Emails Sent**: Total number of emails sent.
-   **Emails Delivered**: Total number of emails successfully delivered.
-   **Opens**: Number of unique opens.
-   **Clicks**: Number of unique clicks.
-   **Replies**: Number of unique replies.
-   **Bounces**: Number of bounced emails.
-   **Unsubscribes**: Number of users who unsubscribed.
-   **Spam Complaints**: Number of spam complaints.

### Calculated Rate Metrics:

-   **Delivery Rate**: (Delivered / Sent) * 100
-   **Open Rate**: (Opens / Delivered) * 100
-   **Click Rate**: (Clicks / Delivered) * 100
-   **Reply Rate**: (Replies / Delivered) * 100
-   **Bounce Rate**: (Bounces / Sent) * 100

### Domain & Mailbox Health Metrics:

-   **Domain Health / Reputation**: A score representing the health of a sending domain.
-   **Mailbox Warmup Analytics**: Metrics related to the warmup process (e.g., progress, emails sent, replies received).

**Action Required**: Please confirm if this is the complete and correct set of metrics you want to track and display to users.

## 6. Next Steps

Upon approval of this proposal, the development team will begin the refactoring process, which will involve:

1.  Implementing the new domain-driven architecture with centralized services.
2.  Consolidating all analytics logic into the new services.
3.  Updating the UI to consume data from the new analytics services.
4.  Removing the old, scattered analytics logic and type definitions.

We are confident that this refactoring will result in a significantly improved analytics system that will better serve our users and the business.
