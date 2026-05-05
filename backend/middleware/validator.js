const { z } = require('zod');

/**
 * Zod Schemas for high-risk actions
 */
const schemas = {
  // Appointment Validation
  appointment: z.object({
    patient_id: z.string().uuid(),
    provider_id: z.string().uuid(),
    reason: z.string().max(500).transform(s => s.replace(/[<>]/g, '')), // Strip HTML
    type: z.enum(['in_person', 'video', 'follow_up']),
    date: z.string().datetime()
  }),

  // Payment Validation (MamaFund)
  payment: z.object({
    amount: z.number().positive().max(1000000), // Max 1M KES
    currency: z.string().length(3),
    reference: z.string().min(5)
  }),

  // Profile Updates
  profile: z.object({
    full_name: z.string().min(2).max(100),
    pregnancy_week: z.number().min(1).max(45).optional()
  })
};

const validate = (schemaKey) => (req, res, next) => {
  try {
    const schema = schemas[schemaKey];
    if (!schema) throw new Error(`Schema ${schemaKey} not found`);
    
    // Parse and validate body
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      error: 'Security Validation Failed',
      details: err.errors ? err.errors.map(e => `${e.path}: ${e.message}`) : err.message
    });
  }
};

module.exports = { validate, schemas };
