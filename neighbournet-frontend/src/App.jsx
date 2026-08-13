import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import LocalityMap from './components/Map/LocalityMap';
import PostCard from './components/Feed/PostCard';
import FeedFilter from './components/Feed/FeedFilter';
import useAuthStore from './store/authStore';
import useNotifStore from './store/notifStore';
import api from './services/api';
import { connectSocket, disconnectSocket } from './services/socket';
import DigestCard from './components/Digest/DigestCard';
import CivicTracker from './pages/CivicTracker';
import Leaderboard from './components/shared/Leaderboard';

function Home() {
  const { user, logout, accessToken } = useAuthStore();
  const { notifications, unreadCount, addNotification, markAllRead } = useNotifStore();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(5);
  const [showNotifs, setShowNotifs] = useState(false);
  const routerLocation = useLocation();
  const testCenter = [20.2961, 85.8245];
  const testPincode = '751001'; // matches the pincode we've been testing with
  const [digest, setDigest] = useState(null);
  const testPincode2 = '751001'; // same test pincode used elsewhere

  const fetchDigest = async () => {
    try {
      const res = await api.get(`/digest/${testPincode2}`);
      setDigest(res.data.digest);
    } catch (err) {
      console.error('Failed to fetch digest:', err);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, []);

  const fetchFeed = async () => {
    try {
      const params = { longitude: 85.8245, latitude: 20.2961, radius };
      if (category) params.category = category;
      const res = await api.get('/posts/feed', { params });
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [routerLocation.key, category, radius]);

  // Socket connection lifecycle
  useEffect(() => {
    const socket = connectSocket(accessToken);

    socket.on('connect', () => {
      console.log('Socket connected, joining room:', testPincode);
      socket.emit('join-room', testPincode);
    });

    socket.on('new-post', (post) => {
      console.log('Real-time new post received:', post);
      addNotification(post);
      fetchFeed(); // refresh feed to show the new post immediately
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleUpvote = async (postId) => {
    try {
      await api.post(`/posts/${postId}/upvote`);
      fetchFeed();
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      await api.post(`/posts/${postId}/downvote`);
      fetchFeed();
    } catch (err) {
      console.error('Downvote failed:', err);
    }
  };

  const handleConfirm = async (postId) => {
    try {
      await api.post(`/posts/${postId}/confirm`);
      fetchFeed();
    } catch (err) {
      console.error('Confirm failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center gap-6">
      <div className="flex justify-between items-center w-full max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
          {user?.badges?.length > 0 && (
            <p className="text-sm text-slate-400">{user.badges.join(' · ')}</p>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs) markAllRead();
              }}
              className="relative px-3 py-2 bg-slate-700 text-white rounded"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-lg shadow-lg p-3 space-y-2 max-h-80 overflow-y-auto z-10">
                {notifications.length === 0 && <p className="text-slate-500 text-sm">No notifications yet</p>}
                {notifications.map((n) => (
                  <div key={n.id} className="text-sm text-slate-300 border-b border-slate-700 pb-2">
                    <strong>{n.post.title}</strong>
                    <p className="text-slate-500 text-xs">New {n.post.category} post nearby</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/create" className="px-4 py-2 bg-green-600 text-white rounded font-semibold">
            + New Post
          </Link>
          <Link to="/civic" className="px-4 py-2 bg-orange-600 text-white rounded font-semibold">
            Civic Tracker
          </Link>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded font-semibold">
            Logout
          </button>
        </div>
      </div>
      
      {digest && (
        <div className="w-full max-w-5xl">
          <DigestCard digest={digest} locality={digest.locality || 'your area'} />
        </div>
      )}

      <div className="w-full max-w-5xl">
        <Leaderboard pincode={testPincode} />
      </div>

      <div className="w-full max-w-5xl">
        <FeedFilter category={category} radius={radius} onCategoryChange={setCategory} onRadiusChange={setRadius} />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LocalityMap center={testCenter} posts={posts} />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {posts.length === 0 && <p className="text-slate-500 text-center">No posts found in this area</p>}
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onConfirm={handleConfirm}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/create" element={isAuthenticated ? <CreatePost /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/civic" element={isAuthenticated ? <CivicTracker /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;