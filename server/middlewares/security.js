import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting (100 requests per 10 minutes)
export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

// Secure headers
export const secureHeaders = helmet();