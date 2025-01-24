// API Configuration
const API_CONFIG = {
    // Development
    DEV_BASE_URL: 'http://localhost:5000',
    // Production
    PROD_BASE_URL: 'https://ipeer.tech',
    // Use this to determine which base URL to use
    BASE_URL: import.meta.env.PROD ? 'https://ipeer.tech' : 'http://localhost:5000'
};

export default API_CONFIG; 