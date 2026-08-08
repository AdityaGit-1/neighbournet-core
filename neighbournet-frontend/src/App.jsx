import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import LocalityMap from './components/Map/LocalityMap';
import PostCard from './components/Feed/PostCard';
import FeedFilter from './components/Feed/FeedFilter';
import useAuthStore from './store/authStore';
import api from './services/api';

function Home() {
  const { user, logout } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(5);
  const routerLocation = useLocation();
  const testCenter = [20.2961, 85.8245];

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
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
        <div className="flex gap-3">
          <Link to="/create" className="px-4 py-2 bg-green-600 text-white rounded font-semibold">
            + New Post
          </Link>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded font-semibold">
            Logout
          </button>
        </div>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;