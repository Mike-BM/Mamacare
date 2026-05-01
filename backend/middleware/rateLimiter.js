import rateLimit from 'express-rate-limit';

// Standard fallback rate limiter
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Dynamic tier-based rate limiter
export const tierBasedLimiter = (req, res, next) => {
  // In a real app, tier would come from req.user.tier set by an auth middleware
  const tier = req.user?.tier || 'free'; 
  
  const limits = {
    'free': { windowMs: 15 * 60 * 1000, max: 20 },
    'basic': { windowMs: 15 * 60 * 1000, max: 100 },
    'plus': { windowMs: 15 * 60 * 1000, max: 500 },
    'premium': { windowMs: 15 * 60 * 1000, max: 2000 }
  };
  
  const selectedLimit = limits[tier] || limits['free'];
  
  const limiter = rateLimit({
    windowMs: selectedLimit.windowMs,
    max: selectedLimit.max,
    message: { error: `Rate limit exceeded for ${tier} tier. Please upgrade for higher limits.` },
    keyGenerator: (req) => req.user?.id || req.ip
  });
  
  limiter(req, res, next);
};

// API Key Rotation Helper
export const rotateApiKey = async (hospitalId, oldKey) => {
  // 1. Verify old key matches
  // 2. Generate new key
  const newKeyRaw = "mcare_sk_live_" + Math.random().toString(36).substr(2, 15);
  
  // 3. Hash new key for storage (never store plain text keys)
  // const { hashKey } = await import('../utils/crypto.js');
  // const hashedKey = await hashKey(newKeyRaw);
  
  // 4. Update in DB
  // await db.hospitals.update({ apiKey: hashedKey }).eq('id', hospitalId);
  
  // 5. Return new key (only once!)
  return newKeyRaw;
};
