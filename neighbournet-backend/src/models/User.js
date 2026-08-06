const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // never returned by default queries
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple users with no googleId
    },
    profilePicture: {
      type: String,
      default: '',
    },
    locality: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    reputationScore: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// Enables geospatial queries on user location (e.g. "users near me")
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);