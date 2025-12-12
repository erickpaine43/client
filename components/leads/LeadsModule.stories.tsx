import type { Meta, StoryObj } from "@storybook/nextjs";
import MigratedContactsTab from "./components/MigratedContactsTab";
import ContactsTab from "./components/ContactsTab"; // Legacy component
import { sampleLeads } from "@/lib/data/leads";

/**
 * Visual Verification for Leads Module Migration.
 * 
 * This story demonstrates the side-by-side comparison between:
 * - ❌ Legacy ContactsTab (Original)
 * - ✅ MigratedContactsTab (New Design System Implementation)
 * 
 * Goal: Ensure visual parity and functional equivalence before swapping in production.
 */
const meta: Meta = {
  title: "Modules/Leads/Migration Verification",
  component: MigratedContactsTab,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
### Leads Module Migration

This documentation shows the migration progress of the Leads Module.

**Components Replaced:**
- Tables -> UnifiedDataTable
- Filters -> UnifiedFilterBar + MigratedLeadsFilter
- Forms -> UnifiedFormField

**Status:** Ready for Review
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof MigratedContactsTab>;

export const SideBySideComparison: Story = {
  render: () => (
    <div className="space-y-12">
      {/* 1. Legacy Component */}
      <section>
        <div className="mb-4 bg-muted/30 p-4 border rounded-lg">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <span className="text-red-500">❌</span> Legacy Implementation
          </h3>
          <p className="text-sm text-muted-foreground">
            Original component using manual tables and inline filters.
          </p>
        </div>
        
        <div className="border rounded-xl p-6 bg-background shadow-sm">
           <ContactsTab /> 
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-dashed border-primary/30" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Migration Boundary
          </span>
        </div>
      </div>

      {/* 2. Migrated Component */}
      <section>
        <div className="mb-4 bg-green-50 dark:bg-green-900/10 p-4 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                <span className="text-green-500">✅</span> Migrated Implementation
            </h3>
            <p className="text-sm text-muted-foreground">
                New component using <code>UnifiedDataTable</code>, <code>UnifiedFilterBar</code>, and Design System tokens.
            </p>
        </div>

        <div className="border rounded-xl p-6 bg-background shadow-sm ring-2 ring-green-500/10">
           <MigratedContactsTab />
        </div>
      </section>
    </div>
  )
};

export const MigratedOnly: Story = {
  render: () => <MigratedContactsTab />
};

export const LegacyOnly: Story = {
  render: () => <ContactsTab />
};
