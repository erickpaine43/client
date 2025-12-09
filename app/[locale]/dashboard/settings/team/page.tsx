import TeamMembersTable from "@/components/settings/team/team-members-table";
import { Card, CardContent } from "@/components/ui/card";

// Force dynamic rendering to prevent SSR issues with analytics dependencies
export const dynamic = "force-dynamic";

function page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-gray-600 dark:text-muted-foreground">
          Manage your team members and their roles
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TeamMembersTable />
        </CardContent>
      </Card>
    </div>
  );
}
export default page;
