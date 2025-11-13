import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadList } from "@/lib/data/leads";
import { Eye } from "lucide-react";

const mockListData = {
  totalContacts: 847,
  status: "active",
  campaign: "Q1 SaaS Outreach",
  created: "1/15/2024",
  openRate: "34.2%",
  replyRate: "8.6%",
  bounced: 24,
  tags: ["enterprise", "tech"],
  sampleContacts: [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@techcorp.com",
      company: "TechCorp",
      role: "VP of Engineering",
      status: "sent",
      lastContact: "1/15/2024",
      initials: "SJ",
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@startup.io",
      company: "Startup.io",
      role: "CEO",
      status: "replied",
      lastContact: "1/14/2024",
      initials: "MC",
    },
    {
      id: 3,
      name: "Lisa Rodriguez",
      email: "lisa@enterprise.com",
      company: "Enterprise Inc",
      role: "Head of Operations",
      status: "bounced",
      lastContact: "1/13/2024",
      initials: "LR",
    },
  ],
};

function ShowLeadListItemButton({ list }: { list: LeadList }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-purple-100 text-purple-800";
      case "replied":
        return "bg-blue-100 text-blue-800";
      case "bounced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-muted dark:text-muted-foreground";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-muted-foreground dark:hover:text-foreground"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Contacts in &ldquo;{list.name}&rdquo;</DialogTitle>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            {mockListData.totalContacts} total contacts
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">List Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {mockListData.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Campaign:
                  </span>
                  <span className="text-sm font-medium">
                    {mockListData.campaign}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Created:
                  </span>
                  <span className="text-sm">{mockListData.created}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockListData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-blue-600 border-blue-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sample Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CONTACT</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>LAST CONTACT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockListData.sampleContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {contact.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {contact.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {contact.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contact.lastContact}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default ShowLeadListItemButton;
