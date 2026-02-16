const { OAuth2Client } = require("google-auth-library");
const logger = require("./logger");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify a Google ID token and return payload (or throw on invalid)
 * @param {string} idToken
 * @returns {Promise<Object>} payload
 */
async function verifyGoogleToken(idToken) {
  if (!idToken) throw new Error("No ID token provided");

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (err) {
    logger &&
      logger.error &&
      logger.error("Google token verification failed", err.message || err);
    throw err;
  }
}

module.exports = {
  verifyGoogleToken,
};
