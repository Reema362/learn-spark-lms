
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from 'lucide-react';
import { SECURITY_CONFIG } from '../utils/security';

interface SecurityAlertProps {
  variant?: 'demo' | 'production';
  className?: string;
}

const SecurityAlert: React.FC<SecurityAlertProps> = ({ 
  variant = 'demo', 
  className = '' 
}) => {
  const isDemoMode = SECURITY_CONFIG.isDemoMode();

  if (variant === 'demo' && isDemoMode) {
    return (
      <Alert className={`border-warning bg-warning/10 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-warning-foreground">
          <strong>⚠️ Demo Mode Active:</strong> This application is running with mock authentication 
          and hardcoded credentials. Do not use in production environments.
          <br />
          <small className="text-xs mt-1 block">
            To secure for production: Connect Supabase authentication, remove demo credentials, 
            and implement proper session management.
          </small>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'production' && !isDemoMode) {
    return (
      <Alert className={`border-success bg-success/10 ${className}`}>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-success-foreground">
          <strong>✅ Production Mode:</strong> Security features are active. 
          Ensure all environment variables and authentication providers are properly configured.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SecurityAlert;
