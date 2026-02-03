import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsPrimaryAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../components/Header';
import Footer from '../components/Footer';

type AuthStep = 'idle' | 'authenticating' | 'verifying' | 'success' | 'error';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const { refetch: refetchAdminStatus } = useIsPrimaryAdmin();
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const checkAdminStatusAndRedirect = useCallback(async () => {
    if (authStep !== 'idle') return;
    
    setAuthStep('verifying');
    try {
      const { data: isAdmin } = await refetchAdminStatus();
      if (isAdmin) {
        setAuthStep('success');
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

  // Auto-check admin status if already authenticated
  useEffect(() => {
    if (isAuthenticated && authStep === 'idle') {
      checkAdminStatusAndRedirect();
    }
  }, [isAuthenticated, authStep, checkAdminStatusAndRedirect]);

  const handleLoginAsAdmin = async () => {
    setErrorMessage(null);
    
    try {
      // Step 1: Authenticate with Internet Identity
      if (!isAuthenticated) {
        setAuthStep('authenticating');
        try {
          await login();
          // Wait for identity to be fully set
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (loginError: any) {
          console.error('Login error:', loginError);
          if (loginError.message?.includes('already authenticated')) {
            // Continue if already authenticated
          } else {
            throw new Error('Unable to connect to Internet Identity. Please try again.');
          }
        }
      }

      // Step 2: Verify admin status with retries
      setAuthStep('verifying');
      let isAdmin = false;
      let retries = 3;
      
      while (retries > 0 && !isAdmin) {
        try {
          const { data } = await Promise.race([
            refetchAdminStatus(),
            new Promise<{ data: boolean }>((_, reject) => 
              setTimeout(() => reject(new Error('Verification timeout')), 8000)
            )
          ]);
          isAdmin = data || false;
          
          if (!isAdmin && retries > 1) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (verifyError) {
          console.error('Verification attempt failed:', verifyError);
        }
        
        retries--;
      }

      if (isAdmin) {
        // Success - show confirmation
        setAuthStep('success');
        setTimeout(() => {
          navigate({ to: '/dashboard' });
        }, 1500);
      } else {
        // Not admin
        setErrorMessage('You are not authorized as an administrator. Only the first user to log in becomes the admin.');
        setAuthStep('error');
      }
    } catch (error: any) {
      console.error('Login flow error:', error);
      const message = error.message || 'Login failed. Please check your connection and try again.';
      setErrorMessage(message);
      setAuthStep('error');
    }
  };

  const handleBackToHome = () => {
    navigate({ to: '/' });
  };

  const handleRetry = () => {
    setAuthStep('idle');
    setErrorMessage(null);
  };

  // Show loading during initialization
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
                <div className="bg-muted rounded-lg p-5 space-y-3 border-2 border-border">
                  <h3 className="font-bold text-sm text-foreground">Internet Identity Required</h3>
                  <p className="text-sm text-foreground font-medium">
                    To access the admin dashboard, you need to authenticate using Internet Identity. 
                    This ensures secure and decentralized access to customer data and management features.
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
                          width: authStep === 'authenticating' ? '50%' : 
                                 authStep === 'verifying' ? '90%' : '0%'
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

                <Button
                  onClick={authStep === 'error' ? handleRetry : handleLoginAsAdmin}
                  disabled={isProcessing || loginStatus === 'logging-in'}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold border-2 border-primary h-14 text-lg"
                  size="lg"
                >
                  {isProcessing || loginStatus === 'logging-in' ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      {getStepMessage()}
                    </>
                  ) : authStep === 'error' ? (
                    <>
                      <Shield className="mr-2 h-6 w-6" />
                      Try Again
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-6 w-6" />
                      Login as Admin
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="w-full border-2 border-border hover:bg-muted font-bold h-12 text-foreground"
                  disabled={isProcessing}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Homepage
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

