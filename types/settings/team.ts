import { z } from "zod";
import type { BaseEntity, ActionResult } from "./base";

// ============================================================================
// TEAM TYPES
// ============================================================================

// Team Member
export interface TeamMember extends BaseEntity {
  name: string;
  email: string;
  role: "Admin" | "Outreach Manager" | "Analyst" | "Member";
  status: "active" | "inactive" | "pending";
  lastActive: Date;
  permissions: string[];
  avatar?: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Team Member Schema
export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["Admin", "Outreach Manager", "Analyst", "Member"]),
  permissions: z.array(z.string()).default([]),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type TeamMembersResponse = ActionResult<TeamMember[]>;
export type TeamMemberResponse = ActionResult<TeamMember>;
export type DeleteTeamMemberResponse = ActionResult<void>;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface TeamSettingsProps {
  members: TeamMember[];
  onAddMember: (member: Omit<TeamMember, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  onRemoveMember: (id: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Partial update types for server actions
export type TeamMemberUpdate = Partial<Omit<TeamMember, "id" | "createdAt" | "updatedAt">>;

// Create types for new entities
export type CreateTeamMember = Omit<TeamMember, "id" | "createdAt" | "updatedAt">;
