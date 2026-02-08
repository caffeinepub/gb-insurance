import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsPrimaryAdmin, useAdminLoginWithPassword } from '../hooks/useQueries';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle2, Loader2, ArrowLeft, AlertCircle, RefreshCw, WifiOff, Wifi } from 'lucide-react';
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
  
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [credentialError, setCredentialError] = useState<string | null>(null);

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

  const handleLoginWithII = async () => {
    setErrorMessage(null);
    clearSessionParameter('adminInitError');

    try {
      setAuthStep('authenticating');
      await login();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAuthStep('verifying');
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
    } catch (error: any) {
      console.error('Login flow error:', error);
      const message = error.message || 'Login failed. Please check your connection and try again.';
      setErrorMessage(message);
      setAuthStep('error');
    }
  };

  const handleCredentialLogin = async () => {
    setCredentialError(null);

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
      const message = error.message || 'Incorrect password';
      setCredentialError(message);
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
                <div className="mx-auto w-24 h-24 rounded-full bg-primary flex items-center justify-center border-2 border-primary shadow-primary">
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
                <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center border-2 border-primary shadow-primary">
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

                {isProcessing && (
                  <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-foreground">{getStepMessage()}</p>
                  </div>
                )}

                {authStep === 'error' && errorMessage && (
                  <Alert className="border-2 border-destructive bg-destructive/10">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <AlertDescription className="text-destructive font-semibold">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-5 space-y-3 border-2 border-border">
                      <h3 className="font-bold text-sm text-foreground">Internet Identity Required</h3>
                      <p className="text-sm text-foreground font-medium">
                        To access the admin dashboard, you need to authenticate using Internet Identity.
                      </p>
                    </div>

                    <Button
                      onClick={handleLoginWithII}
                      disabled={isProcessing || healthStatus !== 'ok'}
                      className="w-full h-12 text-base font-semibold"
                    >
                      {loginStatus === 'logging-in' ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-2" />
                          Login with Internet Identity
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-2 border-primary bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <AlertDescription className="text-foreground font-semibold">
                        Authenticated with Internet Identity
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted rounded-lg p-5 space-y-4 border-2 border-border">
                      <h3 className="font-bold text-sm text-foreground">Master Admin Credentials</h3>
                      <p className="text-sm text-foreground font-medium">
                        Enter the master admin password to gain admin access.
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground font-semibold">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCredentialLogin()}
                          placeholder="Enter admin password"
                          className="border-2"
                          disabled={adminLoginMutation.isPending}
                        />
                      </div>

                      {credentialError && (
                        <Alert className="border-2 border-destructive bg-destructive/10">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <AlertDescription className="text-destructive text-sm font-semibold">
                            {credentialError}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={handleCredentialLogin}
                        disabled={adminLoginMutation.isPending || !password.trim()}
                        className="w-full h-11 font-semibold"
                      >
                        {adminLoginMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login as Admin'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {authStep === 'error' && (
                  <Button onClick={handleRetry} variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}

                <Button onClick={handleBackToHome} variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
