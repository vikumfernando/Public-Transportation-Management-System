const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000, // 1 hour
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Apply security middleware to the app
 * @param {Object} app - Express app
 */
const applySecurityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Enable CORS
  app.use(cors(corsOptions));

  // Limit requests from same IP
  app.use('/api', limiter);

  // Body parser, reading data from body into req.body
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  if (process.env.XSS_PROTECTION === 'true') {
    app.use(xss());
  }

  // Prevent parameter pollution
  if (process.env.HPP_PROTECTION === 'true') {
    app.use(
      hpp({
        whitelist: [
          'duration',
          'ratingsQuantity',
          'ratingsAverage',
          'maxGroupSize',
          'difficulty',
          'price'
        ]
      })
    );
  }

  // Test middleware
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });
};

module.exports = applySecurityMiddleware;
