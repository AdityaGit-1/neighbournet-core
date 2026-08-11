const Post = require('../models/Post');
const { getIO } = require('../services/socket.service');
const { categorizeAndScorePost } = require('../services/ai.service');

const createPost = async (req, res) => {
  try {
    const { title, content, category, longitude, latitude, locality, pincode, images } = req.body;

    if (!title || !content || !category || longitude === undefined || latitude === undefined || !locality || !pincode) {
      return res.status(400).json({ message: 'title, content, category, longitude, latitude, locality, and pincode are required' });
    }

    // AI categorization + spam check — runs before saving so we can flag/store results
    const aiResult = await categorizeAndScorePost(title, content);

    const post = await Post.create({
      userId: req.userId,
      title,
      content,
      category,
      aiSuggestedCategory: aiResult.suggestedCategory,
      spamScore: aiResult.spamScore,
      aiVerified: aiResult.confidence >= 0.7 && !aiResult.isSpam,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      locality,
      pincode,
      images: images || [],
    });

    try {
      const io = getIO();
      const populatedPost = await post.populate('userId', 'name profilePicture reputationScore');
      io.to(post.pincode).emit('new-post', populatedPost);
    } catch (socketErr) {
      console.error('Socket emit error (non-fatal):', socketErr.message);
    }

    res.status(201).json({
      post,
      aiInsight: {
        suggestedCategory: aiResult.suggestedCategory,
        matchesUserCategory: aiResult.suggestedCategory === category,
        spamScore: aiResult.spamScore,
        reasoning: aiResult.reasoning,
      },
    });
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'name profilePicture reputationScore');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ post });
  } catch (err) {
    console.error('Get post error:', err.message);
    res.status(500).json({ message: 'Server error fetching post' });
  }
};

const getFeed = async (req, res) => {
  try {
    const { longitude, latitude, radius, category, time, cursor, limit } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'longitude and latitude are required' });
    }

    const maxDistanceKm = parseFloat(radius) || 5; // default 5km
    const pageLimit = parseInt(limit) || 20;

    // Build the base geospatial query
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistanceKm * 1000, // $maxDistance is in meters
        },
      },
    };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Time filter
    if (time === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startOfDay };
    } else if (time === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.createdAt = { $gte: weekAgo };
    }
    // 'all' or unspecified -> no createdAt filter

    // Cursor pagination: cursor is the _id of the last post seen
    if (cursor) {
      query._id = { $gt: cursor };
    }

    // NOTE: $near already sorts by distance ascending, and combining it with
    // an additional .sort() is not supported by MongoDB. Cursor pagination
    // here works on _id, which is acceptable for this scale.
    const posts = await Post.find(query)
      .limit(pageLimit)
      .populate('userId', 'name profilePicture reputationScore');

    const nextCursor = posts.length === pageLimit ? posts[posts.length - 1]._id : null;

    res.status(200).json({
      posts,
      nextCursor,
      count: posts.length,
    });
  } catch (err) {
    console.error('Get feed error:', err.message);
    res.status(500).json({ message: 'Server error fetching feed' });
  }
};

const upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.userId;
    const alreadyUpvoted = post.upvotes.some((id) => id.toString() === userId);
    const alreadyDownvoted = post.downvotes.some((id) => id.toString() === userId);

    if (alreadyUpvoted) {
      // toggle off
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
    } else {
      post.upvotes.push(userId);
      if (alreadyDownvoted) {
        post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);
      }
    }

    await post.save();
    res.status(200).json({ upvotes: post.upvotes.length, downvotes: post.downvotes.length });
  } catch (err) {
    console.error('Upvote error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const downvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.userId;
    const alreadyDownvoted = post.downvotes.some((id) => id.toString() === userId);
    const alreadyUpvoted = post.upvotes.some((id) => id.toString() === userId);

    if (alreadyDownvoted) {
      post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);
    } else {
      post.downvotes.push(userId);
      if (alreadyUpvoted) {
        post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
      }
    }

    await post.save();
    res.status(200).json({ upvotes: post.upvotes.length, downvotes: post.downvotes.length });
  } catch (err) {
    console.error('Downvote error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const confirmIssue = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.category !== 'civic') {
      return res.status(400).json({ message: 'Only civic issues can be confirmed' });
    }

    const userId = req.userId;
    const alreadyConfirmed = post.confirmations.some((id) => id.toString() === userId);

    if (alreadyConfirmed) {
      post.confirmations = post.confirmations.filter((id) => id.toString() !== userId);
    } else {
      post.confirmations.push(userId);
    }

    await post.save();
    res.status(200).json({ confirmations: post.confirmations.length });
  } catch (err) {
    console.error('Confirm error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    res.status(200).json({ imageUrl: req.file.path });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Server error uploading image' });
  }
};

module.exports = { createPost, getPostById, getFeed, upvotePost, downvotePost, confirmIssue, uploadImage };