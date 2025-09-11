import { LeadListStatus } from "@/types";

export const leadLists = [
  {
    id: "1",
    name: "Q1 Tech Prospects",
    contacts: 847,
    description: "Technology decision makers and influencers",
  },
  {
    id: "2",
    name: "Enterprise Decision Makers",
    contacts: 1203,
    description: "C-level executives at enterprise companies",
  },
  {
    id: "3",
    name: "SMB Follow-up List",
    contacts: 492,
    description: "Small to medium business prospects",
  },
];

export type LeadList = typeof leadListsData[number];


export const leadsStats = [
  {
    title: "Total Contacts",
    value: "2,542",
    icon: "users",
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "In Campaigns",
    value: "1,847",
    icon: "mail",
    color: "bg-purple-100 text-purple-600",
  },
];

export type LeadStats = typeof leadsStats;


export type LeadList = (typeof leadListsData)[number];
export const leadListsData  = [
  {
    id: 1,
    name: "Q1 Tech Prospects",
    description: "Technology decision makers and influencers",
    contacts: 847,
    status: "used",
    campaign: "Q1 SaaS Outreach",
    uploadDate: "2024-01-15",
    bounced: 24,
    statuse: "active",
    tags: ["enterprise", "tech"],
    performance: { openRate: 34.2, replyRate: 8.6 },
  },
  {
    id: 2,
    name: "Enterprise Decision Makers",
    description: "C-level executives at enterprise companies",
    contacts: 1203,
    status: "being-used",
    campaign: "Enterprise Prospects",
    uploadDate: "2024-01-08",
    bounced: 47,
    statuse: "paused",
    tags: ["enterprise", "c-level"],
    performance: { openRate: 41.7, replyRate: 10.3 },
  },
  {
    id: 3,
    name: "SMB Follow-up List",
    description: "Small to medium business prospects",
    contacts: 492,
    status: "used",
    campaign: "SMB Follow-up",
    uploadDate: "2024-01-01",
    bounced: 14,
    statuse: "completed",
    tags: ["smb", "follow-up"],
    performance: { openRate: 28.9, replyRate: 7.7 },
  },
  {
    id: 4,
    name: "Healthcare Prospects",
    description: "Healthcare industry contacts",
    contacts: 324,
    status: "not-used",
    campaign: null,
    uploadDate: "2024-01-20",
    bounced: 0,
    statuse: "active",
    tags: ["healthcare", "prospects"],
    performance: { openRate: 0, replyRate: 0 },
  },
  {
    id: 5,
    name: "Education Sector List",
    description: "Contacts from educational institutions",
    contacts: 156,
    status: "not-used",
    campaign: null,
    uploadDate: "2024-01-22",
    bounced: 0,
    statuse: "paused",
    tags: ["education", "institutions"],
    performance: { openRate: 0, replyRate: 0 },
  },
];

export const sampleLeads = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp",
    title: "VP of Engineering",
    status: LeadListStatus.USED,
    tags: ["enterprise", "tech", "decision-maker"],
    lastContact: "2024-01-15",
    campaign: "Q1 SaaS Outreach",
    source: "LinkedIn",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@startup.io",
    company: "Startup.io",
    title: "CEO",
    status: LeadListStatus.BEING_USED,
    tags: ["startup", "ceo", "hot-lead"],
    lastContact: "2024-01-14",
    campaign: "Enterprise Prospects",
    source: "Website",
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    email: "lisa@enterprise.com",
    company: "Enterprise Inc",
    title: "Head of Operations",
    status: LeadListStatus.NOT_USED,
    tags: ["enterprise", "operations"],
    lastContact: "2024-01-13",
    campaign: "Q1 SaaS Outreach",
    source: "Cold Email",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david@consulting.com",
    company: "Kim Consulting",
    title: "Managing Partner",
    status: LeadListStatus.BEING_USED,
    tags: ["consulting", "partner"],
    lastContact: "2024-01-12",
    campaign: "SMB Follow-up",
    source: "Referral",
  },
  {
    id: 5,
    name: "Emily Zhang",
    email: "emily@techstart.com",
    company: "TechStart",
    title: "CTO",
    status: LeadListStatus.NOT_USED,
    tags: ["tech", "startup", "cto"],
    lastContact: null,
    campaign: null,
    source: "Conference",
  },
] as const;


export const SAMPLE_CSV_DATA = [
  ["Email Address", "First Name", "Last Name", "Company", "Job Title"],
  ["john.doe@example.com", "John", "Doe", "Example Inc.", "Software Engineer"],
  ["jane.smith@testcorp.com", "Jane", "Smith", "Test Corp.", "Product Manager"],
];

export const campaignLeadsData = [
  ["Email", "Name", "Status", "First Contact", "Campaign"],
  ["jane.doe@softwareco.com", "Jane Doe", "Replied", "2024-01-15", "Software CEOs Outreach"],
  ["john.smith@techstartup.io", "John Smith", "Clicked", "2024-01-16", "Software CEOs Outreach"],
  ["sarah.wilson@cloudtech.com", "Sarah Wilson", "Opened", "2024-01-17", "Software CEOs Outreach"],
  ["mike.brown@salesforce.com", "Mike Brown", "Sent", "2024-01-18", "Software CEOs Outreach"],
  ["emma.davis@datacorp.net", "Emma Davis", "Replied", "2024-01-19", "Software CEOs Outreach"],
  ["alex.johnson@devtools.io", "Alex Johnson", "Clicked", "2024-01-20", "Software CEOs Outreach"],
  ["lisa.garcia@webapps.com", "Lisa Garcia", "Opened", "2024-01-21", "Software CEOs Outreach"],
  ["david.perez@machinelearning.co", "David Perez", "Sent", "2024-01-22", "Software CEOs Outreach"],
  ["anna.lee@analytics.com", "Anna Lee", "Replied", "2024-01-23", "Software CEOs Outreach"],
];

export const mockClients: Client[] = [
  {
    id: 1,
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    notes: "Lead Developer",
    createdAt: new Date(),
    updatedAt: new Date(),
    maskPII: false,
    companyId: 1,
    status: ClientStatus.ACTIVE,
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    notes: "Product Manager",
    createdAt: new Date(),
    updatedAt: new Date(),
    maskPII: false,
    companyId: 1,
    status: ClientStatus.ACTIVE,
  },
  ...Array.from({ length: 50 }, (_, i) => ({
    id: i + 3,
    email: `client${i + 3}@example.com`,
    firstName: `FirstName${i + 3}`,
    lastName: `LastName${i + 3}`,
    createdAt: new Date(2024, 0, i + 1),
    updatedAt: new Date(2024, 0, i + 1),
    notes: `Notes for client ${i + 3}`,
    maskPII: false,
    companyId: 1,
  })),
];

export async function getMockClientsPage(page: number = 1, pageSize: number = 10) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    clients: mockClients.slice(start, end),
    pages: Math.ceil(mockClients.length / pageSize),
  };
}
