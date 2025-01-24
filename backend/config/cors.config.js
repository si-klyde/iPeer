const allowedOrigins = {
  development: ['http://localhost:5173'],
  production: ['https://ipeer.tech']
};

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.development.includes(origin) || allowedOrigins.production.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'Pragma',
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