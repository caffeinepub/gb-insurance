import { useState } from 'react';
import { useListAllUserProfiles, useUpdateUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Users as UsersIcon, Edit, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile } from '../../backend';
import { Principal } from '@dfinity/principal';

export default function UsersPage() {
  const { data: userProfiles, isLoading, error } = useListAllUserProfiles();
  const updateUserMutation = useUpdateUserProfile();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ principal: Principal; profile: UserProfile } | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  const handleEditUser = (principal: Principal, profile: UserProfile) => {
    setSelectedUser({ principal, profile });
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditRole(profile.role);
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    if (!editName.trim() || !editEmail.trim() || !editRole.trim()) {
      toast.error('All fields are required');
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        user: selectedUser.principal,
        profile: {
          name: editName.trim(),
          email: editEmail.trim(),
          role: editRole.trim(),
        },
      });

      toast.success('User profile updated successfully');
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-2 border-destructive bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <AlertDescription className="text-destructive font-semibold">
          Failed to load users. {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-muted-foreground">View and manage user profiles</p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader className="bg-muted border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">Registered Users</CardTitle>
              <CardDescription className="text-foreground font-medium">
                Total: {userProfiles?.length || 0} users
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!userProfiles || userProfiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UsersIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Users will appear here once they register</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userProfiles.map(([principal, profile]) => (
                <div
                  key={principal.toString()}
                  className="flex items-center justify-between p-4 border-2 border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Role: <span className="font-medium">{profile.role}</span>
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {principal.toString().slice(0, 20)}...
                    </p>
                  </div>
                  <Button
                    onClick={() => handleEditUser(principal, profile)}
                    variant="outline"
                    size="sm"
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                placeholder="Enter role"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
