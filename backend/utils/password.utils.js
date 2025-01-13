const crypto = require('crypto');
const SECURITY_CONFIG = require('../config/security.config.js');

const hashPassword = (password, salt) => {
  if (!password || !salt) {
    throw new Error('Password and salt are required for hashing');
  }
  
  let hash = crypto.createHmac(SECURITY_CONFIG.HASH_ALGORITHM, Buffer.from(salt, 'hex'))
    .update(password)
    .digest('hex');
    
  for (let i = 1; i < SECURITY_CONFIG.HASH_ITERATIONS; i++) {
    hash = crypto.createHmac(SECURITY_CONFIG.HASH_ALGORITHM, Buffer.from(salt, 'hex'))
      .update(hash)
      .digest('hex');
  }
  return hash;
};

const verifyPassword = (password, salt, storedHash) => {
  if (!password || !salt || !storedHash) {
    throw new Error('Missing required parameters for password verification');
  }
  
  try {
    const hashedPassword = hashPassword(password, salt);
    return hashedPassword === storedHash;
  } catch (error) {
    console.error('Error in password verification:', error);
    return false;
  }
};

module.exports = { hashPassword, verifyPassword };
