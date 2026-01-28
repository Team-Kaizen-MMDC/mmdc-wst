const bcrypt = require("bcryptjs");

/**
 * Hash a plain-text password.
 * @param {string} password - Plain password
 * @param {number} [saltRounds=12] - bcrypt salt rounds (12 is a good default)
 * @returns {Promise<string>} - hashed password
 */
async function hashPassword(password, saltRounds = 12) {
  if (!password) throw new Error("Password is required");
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Compare a plain password against a bcrypt hash.
 * @param {string} password - Plain password
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>} - true if match
 */
async function comparePassword(password, hash) {
  if (!password) return false;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
