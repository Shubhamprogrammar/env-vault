// backend/src/utils/crypto.js
const crypto = require('crypto');

// Use a server‑side master key (32 bytes). In production you would load from env.
const MASTER_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'default_master_key').digest();
const ALGO = 'aes-256-gcm';

function encryptValue(plainText) {
  const iv = crypto.randomBytes(12); // 96‑bit nonce for GCM
  const cipher = crypto.createCipheriv(ALGO, MASTER_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return {
    encrypted,
    iv: iv.toString('base64'),
    tag: authTag.toString('base64'),
  };
}

function decryptValue(encrypted, ivB64, tagB64) {
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, MASTER_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptValue, decryptValue };
