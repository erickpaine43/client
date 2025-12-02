import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { 
  iconContainerStyles, 
  iconTextColors, 
  componentPatterns 
} from "@/lib/design-tokens";

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-foreground">Quick Actions</h3>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3">
        <Button variant="ghost" size="icon" className={componentPatterns.actionButton} asChild>
          <Link href="/dashboard/campaigns/create">
            <div className={iconContainerStyles.blue}>
              <Plus className={iconTextColors.blue} />
            </div>
            <span className="font-medium text-foreground">Create Campaign</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className={componentPatterns.actionButton} asChild>
          <Link href="/dashboard/leads">
            <div className={iconContainerStyles.green}>
              <Upload className={iconTextColors.green} />
            </div>
            <span className="font-medium text-foreground">Upload Leads</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className={componentPatterns.actionButton} asChild>
          <Link href="/dashboard/domains/new">
            <div className={iconContainerStyles.purple}>
              <Globe className={iconTextColors.purple} />
            </div>
            <span className="font-medium text-foreground">Add Domain</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
export default QuickActions;
