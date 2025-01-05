require('dotenv').config();

const SECURITY_CONFIG = {
    HASH_ITERATIONS: parseInt(process.env.HASH_ITERATIONS),
    HASH_ALGORITHM: process.env.HASH_ALGORITHM,
    SALT_BYTES: parseInt(process.env.SALT_BYTES),
    ENCRYPTION: {
        ALGORITHM: process.env.ENCRYPTION_ALGORITHM,
        KEY_LENGTH: parseInt(process.env.ENCRYPTION_KEY_LENGTH),
        IV_LENGTH: parseInt(process.env.ENCRYPTION_IV_LENGTH)
    }
  };
  
  module.exports = SECURITY_CONFIG;