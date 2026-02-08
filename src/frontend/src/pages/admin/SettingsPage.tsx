import { useState, useEffect } from 'react';
import { useGetAppSettings, useUpdateAppSettings } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings as SettingsIcon, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: appSettings, isLoading, error } = useGetAppSettings();
  const updateSettingsMutation = useUpdateAppSettings();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [officeHours, setOfficeHours] = useState('');

  useEffect(() => {
    if (appSettings) {
      setMaintenanceMode(appSettings.maintenanceMode);
      setContactEmail(appSettings.contactEmail);
      setOfficeHours(appSettings.officeHours);
    }
  }, [appSettings]);

  const handleSave = async () => {
    if (!contactEmail.trim() || !officeHours.trim()) {
      toast.error('Contact email and office hours are required');
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        maintenanceMode,
        contactEmail: contactEmail.trim(),
        officeHours: officeHours.trim(),
      });

      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-2 border-destructive bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <AlertDescription className="text-destructive font-semibold">
          Failed to load settings. {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Application Settings</h1>
        <p className="text-muted-foreground">Configure application-wide settings</p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader className="bg-muted border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">General Settings</CardTitle>
              <CardDescription className="text-foreground font-medium">
                Manage application configuration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 border-2 border-border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="maintenance-mode" className="text-foreground font-semibold">
                Maintenance Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable to show maintenance message to visitors
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-foreground font-semibold">
              Contact Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Enter contact email"
              className="border-2"
            />
            <p className="text-sm text-muted-foreground">
              This email will be displayed to users for support inquiries
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="office-hours" className="text-foreground font-semibold">
              Office Hours
            </Label>
            <Input
              id="office-hours"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              placeholder="e.g., 9 AM - 5 PM, Monday to Friday"
              className="border-2"
            />
            <p className="text-sm text-muted-foreground">
              Display your business hours to customers
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="px-8"
            >
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
