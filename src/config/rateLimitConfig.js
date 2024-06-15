import rateLimit from 'express-rate-limit';

export default rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => {
    return req.headers['x-forwarded-for'] || 'localhost';
  },
  message: 'Too many requests from this IP, please try again later.'
});
