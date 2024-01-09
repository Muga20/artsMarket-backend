const rateLimit = require("express-rate-limit");

// Create a rate limiter with a limit of 50 requests per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000,
  message: 'Too many requests from this IP, please try again after an hour.',
});


module.exports = limiter;

