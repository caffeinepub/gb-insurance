import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfileSetup() {
  const saveProfileMutation = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    // Validate inputs
    if (!name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setValidationError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        role: 'Administrator',
      });

      // Show success state
      setShowSuccess(true);

      // Reset form after a brief delay
      setTimeout(() => {
        setName('');
        setEmail('');
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setValidationError('Failed to save profile. Please try again.');
    }
  };

  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md border-4 border-secondary/50 bg-card" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-foreground" />
            Complete Your Administrator Profile
          </DialogTitle>
          <DialogDescription className="text-foreground">
            Set up your profile to access the dashboard
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="bg-secondary/10 border-3 border-secondary/30">
          <Shield className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-sm text-foreground">
            You are the primary administrator of this application. Complete your profile to access the dashboard and manage customer submissions.
          </AlertDescription>
        </Alert>

        {showSuccess ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-secondary mx-auto animate-in zoom-in duration-300" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Profile Saved Successfully!</h3>
              <p className="text-sm text-foreground">Your profile has been created. You can now access the dashboard.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <Alert variant="destructive" className="border-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
            
            {saveProfileMutation.isError && (
              <Alert variant="destructive" className="border-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {saveProfileMutation.error?.message || 'Failed to save profile. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-foreground font-semibold">Full Name *</Label>
              <Input
                id="profile-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError('');
                }}
                required
                autoComplete="name"
                className="h-12 border-3 border-secondary bg-input text-foreground placeholder:text-muted-foreground focus:border-accent focus-visible:ring-accent"
                disabled={saveProfileMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-foreground font-semibold">Email Address *</Label>
              <Input
                id="profile-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError('');
                }}
                required
                autoComplete="email"
                className="h-12 border-3 border-secondary bg-input text-foreground placeholder:text-muted-foreground focus:border-accent focus-visible:ring-accent"
                disabled={saveProfileMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role" className="text-foreground font-semibold">Role</Label>
              <Input
                id="profile-role"
                type="text"
                value="Administrator"
                disabled
                className="h-12 border-3 border-secondary bg-muted text-foreground font-semibold"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 border-3 border-secondary/50 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold transition-colors"
              disabled={saveProfileMutation.isPending || !isFormValid}
            >
              {saveProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                'Continue to Dashboard'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

