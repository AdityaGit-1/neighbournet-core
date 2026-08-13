import { useState, useEffect } from 'react';
import api from '../../services/api';

const BADGE_ICONS = {
  'Trusted Neighbour': '🛡️',
  'Community Leader': '👑',
  'First Responder': '🚨',
};

function Leaderboard({ pincode }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get(`/users/leaderboard/${pincode}`);
        setEntries(res.data.leaderboard);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [pincode]);

  if (loading) return <p className="text-slate-500 text-sm">Loading leaderboard...</p>;

  return (
    <div className="bg-slate-800 rounded-lg p-5 space-y-3">
      <h2 className="text-white font-bold text-lg">🏆 Locality Leaderboard</h2>
      {entries.length === 0 && <p className="text-slate-500 text-sm">No ranked users yet</p>}
      {entries.map((entry) => (
        <div key={entry.userId} className="flex items-center justify-between border-b border-slate-700 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold w-6">#{entry.rank}</span>
            <span className="text-white">{entry.name}</span>
            <div className="flex gap-1">
              {entry.badges.map((b) => (
                <span key={b} title={b}>
                  {BADGE_ICONS[b] || '⭐'}
                </span>
              ))}
            </div>
          </div>
          <span className="text-slate-300 font-semibold">{entry.score} pts</span>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;