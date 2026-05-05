const securityService = require('../services/securityService');

/**
 * Session Security Middleware
 * Enforces strict timeouts for high-privilege accounts (Providers/Admins)
 */
const sessionGuard = async (req, res, next) => {
  const user = req.user; // Assuming user is already attached from auth middleware
  
  if (!user) return next();

  const role = user.user_metadata?.role;
  const isHighPrivilege = role === 'hospital' || role === 'admin';

  if (isHighPrivilege) {
    const lastSignIn = new Date(user.last_sign_in_at).getTime();
    const sessionAge = Date.now() - lastSignIn;
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;

    if (sessionAge > EIGHT_HOURS) {
      await securityService.sendAlert(`Session timeout for high-privilege user: ${user.email}`, 'medium');
      return res.status(401).json({
        error: 'Session Expired',
        message: 'For security, healthcare provider sessions are limited to 8 hours. Please log in again.'
      });
    }
  }

  next();
};

module.exports = sessionGuard;
