const Post = require('../models/Post');
const { deleteCache } = require('../services/cache.service');
const { getIO } = require('../services/socket.service');
const { categorizeAndScorePost } = require('../services/ai.service');
const { getCache, setCache } = require('../services/cache.service');

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

    // Invalidate cached feeds — a new post can affect any radius search that includes its location
    try {
      await invalidatePattern('feed:*');
    } catch (invalidateErr) {
      console.error('Cache invalidation error (non-fatal):', invalidateErr.message);
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

    const maxDistanceKm = parseFloat(radius) || 5;
    const pageLimit = parseInt(limit) || 20;

    // Cache key: only cache the common case (no cursor, i.e. first page) since
    // paginated requests are less repeatable and not worth caching individually
    const cacheKey = !cursor
      ? `feed:${latitude}:${longitude}:${maxDistanceKm}:${category || 'all'}:${time || 'all'}`
      : null;

    if (cacheKey) {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.status(200).json({ ...cached, fromCache: true });
      }
    }

    const query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: maxDistanceKm * 1000,
        },
      },
    };

    if (category) query.category = category;

    if (time === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: startOfDay };
    } else if (time === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query.createdAt = { $gte: weekAgo };
    }

    if (cursor) {
      query._id = { $gt: cursor };
    }

    const posts = await Post.find(query)
      .limit(pageLimit)
      .populate('userId', 'name profilePicture reputationScore');

    const nextCursor = posts.length === pageLimit ? posts[posts.length - 1]._id : null;

    const result = { posts, nextCursor, count: posts.length };

    // Cache only first-page results, 5 min TTL
    if (cacheKey) {
      await setCache(cacheKey, result, 5 * 60);
    }

    res.status(200).json({ ...result, fromCache: false });
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

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'acknowledged', 'in-progress', 'resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.category !== 'civic') {
      return res.status(400).json({ message: 'Only civic issues have a status progression' });
    }

    post.status = status;
    await post.save();

    // Invalidate feed cache since status changed
    try {
      await invalidatePattern('feed:*');
    } catch (err) {
      console.error('Cache invalidation error (non-fatal):', err.message);
    }

    res.status(200).json({ post });
  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

const getCivicIssues = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'longitude and latitude are required' });
    }

    const maxDistanceKm = parseFloat(radius) || 5;

    const posts = await Post.find({
      category: 'civic',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: maxDistanceKm * 1000,
        },
      },
    }).populate('userId', 'name profilePicture reputationScore');

    res.status(200).json({ posts, count: posts.length });
  } catch (err) {
    console.error('Get civic issues error:', err.message);
    res.status(500).json({ message: 'Server error fetching civic issues' });
  }
};

module.exports = { createPost, getPostById, getFeed, upvotePost, downvotePost, confirmIssue, uploadImage, updateStatus, getCivicIssues };