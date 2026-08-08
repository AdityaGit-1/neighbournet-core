import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/Map/LocationPicker';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const CATEGORIES = [
  { value: 'civic', label: 'Civic Issue' },
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'alert', label: 'Alert' },
  { value: 'lostfound', label: 'Lost & Found' },
  { value: 'buysell', label: 'Buy/Sell' },
  { value: 'service', label: 'Service Needed' },
];

function CreatePost() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState({ title: '', content: '', category: 'civic' });
  const [selected, setSelected] = useState(null); // { lat, lng }
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const testCenter = [20.2961, 85.8245]; // fallback center

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selected) {
      setError('Please click on the map to select a location');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/posts', {
        title: form.title,
        content: form.content,
        category: form.category,
        longitude: selected.lng,
        latitude: selected.lat,
        locality: user?.locality || 'Bhubaneswar',
        pincode: user?.pincode || '751001',
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-white">Create a Post</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-700 text-white"
        />
        <textarea
          name="content"
          placeholder="What's going on?"
          value={form.content}
          onChange={handleChange}
          rows={3}
          className="w-full p-2 rounded bg-slate-700 text-white"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-700 text-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <div>
          <p className="text-slate-400 text-sm mb-2">Click on the map to set the location:</p>
          <LocationPicker center={testCenter} selected={selected} onPick={setSelected} />
          {selected && (
            <p className="text-slate-500 text-xs mt-1">
              Selected: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full p-2 rounded bg-green-600 text-white font-semibold disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;