import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsPrimaryAdmin, useAdminLoginWithPassword } from '../hooks/useQueries';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { useResetAdminCredentials } from '../hooks/useResetAdminCredentials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, CheckCircle2, Loader2, ArrowLeft, AlertCircle, KeyRound, RefreshCw, WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSessionParameter, clearSessionParameter } from '../utils/urlParams';

type AuthStep = 'idle' | 'authenticating' | 'verifying' | 'success' | 'error';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const { refetch: refetchAdminStatus } = useIsPrimaryAdmin();
  const { status: healthStatus, isChecking: healthChecking, refetch: refetchHealth } = useBackendHealth();
  const resetHook = useResetAdminCredentials();
  
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentialError, setCredentialError] = useState<string | null>(null);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const adminLoginMutation = useAdminLoginWithPassword();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    const adminInitError = getSessionParameter('adminInitError');
    if (adminInitError && !errorMessage) {
      setErrorMessage(adminInitError);
      setAuthStep('error');
    }
  }, [errorMessage]);

  const checkAdminStatusAndRedirect = useCallback(async () => {
    if (authStep !== 'idle') return;

    setAuthStep('verifying');
    try {
      const { data: isAdmin } = await refetchAdminStatus();
      if (isAdmin) {
        setAuthStep('success');
        clearSessionParameter('adminInitError');
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1500);
      } else {
        setAuthStep('idle');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAuthStep('idle');
    }
  }, [refetchAdminStatus, navigate, authStep]);

  useEffect(() => {
    if (isAuthenticated && authStep === 'idle') {
      checkAdminStatusAndRedirect();
    }
  }, [isAuthenticated, authStep, checkAdminStatusAndRedirect]);

  const handleLoginAsAdmin = async () => {
    setErrorMessage(null);
    clearSessionParameter('adminInitError');

    try {
      if (!isAuthenticated) {
        setAuthStep('authenticating');
        try {
          await login();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (loginError: any) {
          console.error('Login error:', loginError);
          if (loginError.message?.includes('already authenticated')) {
            // Continue if already authenticated
          } else {
            throw new Error('Unable to connect to Internet Identity. Please try again.');
          }
        }
      }

      setAuthStep('verifying');
      let isAdmin = false;
      let retries = 3;

      while (retries > 0 && !isAdmin) {
        try {
          const { data } = await Promise.race([
            refetchAdminStatus(),
            new Promise<{ data: boolean }>((_, reject) =>
              setTimeout(() => reject(new Error('Verification timeout')), 8000)
            ),
          ]);
          isAdmin = data || false;

          if (!isAdmin && retries > 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (verifyError) {
          console.error('Verification attempt failed:', verifyError);
        }

        retries--;
      }

      if (isAdmin) {
        setAuthStep('success');
        clearSessionParameter('adminInitError');
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1500);
      } else {
        const adminInitError = getSessionParameter('adminInitError');
        if (adminInitError) {
          setErrorMessage(adminInitError);
        } else {
          setErrorMessage(
            'Your account is not authorized for admin access. An admin token link may be required to grant admin privileges.'
          );
        }
        setAuthStep('error');
      }
    } catch (error: any) {
      console.error('Login flow error:', error);
      const message = error.message || 'Login failed. Please check your connection and try again.';
      setErrorMessage(message);
      setAuthStep('error');
    }
  };

  const handleCredentialLogin = async () => {
    setCredentialError(null);

    if (!username.trim()) {
      setCredentialError('Username is required');
      return;
    }
    if (!password.trim()) {
      setCredentialError('Password is required');
      return;
    }

    if (!isAuthenticated) {
      setCredentialError('Please authenticate with Internet Identity first');
      return;
    }

    try {
      await adminLoginMutation.mutateAsync(password);

      setAuthStep('verifying');
      const { data: isAdmin } = await refetchAdminStatus();

      if (isAdmin) {
        setAuthStep('success');
        clearSessionParameter('adminInitError');
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1500);
      } else {
        setCredentialError('Login succeeded but admin status could not be verified. Please try again.');
        setAuthStep('idle');
      }
    } catch (error: any) {
      console.error('Credential login error:', error);
      const message = error.message || 'Incorrect username or password';
      setCredentialError(message);
    }
  };

  const handleResetPassword = async () => {
    setResetError(null);

    // Validation
    if (!resetCode.trim()) {
      setResetError('Reset code is required');
      return;
    }
    if (!newPassword.trim()) {
      setResetError('New password is required');
      return;
    }
    if (!confirmPassword.trim()) {
      setResetError('Please confirm your password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long');
      return;
    }

    // Check authentication before attempting reset
    if (!isAuthenticated) {
      setResetError('Please sign in with Internet Identity first before resetting credentials.');
      return;
    }

    try {
      await resetHook.resetPassword(resetCode, newPassword);

      setResetSuccess(true);

      // Clear form
      setResetCode('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');

      // Close dialog and refresh admin status after success
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetSuccess(false);
        refetchAdminStatus();
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // Use categorized error message from the hook
      if (resetHook.error) {
        setResetError(resetHook.error.message);
      } else {
        setResetError(error.message || 'Failed to reset password. Please check your reset code.');
      }
    }
  };

  const handleBackToHome = () => {
    navigate({ to: '/' });
  };

  const handleRetry = () => {
    setAuthStep('idle');
    setErrorMessage(null);
    clearSessionParameter('adminInitError');
  };

  const handleResetDialogOpenChange = (open: boolean) => {
    setResetDialogOpen(open);
    if (!open) {
      // Clear form and errors when closing
      setResetCode('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setResetError(null);
      setResetSuccess(false);
    }
  };

  const handleTriggerIILogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Internet Identity login error:', error);
      setResetError('Failed to connect to Internet Identity. Please try again.');
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-foreground font-medium">Initializing...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStepMessage = () => {
    switch (authStep) {
      case 'authenticating':
        return 'Connecting to Internet Identity...';
      case 'verifying':
        return 'Verifying admin status...';
      case 'success':
        return 'Authentication successful!';
      default:
        return '';
    }
  };

  const isProcessing = ['authenticating', 'verifying'].includes(authStep);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 bg-background">
        <Card className="max-w-lg w-full shadow-2xl border-2 border-border bg-card">
          {authStep === 'success' ? (
            <>
              <CardHeader className="text-center space-y-4 border-b-2 border-border bg-muted">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary flex items-center justify-center border-2 border-primary shadow-gold">
                  <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Authentication Successful!</CardTitle>
                  <CardDescription className="mt-2 font-medium text-foreground">
                    Welcome, Administrator! Redirecting to dashboard...
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center space-y-4 border-b-2 border-border bg-muted">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center border-2 border-primary shadow-gold">
                  <Shield className="h-10 w-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground">Admin Login</CardTitle>
                  <CardDescription className="mt-2 font-medium text-foreground">
                    Secure access to the dashboard
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Backend connectivity indicator */}
                <div
                  className={`rounded-lg p-4 border-2 flex items-center gap-3 ${
                    healthStatus === 'ok'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  {healthStatus === 'ok' ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-bold ${
                        healthStatus === 'ok' ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {healthStatus === 'ok' ? 'Backend Connected' : 'Backend Disconnected'}
                    </p>
                    <p
                      className={`text-xs ${
                        healthStatus === 'ok' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {healthStatus === 'ok'
                        ? 'Backend is reachable and ready'
                        : 'Unable to reach backend. Check your connection.'}
                    </p>
                  </div>
                  <Button
                    onClick={() => refetchHealth()}
                    variant="ghost"
                    size="sm"
                    disabled={healthChecking}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${healthChecking ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                <div className="bg-muted rounded-lg p-5 space-y-3 border-2 border-border">
                  <h3 className="font-bold text-sm text-foreground">Internet Identity Required</h3>
                  <p className="text-sm text-foreground font-medium">
                    To access the admin dashboard, you need to authenticate using Internet Identity. Admin
                    authorization is granted via a secure admin token link.
                  </p>
                  <div className="pt-2 space-y-2 text-xs text-foreground font-medium">
                    <p>✓ Secure authentication</p>
                    <p>✓ No passwords to remember</p>
                    <p>✓ Blockchain-based identity</p>
                  </div>
                </div>

                {isProcessing && (
                  <div className="bg-primary/10 rounded-lg p-5 space-y-3 border-2 border-primary">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm font-bold text-foreground">{getStepMessage()}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden border-2 border-border">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{
                          width:
                            authStep === 'authenticating' ? '50%' : authStep === 'verifying' ? '90%' : '0%',
                        }}
                      />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <Alert variant="destructive" className="border-2">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {isAuthenticated && (
                  <div className="bg-muted rounded-lg p-5 space-y-4 border-2 border-border">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Login with Credentials
                    </h3>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-foreground font-medium">
                          Username
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                          disabled={adminLoginMutation.isPending}
                          className="border-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground font-medium">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          disabled={adminLoginMutation.isPending}
                          className="border-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCredentialLogin();
                            }
                          }}
                        />
                      </div>

                      {credentialError && (
                        <Alert variant="destructive" className="border-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">{credentialError}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={handleCredentialLogin}
                        disabled={adminLoginMutation.isPending}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold border-2 border-primary"
                      >
                        {adminLoginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          <>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Login
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {!isAuthenticated && (
                  <Button
                    onClick={authStep === 'error' ? handleRetry : handleLoginAsAdmin}
                    disabled={isProcessing || loginStatus === 'logging-in'}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold border-2 border-primary"
                  >
                    {isProcessing || loginStatus === 'logging-in' ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {getStepMessage() || 'Connecting...'}
                      </>
                    ) : authStep === 'error' ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Retry Login
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Login as Admin
                      </>
                    )}
                  </Button>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleBackToHome}
                    className="text-foreground hover:text-primary font-medium"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>

                  <Dialog open={resetDialogOpen} onOpenChange={handleResetDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-foreground hover:text-primary font-medium"
                      >
                        Reset Admin Credentials
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset Admin Credentials</DialogTitle>
                        <DialogDescription>
                          Enter the reset code and your new password to reset admin credentials.
                        </DialogDescription>
                      </DialogHeader>

                      {resetSuccess ? (
                        <div className="py-8 text-center space-y-4">
                          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-foreground">Password Reset Successful!</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Your admin credentials have been updated.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Authentication warning */}
                          {!isAuthenticated && (
                            <Alert className="border-2 border-yellow-500 bg-yellow-50">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <AlertDescription className="text-sm text-yellow-900">
                                <strong>Authentication Required:</strong> You must sign in with Internet Identity before resetting admin credentials.
                                <Button
                                  onClick={handleTriggerIILogin}
                                  variant="link"
                                  className="p-0 h-auto text-yellow-900 underline ml-1"
                                >
                                  Sign in now
                                </Button>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Actor initialization error */}
                          {resetHook.state === 'error' && resetHook.error?.category === 'unreachable' && (
                            <Alert variant="destructive" className="border-2">
                              <WifiOff className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                <strong>Backend Unreachable:</strong> {resetHook.error.message}
                                <Button
                                  onClick={resetHook.retry}
                                  variant="link"
                                  className="p-0 h-auto text-destructive underline ml-1"
                                >
                                  Retry connection
                                </Button>
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-code">Reset Code</Label>
                              <Input
                                id="reset-code"
                                type="text"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                placeholder="Enter reset code"
                                disabled={resetHook.state === 'resetting' || !isAuthenticated}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="new-username">New Username (optional)</Label>
                              <Input
                                id="new-username"
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                                disabled={resetHook.state === 'resetting' || !isAuthenticated}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="new-password">New Password</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 8 characters)"
                                disabled={resetHook.state === 'resetting' || !isAuthenticated}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirm-password">Confirm Password</Label>
                              <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                disabled={resetHook.state === 'resetting' || !isAuthenticated}
                              />
                            </div>

                            {resetError && (
                              <Alert variant="destructive" className="border-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">{resetError}</AlertDescription>
                              </Alert>
                            )}
                          </div>

                          <DialogFooter>
                            <Button
                              onClick={handleResetPassword}
                              disabled={resetHook.state === 'resetting' || !isAuthenticated}
                              className="w-full"
                            >
                              {resetHook.state === 'resetting' ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Resetting...
                                </>
                              ) : (
                                'Reset Password'
                              )}
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
