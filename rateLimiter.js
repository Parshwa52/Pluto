import setRateLimit from "express-rate-limit";

// Rate limit middleware for 1 million requests for minute
const rateLimitMiddleware = setRateLimit({
  windowMs: 60 * 1000,
  max: 1000000,
  message: "You have exceeded your 1000000 requests per minute limit.",
  headers: true,
});

export default rateLimitMiddleware;
