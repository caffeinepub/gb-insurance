import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsPrimaryAdmin, useCreateFirstAdmin } from '../hooks/useQueries';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle2, Loader2, ArrowLeft, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSessionParameter, clearSessionParameter } from '../utils/urlParams';

type AuthStep = 'idle' | 'authenticating' | 'verifying' | 'success' | 'unauthorized' | 'error' | 'creating-admin';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const { data: isAdmin, refetch: refetchAdminStatus, error: adminCheckError } = useIsPrimaryAdmin();
  const { status: healthStatus, refetch: refetchHealth } = useBackendHealth();
  const createFirstAdminMutation = useCreateFirstAdmin();
  
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Check for admin init errors on mount
  useEffect(() => {
    const adminInitError = getSessionParameter('adminInitError');
    if (adminInitError) {
      setErrorMessage(adminInitError);
      setAuthStep('error');
    }
  }, []);

  // Auto-verify and redirect when authenticated
  useEffect(() => {
    if (!isAuthenticated || authStep === 'success' || authStep === 'unauthorized' || authStep === 'creating-admin') {
      return;
    }

    const verifyAndRedirect = async () => {
      if (authStep !== 'idle' && authStep !== 'verifying') {
        return;
      }

      setAuthStep('verifying');
      setErrorMessage(null);

      try {
        const { data: adminStatus } = await refetchAdminStatus();
        
        if (adminStatus === true) {
          setAuthStep('success');
          clearSessionParameter('adminInitError');
          setTimeout(() => {
            navigate({ to: '/dashboard' });
          }, 1000);
        } else {
          setAuthStep('unauthorized');
          setErrorMessage('You are not authorized as an admin. You can create the first admin if none exists.');
        }
      } catch (error: any) {
        console.error('Admin verification failed:', error);
        setAuthStep('error');
        setErrorMessage(error.message || 'Failed to verify admin status. Please try again.');
      }
    };

    verifyAndRedirect();
  }, [isAuthenticated, authStep, refetchAdminStatus, navigate]);

  const handleLoginWithII = async () => {
    if (isAuthenticated) {
      // Already authenticated, just verify
      setAuthStep('idle');
      return;
    }

    setErrorMessage(null);
    clearSessionParameter('adminInitError');
    setAuthStep('authenticating');

    try {
      await login();
      // After successful login, the useEffect will handle verification
    } catch (error: any) {
      console.error('Internet Identity login failed:', error);
      setAuthStep('error');
      
      if (error.message?.includes('popup') || error.message?.includes('blocked')) {
        setErrorMessage('Login popup was blocked. Please allow popups for this site and try again.');
      } else if (error.message?.includes('User is already authenticated')) {
        setErrorMessage('You are already logged in. Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setErrorMessage(error.message || 'Internet Identity login failed. Please try again.');
      }
    }
  };

  const handleCreateFirstAdmin = async () => {
    setAuthStep('creating-admin');
    setErrorMessage(null);

    try {
      await createFirstAdminMutation.mutateAsync();
      
      // Re-check admin status
      const { data: adminStatus } = await refetchAdminStatus();
      
      if (adminStatus === true) {
        setAuthStep('success');
        clearSessionParameter('adminInitError');
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1000);
      } else {
        setAuthStep('error');
        setErrorMessage('Admin creation succeeded but verification failed. An admin may already exist.');
      }
    } catch (error: any) {
      console.error('Failed to create first admin:', error);
      setAuthStep('error');
      
      if (error.message?.includes('already')) {
        setErrorMessage('An admin already exists. Please contact the system administrator.');
      } else {
        setErrorMessage(error.message || 'Failed to create first admin. Please try again.');
      }
    }
  };

  const handleRetry = () => {
    setAuthStep('idle');
    setErrorMessage(null);
    clearSessionParameter('adminInitError');
  };

  const handleBackToHome = () => {
    navigate({ to: '/' });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Initializing...</p>
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
      case 'creating-admin':
        return 'Creating first admin...';
      case 'success':
        return 'Authentication successful! Redirecting...';
      default:
        return '';
    }
  };

  const isProcessing = ['authenticating', 'verifying', 'creating-admin'].includes(authStep);
  const showLoginButton = !isAuthenticated && authStep !== 'success';
  const showUnauthorizedMessage = authStep === 'unauthorized';
  const showErrorState = authStep === 'error';
  const showCreateFirstAdmin = isAuthenticated && showUnauthorizedMessage;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Secure access to the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Display */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Success State */}
            {authStep === 'success' && (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  {getStepMessage()}
                </AlertDescription>
              </Alert>
            )}

            {/* Processing State */}
            {isProcessing && authStep !== 'success' && (
              <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{getStepMessage()}</p>
              </div>
            )}

            {/* Login Button */}
            {showLoginButton && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Authenticate with your Internet Identity to access the admin area
                </p>
                <Button
                  onClick={handleLoginWithII}
                  disabled={isProcessing || healthStatus !== 'ok'}
                  className="w-full"
                  size="lg"
                >
                  {loginStatus === 'logging-in' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Unauthorized Message with Create First Admin Option */}
            {showUnauthorizedMessage && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are not authorized as an admin. Please contact the system administrator.
                  </AlertDescription>
                </Alert>

                {showCreateFirstAdmin && (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateFirstAdmin}
                      disabled={isProcessing}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create First Admin
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      If no admin exists yet, you can create the first admin account
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Retry Button */}
            {showErrorState && (
              <Button
                onClick={handleRetry}
                variant="default"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}

            {/* Back to Home */}
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Homepage
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
