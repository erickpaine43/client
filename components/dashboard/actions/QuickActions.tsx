import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, Plus, Upload } from "lucide-react";
import Link from "next/link";
function QuickActions() {
  const btnStyle =
    "w-full justify-start h-fit gap-3 p-3 text-left hover:bg-accent rounded-lg";

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-foreground">Quick Actions</h3>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3">
        <Button variant="ghost" size="icon" className={btnStyle} asChild>
          <Link href="/dashboard/campaigns/create">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-foreground">Create Campaign</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className={btnStyle} asChild>
          <Link href="/dashboard/leads">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium text-foreground">Upload Leads</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className={btnStyle} asChild>
          <Link href="/dashboard/domains/new">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium text-foreground">Add Domain</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
export default QuickActions;
