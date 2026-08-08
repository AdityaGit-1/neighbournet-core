import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LocalityMap from './components/Map/LocalityMap';
import useAuthStore from './store/authStore';
import api from './services/api';

function Home() {
  const { user, logout } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const testCenter = [20.2961, 85.8245]; // [lat, lng] for Leaflet

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        // Note: our backend expects longitude, latitude (GeoJSON order), reversed from Leaflet's [lat, lng]
        const res = await api.get('/posts/feed', {
          params: { longitude: 85.8245, latitude: 20.2961, radius: 5 },
        });
        setPosts(res.data.posts);
      } catch (err) {
        console.error('Failed to fetch feed:', err);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center gap-6">
      <div className="flex justify-between w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
        <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded font-semibold">
          Logout
        </button>
      </div>
      <div className="w-full max-w-3xl">
        <LocalityMap center={testCenter} posts={posts} />
      </div>
      <p className="text-slate-400">{posts.length} post(s) loaded</p>
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
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;