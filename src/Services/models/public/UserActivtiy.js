const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  expiresAt: { type: Date, expires: 0 } // TTL index for expiration
});

// Create the TTL index
userActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
