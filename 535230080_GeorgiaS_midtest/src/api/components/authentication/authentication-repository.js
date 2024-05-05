const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function updateAttempt(id, attempt, last_attempt) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        attempt,
        last_attempt,
      },
    }
  );
}

module.exports = {
  getUserByEmail,
  updateAttempt,
};
