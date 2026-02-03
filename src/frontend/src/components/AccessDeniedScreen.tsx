import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, LogOut, Home } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface AccessDeniedScreenProps {
  onLogout: () => void;
}

export default function AccessDeniedScreen({ onLogout }: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-[4px] border-destructive bg-card shadow-2xl">
        <CardHeader className="text-center space-y-4 border-b-2 border-destructive bg-destructive/10">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive flex items-center justify-center border-[4px] border-destructive shadow-lg">
            <ShieldAlert className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Access Denied</CardTitle>
            <CardDescription className="mt-2 font-medium text-foreground">
              You do not have permission to access the dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-muted rounded-lg p-5 text-sm text-foreground border-[3px] border-secondary">
            <p className="mb-3 font-bold text-foreground">
              Administrator Access Required
            </p>
            <p className="font-medium">
              The first authenticated user who accessed this application was automatically assigned as the primary administrator. 
              Only the primary administrator has access to the dashboard and customer data management features.
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={handleGoHome} 
              variant="default" 
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold border-[3px] border-secondary h-12"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Homepage
            </Button>
            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive border-[3px] border-secondary transition-smooth font-bold h-12 text-foreground"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

