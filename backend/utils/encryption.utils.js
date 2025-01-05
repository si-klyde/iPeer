const crypto = require('crypto');
const SECURITY_CONFIG = require('../config/security.config.js');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes key for AES-256

if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY must be set in environment variables');

const encrypt = (text) => {
  if (!text) throw new Error('Text required for encryption');
  
  try {
    const iv = crypto.randomBytes(SECURITY_CONFIG.ENCRYPTION.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      SECURITY_CONFIG.ENCRYPTION.ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('base64'),
      content: encrypted.toString('base64'),
      tag: tag.toString('base64')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

const decrypt = (encrypted) => {
    if (!encrypted?.iv || !encrypted?.content || !encrypted?.tag) {
      throw new Error('Invalid encrypted data format');
    }
    
    try {
      const decipher = crypto.createDecipheriv(
        SECURITY_CONFIG.ENCRYPTION.ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        Buffer.from(encrypted.iv, 'base64')
      );
      decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted.content, 'base64')),
        decipher.final()
      ]);
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  };
  
  module.exports = { encrypt, decrypt };