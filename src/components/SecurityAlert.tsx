
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
  // Don't show any alerts for now
  return null;
};

export default SecurityAlert;
