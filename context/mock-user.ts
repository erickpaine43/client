import { NileDBUser } from "@/types";

export const profileMockData: NileDBUser = {
  id: "user_12345",
  email: "eric.ferreyra@penguinmail.com",
  name: "Eric Ferreyra",
  givenName: "Eric",
  familyName: "Ferreyra",
  picture: "https://example.com/avatar/eric.jpg",
  created: "2024-08-15T10:30:00.000Z",
  updated: "2025-10-22T15:00:00.000Z",
  emailVerified: true,
  profile: {
    userId: "user_12345",
    role: "super_admin",
    isPenguinMailsStaff: true,
    preferences: {
      language: "es",
      timezone: "America/Argentina/Buenos_Aires",
      notificationsEnabled: true,
      theme: "dark",
    },
    lastLoginAt: new Date("2025-10-21T23:45:00.000Z"),
    createdAt: new Date("2024-08-15T10:30:00.000Z"),
    updatedAt: new Date("2025-10-22T15:00:00.000Z"),
  },
  tenants: ["tenant_001", "tenant_002"],
};
