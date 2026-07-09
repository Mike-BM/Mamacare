import express from 'express';
import { supabase } from '../config/supabase.js';
import { authGuard } from '../middleware/authGuard.js';
import { securityService } from '../services/securityService.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ error: 'Validation Error', message: 'All fields (email, password, fullName, role) are required.' });
  }

  const allowedRoles = ['mother', 'provider', 'hospital', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Validation Error', message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        full_name: fullName
      }
    });

    if (error) {
      return res.status(400).json({ error: 'Registration Failed', message: error.message });
    }

    // Wait a brief moment for DB trigger to complete, then query profile (fetch only required fields)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', data.user.id)
      .single();

    // Create role-specific record if it doesn't exist
    if (role === 'mother') {
      await supabase.from('mothers').insert({ user_id: data.user.id });
    } else if (role === 'provider' || role === 'doctor') {
      await supabase.from('providers').insert({ user_id: data.user.id, full_name: fullName });
    } else if (role === 'hospital') {
      await supabase.from('hospitals').insert({ user_id: data.user.id, name: fullName });
    }

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, fullName);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    res.status(201).json({
      message: 'Registration successful!',
      user: data.user,
      profile: profile || { id: data.user.id, email, full_name: fullName, role }
    });
  } catch (err) {
    console.error('Registration API error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return session token
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Authentication Failed', message: error.message });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: data.user,
      profile
    });
  } catch (err) {
    console.error('Login API error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Invalidate session
 */
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: 'Logout Failed', message: error.message });
    }
    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout API error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Retrieve current user profile and session info
 */
router.get('/me', authGuard, async (req, res) => {
  res.json({
    user: req.user
  });
});

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile data
 */
router.put('/profile', authGuard, async (req, res) => {
  const { fullName, pregnancyStage, dueDate, healthData } = req.body;
  const userId = req.user.id;

  try {
    // 1. Update Profile table
    if (fullName) {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', userId);
        
      if (profileErr) throw profileErr;
    }

    // 2. Update Mother details if role is mother
    if (req.user.role === 'mother') {
      const updates = {};
      if (pregnancyStage !== undefined) updates.pregnancy_stage = pregnancyStage;
      if (dueDate !== undefined) updates.due_date = dueDate;
      if (healthData !== undefined) updates.health_data = healthData;

      if (Object.keys(updates).length > 0) {
        const { error: motherErr } = await supabase
          .from('mothers')
          .update(updates)
          .eq('user_id', userId);

        if (motherErr) throw motherErr;
      }
    }

    // Fetch updated profile (only required fields)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', userId)
      .single();

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (err) {
    console.error('Profile update API error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

export default router;
