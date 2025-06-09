
// Security configuration and utilities
export const SECURITY_CONFIG = {
  // Session configuration
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Input validation
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
  
  // Demo mode detection
  isDemoMode: () => process.env.NODE_ENV === 'development' || 
                   window.location.hostname === 'localhost' ||
                   window.location.hostname.includes('lovable.app')
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= SECURITY_CONFIG.MAX_EMAIL_LENGTH;
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (password.length > SECURITY_CONFIG.MAX_PASSWORD_LENGTH) {
    errors.push(`Password must be no more than ${SECURITY_CONFIG.MAX_PASSWORD_LENGTH} characters`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Audit logging
export const auditLog = (action: string, userId?: string, details?: any): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    userAgent: navigator.userAgent,
    ip: 'client-side', // In production, this would come from server
    sessionId: localStorage.getItem('avocop_session_timestamp')
  };
  
  // In development, log to console
  if (SECURITY_CONFIG.isDemoMode()) {
    console.log('🔒 Audit Log:', logEntry);
  }
  
  // In production, send to secure logging service
  // await sendToSecureLogger(logEntry);
};

// Session management
export const isSessionValid = (): boolean => {
  const sessionTimestamp = localStorage.getItem('avocop_session_timestamp');
  if (!sessionTimestamp) return false;
  
  const sessionAge = Date.now() - parseInt(sessionTimestamp);
  return sessionAge < SECURITY_CONFIG.SESSION_TIMEOUT;
};

// CSRF token generation (for future use)
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
};

// XSS protection
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
