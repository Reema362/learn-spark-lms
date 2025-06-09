
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'learner';
  department?: string;
}

const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

export const saveUserSession = (user: User): void => {
  localStorage.setItem('avocop_user', JSON.stringify(user));
  localStorage.setItem('avocop_session_timestamp', Date.now().toString());
};

export const loadUserSession = (): User | null => {
  const savedUser = localStorage.getItem('avocop_user');
  const sessionTimestamp = localStorage.getItem('avocop_session_timestamp');
  
  if (savedUser && sessionTimestamp) {
    const sessionAge = Date.now() - parseInt(sessionTimestamp);
    
    if (sessionAge < SESSION_TIMEOUT) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Validate user object structure
        if (parsedUser.id && parsedUser.email && parsedUser.role) {
          return parsedUser;
        } else {
          clearUserSession();
        }
      } catch (error) {
        clearUserSession();
      }
    } else {
      // Session expired
      clearUserSession();
    }
  }
  return null;
};

export const clearUserSession = (): void => {
  localStorage.removeItem('avocop_user');
  localStorage.removeItem('avocop_session_timestamp');
};

export const logAuditEvent = (message: string): void => {
  console.log(`Audit: ${message} at ${new Date().toISOString()}`);
};
