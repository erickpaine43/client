import GalleryTab from "@/components/templates/gallery-tab";
import MyTemplatesTab from "@/components/templates/my-templates-tab";
import QuickRepliesTab from "@/components/templates/qucik-replies-tab";
import { Tab, TemplateCategoryType, TemplateUsageLevel } from "@/types";

// Transform userTemplates from components/templates/mocks.ts
// CLEANED UP: Removed stored rates - use TemplateAnalyticsService for analytics
const transformedUserTemplates = [
  {
    id: 1,
    name: "Initial CEO Outreach",
    subject: "Quick question about {Company}'s growth strategy",
    content: "Hi {First Name},\n\nI hope this email finds you well...",
    category: "OUTREACH",
    folderId: 1,
    usage: 150,
    // CLEANED UP: Removed stored rates - calculate on-demand using AnalyticsCalculator
    lastUsed: "5 hours ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 2,
    name: "SaaS Introduction",
    subject: "Introduction to {Company} regarding our SaaS solution",
    content: "Hi {First Name},\n\nI wanted to briefly introduce our SaaS solution...",
    category: "INTRODUCTION",
    folderId: 1,
    usage: 89,
    // CLEANED UP: Removed stored rates
    lastUsed: "1 day ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 3,
    name: "Follow-up After No Response",
    subject: "Following up on {Previous Email Subject}",
    content: "Hi {First Name},\n\nI'm just following up on my previous email...",
    category: "FOLLOW_UP",
    folderId: 2,
    usage: 67,
    // CLEANED UP: Removed stored rates
    lastUsed: "2 days ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 4,
    name: "Meeting Request",
    subject: "Meeting request to discuss {Topic}",
    content: "Hi {First Name},\n\nI'd like to schedule a brief meeting to discuss...",
    category: "MEETING",
    folderId: 1,
    usage: 43,
    // CLEANED UP: Removed stored rates
    lastUsed: "3 days ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 5,
    name: "Case Study Share",
    subject: "Case study: {Company} achieved X with our solution",
    content: "Hi {First Name},\n\nI thought you might be interested in this case study...",
    category: "VALUE",
    folderId: 1,
    usage: 38,
    // CLEANED UP: Removed stored rates
    lastUsed: "4 days ago",
    isStarred: true,
    type: "template",
  },
  {
    id: 6,
    name: "Closing the Loop",
    subject: "Closing the loop on {Previous Conversation}",
    content: "Hi {First Name},\n\nSince I haven't heard back, I'm closing the loop on this...",
    category: "FOLLOW_UP",
    folderId: 2,
    usage: 25,
    // CLEANED UP: Removed stored rates
    lastUsed: "1 week ago",
    isStarred: false,
    type: "template",
  },
];

// Transform builtInTemplates from components/templates/mocks.ts
// CLEANED UP: Removed stored rates from built-in templates
const transformedBuiltInTemplates = [
  {
    id: 7,
    name: "SaaS Demo Request",
    subject: "Quick demo of {Product} for {Company}?",
    content: "Hello {First Name},\n\nI noticed that {Company} has been...",
    category: "SAAS",
    folderId: 7,
    usage: 847,
    // CLEANED UP: Removed stored rates
    lastUsed: "2 hours ago",
    isStarred: true,
    type: "template",
  },
  {
    id: 8,
    name: "Agency Introduction",
    subject: "Unlocking Growth for {Company} with Expert Agency Services",
    content: "Hi {First Name},\n\nI trust this message finds you well...",
    category: "AGENCY",
    folderId: 8,
    usage: 624,
    // CLEANED UP: Removed stored rates
    lastUsed: "3 hours ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 9,
    name: "Consultant Value Prop",
    subject: "Driving Measurable Results for {Company} as a Consultant",
    content: "Hi {First Name},\n\nI hope this email reaches you in good spirits...",
    category: "CONSULTING",
    folderId: 9,
    usage: 734,
    // CLEANED UP: Removed stored rates
    lastUsed: "4 hours ago",
    isStarred: true,
    type: "template",
  },
  {
    id: 10,
    name: "E-commerce Partnership",
    subject: "Exploring Partnership Synergies for {Company} in E-commerce",
    content: "Hi {First Name},\n\nI am reaching out to explore potential synergies...",
    category: "ECOMMERCE",
    folderId: 10,
    usage: 198,
    // CLEANED UP: Removed stored rates
    lastUsed: "2 days ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 11,
    name: "Real Estate Investor",
    subject: "Exclusive Real Estate Investment Opportunities for {Company}",
    content: "Hi {First Name},\n\nI am excited to share some exclusive real estate...",
    category: "REAL_ESTATE",
    folderId: 11,
    usage: 312,
    // CLEANED UP: Removed stored rates
    lastUsed: "1 day ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 12,
    name: "Recruitment Outreach",
    subject: "Connecting Talent with Opportunity at {Company}",
    content: "Hi {First Name},\n\nI hope this message finds you well...",
    category: "HR",
    folderId: 12,
    usage: 892,
    // CLEANED UP: Removed stored rates
    lastUsed: "1 hour ago",
    isStarred: true,
    type: "template",
  },
  {
    id: 13,
    name: "Financial Services",
    subject: "Securing Your Financial Future with Expert Services at {Company}",
    content: "Hi {First Name},\n\nI am reaching out to introduce our comprehensive...",
    category: "FINANCE",
    folderId: 13,
    usage: 156,
    // CLEANED UP: Removed stored rates
    lastUsed: "3 days ago",
    isStarred: false,
    type: "template",
  },
  {
    id: 14,
    name: "Healthcare Solution",
    subject: "Revolutionizing Healthcare with Innovative Solutions for {Company}",
    content: "Hi {First Name},\n\nI am excited to present our cutting-edge healthcare...",
    category: "HEALTHCARE",
    folderId: 14,
    usage: 267,
    // CLEANED UP: Removed stored rates
    lastUsed: "5 hours ago",
    isStarred: false,
    type: "template",
  },
];

export const initialFolders = [
  {
    id: 1,
    name: "Cold Outreach",
    type: "template",
    templateCount: 2,
    isExpanded: true,
    children: [
      transformedUserTemplates[0], // Initial CEO Outreach
      transformedUserTemplates[1], // SaaS Introduction
    ],
  },
  {
    id: 2,
    name: "Follow-ups",
    type: "template",
    templateCount: 2,
    isExpanded: true,
    children: [
      transformedUserTemplates[2], // Follow-up After No Response
      transformedUserTemplates[5], // Closing the Loop
    ],
  },
  {
    id: 3,
    name: "Meeting Requests",
    type: "template",
    templateCount: 2,
    isExpanded: true,
    children: [
      transformedUserTemplates[3], // Meeting Request
      transformedUserTemplates[4], // Case Study Share
    ],
  },
  {
    id: 7,
    name: "SaaS Solutions",
    type: "template",
    templateCount: 1,
    isExpanded: true,
    children: [
      transformedBuiltInTemplates[0], // SaaS Demo Request
    ],
  },
  {
    id: 8,
    name: "Agency Templates",
    type: "template",
    templateCount: 1,
    isExpanded: false,
    children: [
      transformedBuiltInTemplates[1], // Agency Introduction
    ],
  },
  {
    id: 9,
    name: "Consulting",
    type: "template",
    templateCount: 1,
    isExpanded: false,
    children: [
      transformedBuiltInTemplates[2], // Consultant Value Prop
    ],
  },
  {
    id: 10,
    name: "E-commerce",
    type: "template",
    templateCount: 1,
    isExpanded: false,
    children: [
      transformedBuiltInTemplates[3], // E-commerce Partnership
    ],
  },
  {
    id: 11,
    name: "Real Estate",
    type: "template",
    templateCount: 1,
    isExpanded: false,
    children: [
      transformedBuiltInTemplates[4], // Real Estate Investor
    ],
  },
  {
    id: 12,
    name: "HR & Recruitment",
    type: "template",
    templateCount: 1,
    isExpanded: false,
    children: [
      transformedBuiltInTemplates[5], // Recruitment Outreach
    ],
  },
  {
    id: 13,
    name: "Finance",
    type: "template",
    templateCount: 1,
    isExpanded: false,
    children: [
      transformedBuiltInTemplates[6], // Financial Services
    ],
  },
  {
    id: 14,
    name: "Healthcare",
    type: "template",
    templateCount: 1,
    isExpanded: false,
    children: [
      transformedBuiltInTemplates[7], // Healthcare Solution
    ],
  },
  {
    id: 5,
    name: "Common Responses",
    type: "quick-reply",
    templateCount: 2,
    isExpanded: true,
    children: [
      {
        id: 4,
        name: "Thanks for your interest",
        subject: "",
        content: "Thanks for your interest! I'll send over more details shortly.",
        category: "Quick Replies",
        folderId: 5,
        usage: 234,
        // CLEANED UP: Removed stored rates (quick replies don't have open/reply rates)
        lastUsed: "3 hours ago",
        isStarred: false,
        type: "quick-reply",
      },
      {
        id: 5,
        name: "Schedule a call",
        subject: "",
        content: "I'd be happy to schedule a quick call to discuss this further. What does your calendar look like next week?",
        category: "Quick Replies",
        folderId: 5,
        usage: 189,
        // CLEANED UP: Removed stored rates (quick replies don't have open/reply rates)
        lastUsed: "5 hours ago",
        isStarred: true,
        type: "quick-reply",
      },
    ],
  },
  {
    id: 6,
    name: "Objection Handling",
    type: "quick-reply",
    templateCount: 0,
    isExpanded: true,
    children: [],
  },
];
// Categories and usage tracking from components/templates/mocks.ts
export const categories: TemplateCategoryType[] = [
  "OUTREACH",
  "INTRODUCTION",
  "FOLLOW_UP",
  "MEETING",
  "VALUE",
  "SAAS",
  "AGENCY",
  "CONSULTING",
  "ECOMMERCE",
  "REAL_ESTATE",
  "HR",
  "FINANCE",
  "HEALTHCARE",
];

export function getTemplateUsage(templateId: number): TemplateUsageLevel {
  // Simple algorithm based on template ID for mock data
  const usageMap: Record<number, TemplateUsageLevel> = {
    7: "high", // SaaS Demo Request
    8: "medium", // Agency Introduction
    9: "high", // Consultant Value Prop
    10: "low", // E-commerce Partnership
    11: "medium", // Real Estate Investor
    12: "high", // Recruitment Outreach
    13: "low", // Financial Services
    14: "medium", // Healthcare Solution
  };

  return usageMap[templateId] || "low";
}

export const initialQuickReplies = initialFolders
  .flatMap((folder) => folder.children)
  .filter((child) => child.type === "quick-reply");
export const initialTemplates = initialFolders
  .flatMap((folder) => folder.children)
  .filter((child) => child.type === "template");


export const tabs: Tab[] = [
  {
    id: "quick-replies",
    label: "Quick Replies",
    count: initialQuickReplies.length,
    Component: QuickRepliesTab,
  },
  {
    id: "templates",
    label: "My Templates",
    count: initialTemplates.length,
    Component: MyTemplatesTab,
  },
  {
    id: "magic",
    label: "Magic",
    count: 0,
    Component: GalleryTab,
  },
];

