import { useState } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    locality: '',
    pincode: '',
  });
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg w-96 space-y-4">
        <h1 className="text-2xl font-bold text-white">Join NeighbourNet</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-700 text-white"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-700 text-white"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-700 text-white"
        />
        <input
          name="locality"
          placeholder="Locality (e.g. Bhubaneswar)"
          value={form.locality}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-700 text-white"
        />
        <input
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-700 text-white"
        />
        <button type="submit" className="w-full p-2 rounded bg-green-600 text-white font-semibold">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;