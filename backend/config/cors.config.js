const allowedOrigins = {
  development: [
    'http://localhost:5173',
    'https://localhost:5173'
  ],
  production: [
    // Main production URLs
    'https://ipeer.tech',
    'https://www.ipeer.tech',
    // For potential subdomain support
    'https://*.ipeer.tech'
  ]
};

const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

module.exports = corsOptions; 