import { useState } from 'react';
import { useListAdmins, useAddAdmin, useRemoveAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { validatePrincipal, formatPrincipal } from '../../utils/principal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, UserPlus, Trash2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function AdminManagementPage() {
  const { identity } = useInternetIdentity();
  const { data: admins, isLoading, error, refetch } = useListAdmins();
  const addAdminMutation = useAddAdmin();
  const removeAdminMutation = useRemoveAdmin();

  const [newAdminInput, setNewAdminInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [adminToRemove, setAdminToRemove] = useState<Principal | null>(null);

  const currentPrincipal = identity?.getPrincipal().toString();

  const handleAddAdmin = async () => {
    setValidationError(null);

    const validation = validatePrincipal(newAdminInput);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid principal');
      return;
    }

    try {
      await addAdminMutation.mutateAsync(validation.principal!);
      toast.success('Admin added successfully');
      setNewAdminInput('');
      setValidationError(null);
    } catch (error: any) {
      console.error('Failed to add admin:', error);
      const errorMessage = error.message || 'Failed to add admin';
      setValidationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;

    try {
      await removeAdminMutation.mutateAsync(adminToRemove);
      toast.success('Admin removed successfully');
      setAdminToRemove(null);
    } catch (error: any) {
      console.error('Failed to remove admin:', error);
      const errorMessage = error.message || 'Failed to remove admin';
      toast.error(errorMessage);
      setAdminToRemove(null);
    }
  };

  const isCurrentUser = (principal: Principal) => {
    return principal.toString() === currentPrincipal;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load admin list. {error instanceof Error ? error.message : 'Please try again.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage system administrators and their access permissions
        </p>
      </div>

      {/* Add Admin Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Admin
          </CardTitle>
          <CardDescription>
            Enter a Principal ID to grant admin access to a user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal-input">Principal ID</Label>
            <div className="flex gap-2">
              <Input
                id="principal-input"
                placeholder="Enter principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                value={newAdminInput}
                onChange={(e) => {
                  setNewAdminInput(e.target.value);
                  setValidationError(null);
                }}
                disabled={addAdminMutation.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleAddAdmin}
                disabled={!newAdminInput.trim() || addAdminMutation.isPending}
              >
                {addAdminMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Admin
                  </>
                )}
              </Button>
            </div>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {addAdminMutation.isSuccess && !validationError && (
            <Alert className="border-success bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Admin added successfully
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Admin List Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Admins
          </CardTitle>
          <CardDescription>
            {admins && admins.length > 0
              ? `${admins.length} admin${admins.length === 1 ? '' : 's'} with system access`
              : 'No admins found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {admins && admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin.toString()}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm break-all">
                        {admin.toString()}
                      </p>
                      {isCurrentUser(admin) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          (You)
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setAdminToRemove(admin)}
                    disabled={isCurrentUser(admin) || removeAdminMutation.isPending}
                    className="ml-4 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No admins found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!adminToRemove} onOpenChange={(open) => !open && setAdminToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove admin access for this user? This action cannot be undone.
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="font-mono text-sm break-all">
                  {adminToRemove?.toString()}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeAdminMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              disabled={removeAdminMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeAdminMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Admin'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
