"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Plus, RefreshCw, AlertCircle } from "lucide-react";
import {
  getTeamMembers,
  updateTeamMember,
  removeTeamMember,
  addTeamMember,
  resendInvite,
  cancelInvite,
} from "@/lib/actions/team";
import {
  useServerAction,
  useServerActionWithParams,
} from "@/hooks/useServerAction";
import type { TeamMember, TeamInvite, TeamRole } from "@/types/team";

interface EditMemberDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    memberId: string,
    updates: { role?: TeamRole; status?: "active" | "inactive" }
  ) => void;
  loading: boolean;
}

function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onSave,
  loading,
}: EditMemberDialogProps) {
  const [role, setRole] = useState<TeamRole>(() => member?.role || "member");
  const [status, setStatus] = useState<"active" | "inactive">(() =>
    member?.status === "active" ? "active" : "inactive"
  );

  const handleSave = () => {
    if (!member) return;
    onSave(member.id, { role, status });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update the role and status for {member?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: TeamRole) => setRole(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: "active" | "inactive") => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { email: string; password: string; role: TeamRole; name?: string; givenName?: string; familyName?: string }) => void;
  loading: boolean;
}

function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
  loading,
}: AddMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [role, setRole] = useState<TeamRole>("member");

  const handleAdd = () => {
    if (!email.trim() || !password.trim()) return;
    onAdd({
      email: email.trim(),
      password: password.trim(),
      role,
      name: name.trim() || undefined,
      givenName: givenName.trim() || undefined,
      familyName: familyName.trim() || undefined,
    });
    // Reset form
    setEmail("");
    setPassword("");
    setName("");
    setGivenName("");
    setFamilyName("");
    setRole("member");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Create a new user account and add them to the team
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <div>
            <Label htmlFor="name">Full Name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="givenName">First Name (optional)</Label>
              <Input
                id="givenName"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <Label htmlFor="familyName">Last Name (optional)</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: TeamRole) => setRole(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading || !email.trim() || !password.trim()}>
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamMembersTable() {
  const { toast } = useToast();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Server action hooks
  const teamMembersAction = useServerAction(() => getTeamMembers(true), {
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  const updateMemberAction = useServerActionWithParams(
    ({
      memberId,
      updates,
    }: {
      memberId: string;
      updates: { role?: TeamRole; status?: "active" | "inactive" };
    }) => updateTeamMember(memberId, updates),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Team member updated successfully",
        });
        setEditingMember(null);
        teamMembersAction.execute();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const removeMemberAction = useServerActionWithParams(
    (memberId: string) => removeTeamMember(memberId),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Team member removed successfully",
        });
        setDeletingMember(null);
        teamMembersAction.execute();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const addMemberAction = useServerActionWithParams(
    (data: { email: string; password: string; role: TeamRole; name?: string; givenName?: string; familyName?: string }) =>
      addTeamMember(data),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User account created and added to team successfully",
        });
        setShowAddDialog(false);
        teamMembersAction.execute();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const resendInviteAction = useServerActionWithParams(
    (inviteId: string) => resendInvite(inviteId),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Invitation resent successfully",
        });
        teamMembersAction.execute();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const cancelInviteAction = useServerActionWithParams(
    (inviteId: string) => cancelInvite(inviteId),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Invitation cancelled successfully",
        });
        teamMembersAction.execute();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  // Load team members on mount
  useEffect(() => {
    teamMembersAction.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatLastActive = (lastActiveAt?: Date) => {
    if (!lastActiveAt) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - lastActiveAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return lastActiveAt.toLocaleDateString();
  };

  const getRoleBadgeColor = (role: TeamRole) => {
    switch (role) {
      case "owner":
        return "bg-red-100 text-red-700 border-red-300";
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "member":
        return "bg-green-100 text-green-700 border-green-300";
      case "viewer":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setDeletingMember(member);
  };

  const handleSaveEdit = (
    memberId: string,
    updates: { role?: TeamRole; status?: "active" | "inactive" }
  ) => {
    updateMemberAction.execute({ memberId, updates });
  };

  const handleConfirmDelete = () => {
    if (deletingMember) {
      removeMemberAction.execute(deletingMember.id);
    }
  };

  const handleAddMember = (data: { email: string; password: string; role: TeamRole; name?: string; givenName?: string; familyName?: string }) => {
    addMemberAction.execute(data);
  };

  const handleResendInvite = (invite: TeamInvite) => {
    resendInviteAction.execute(invite.id);
  };

  const handleCancelInvite = (invite: TeamInvite) => {
    cancelInviteAction.execute(invite.id);
  };

  if (teamMembersAction.loading && !teamMembersAction.data) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (teamMembersAction.error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Failed to load team members</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {teamMembersAction.error?.message || "An error occurred"}
          </p>
        </div>
        <Button onClick={() => teamMembersAction.execute()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const members = teamMembersAction.data?.members || [];
  const invites = teamMembersAction.data?.invites || [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Active Members */}
            {members.map((member) => (
              <TableRow
                key={member.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      getRoleBadgeColor(member.role)
                    )}
                  >
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      getStatusBadgeColor(member.status)
                    )}
                  >
                    {member.status.charAt(0).toUpperCase() +
                      member.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatLastActive(member.lastActiveAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onClick={() => handleEditMember(member)}
                      disabled={updateMemberAction.loading}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteMember(member)}
                      disabled={removeMemberAction.loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Pending Invites */}
            {invites.map((invite) => (
              <TableRow
                key={invite.id}
                className="hover:bg-muted/50 transition-colors opacity-75"
              >
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(invite.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-muted-foreground">
                        {invite.email}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Invitation pending
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      getRoleBadgeColor(invite.role)
                    )}
                  >
                    {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      getStatusBadgeColor("pending")
                    )}
                  >
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Invited {new Date(invite.invitedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleResendInvite(invite)}
                      disabled={resendInviteAction.loading}
                    >
                      {resendInviteAction.loading ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        "Resend"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleCancelInvite(invite)}
                      disabled={cancelInviteAction.loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {members.length === 0 && invites.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <p>No team members found</p>
                    <p className="text-sm mt-1">
                      Add your first team member to get started
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Member Dialog */}
      <EditMemberDialog
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onSave={handleSaveEdit}
        loading={updateMemberAction.loading}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddMember}
        loading={addMemberAction.loading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deletingMember?.name} from the
              team? This action cannot be undone and they will lose access to
              all team resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeMemberAction.loading}
            >
              {removeMemberAction.loading && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default TeamMembersTable;
