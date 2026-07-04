import { supabase } from '../config/supabase.js';
import { securityService } from '../services/securityService.js';

export const authGuard = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token required. Please include Authorization: Bearer <token> header.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired access token.'
      });
    }

    // Retrieve profile from the database to attach role and information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn(`[authGuard] Could not fetch profile for user ${user.id}:`, profileError.message);
    }

    // Attach user and profile data
    req.user = {
      ...user,
      profile: profile || null,
      role: profile?.role || 'mother'
    };

    next();
  } catch (err) {
    console.error('[authGuard] Unexpected authentication error:', err);
    await securityService.sendAlert(`Auth guard execution error: ${err.message}`, 'high');
    return res.status(500).json({
      error: 'Authentication Error',
      message: 'An error occurred while verifying your session.'
    });
  }
};
