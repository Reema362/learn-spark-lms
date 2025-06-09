
// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const isRateLimited = (email: string): boolean => {
  const attempt = loginAttempts.get(email);
  if (!attempt) return false;
  
  const now = Date.now();
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(email);
    return false;
  }
  
  return attempt.count >= MAX_LOGIN_ATTEMPTS;
};

export const recordLoginAttempt = (email: string, success: boolean): void => {
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, lastAttempt: now };
  
  if (success) {
    loginAttempts.delete(email);
  } else {
    attempt.count += 1;
    attempt.lastAttempt = now;
    loginAttempts.set(email, attempt);
  }
};
