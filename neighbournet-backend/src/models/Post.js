const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    category: {
      type: String,
      enum: ['civic', 'recommendation', 'alert', 'lostfound', 'buysell', 'service'],
      required: true,
    },
    aiSuggestedCategory: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    locality: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      index: true,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    confirmations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'in-progress', 'resolved'],
      default: 'open',
    },
    aiVerified: {
      type: Boolean,
      default: false,
    },
    spamScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// CRITICAL — powers $near radius queries for the feed
postSchema.index({ location: '2dsphere' });

// Supports feed sorting/filtering
postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);