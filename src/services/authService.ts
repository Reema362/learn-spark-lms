
import { User } from '../utils/sessionManager';
import { sanitizeInput, validateEmail } from '../utils/inputSanitization';
import { isRateLimited, recordLoginAttempt } from '../utils/rateLimiting';

export const authenticateUser = async (
  email: string, 
  password?: string, 
  userType?: 'admin' | 'learner'
): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Sanitize inputs
  const sanitizedEmail = sanitizeInput(email);
  
  // Rate limiting check
  if (isRateLimited(sanitizedEmail)) {
    return { success: false, error: 'Too many login attempts. Please try again later.' };
  }

  // Basic email validation
  if (!validateEmail(sanitizedEmail)) {
    recordLoginAttempt(sanitizedEmail, false);
    return { success: false, error: 'Invalid email format' };
  }
  
  try {
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let mockUser: User;
    let authSuccess = false;
    
    if (userType === 'admin' && password) {
      // Demo admin credentials - updated to include all admin emails
      if ((sanitizedEmail === 'admin@avocop.com' || 
           sanitizedEmail === 'naveen.v1@slksoftware.com' || 
           sanitizedEmail === 'reema.jain@slksoftware.com') && 
          password === 'admin123') {
        
        const adminName = sanitizedEmail === 'reema.jain@slksoftware.com' ? 'Reema Jain' :
                         sanitizedEmail === 'naveen.v1@slksoftware.com' ? 'Naveen V' : 'Demo Admin';
        
        mockUser = {
          id: sanitizedEmail === 'reema.jain@slksoftware.com' ? '2' :
              sanitizedEmail === 'naveen.v1@slksoftware.com' ? '3' : '1',
          email: sanitizedEmail,
          name: adminName,
          role: 'admin'
        };
        authSuccess = true;
      } else {
        recordLoginAttempt(sanitizedEmail, false);
        return { success: false, error: 'Invalid credentials' };
      }
    } else if (userType === 'learner') {
      // Simulate SSO validation - in production, this would validate with SSO provider
      mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: sanitizedEmail,
        name: sanitizedEmail.split('@')[0],
        role: 'learner',
        department: 'IT Security'
      };
      authSuccess = true;
    } else {
      recordLoginAttempt(sanitizedEmail, false);
      return { success: false, error: 'Invalid login type' };
    }
    
    if (authSuccess) {
      recordLoginAttempt(sanitizedEmail, true);
      return { success: true, user: mockUser };
    }
    
    return { success: false, error: 'Authentication failed' };
  } catch (error) {
    recordLoginAttempt(sanitizedEmail, false);
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication service error' };
  }
};
