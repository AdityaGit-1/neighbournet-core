import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LocalityMap from '../components/Map/LocalityMap';

const STATUS_FLOW = ['open', 'acknowledged', 'in-progress', 'resolved'];
const STATUS_LABELS = {
  open: 'Reported',
  acknowledged: 'Acknowledged',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
};
const STATUS_COLORS = {
  open: 'bg-red-600',
  acknowledged: 'bg-yellow-600',
  'in-progress': 'bg-blue-600',
  resolved: 'bg-green-600',
};

function CivicTracker() {
  const [issues, setIssues] = useState([]);
  const testCenter = [20.2961, 85.8245];

  const fetchIssues = async () => {
    try {
      const res = await api.get('/posts/civic', {
        params: { longitude: 85.8245, latitude: 20.2961, radius: 5 },
      });
      setIssues(res.data.posts);
    } catch (err) {
      console.error('Failed to fetch civic issues:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleConfirm = async (postId) => {
    try {
      await api.post(`/posts/${postId}/confirm`);
      fetchIssues();
    } catch (err) {
      console.error('Confirm failed:', err);
    }
  };

  const handleAdvanceStatus = async (postId, currentStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === STATUS_FLOW.length - 1) return; // already resolved

    const nextStatus = STATUS_FLOW[currentIndex + 1];
    try {
      await api.patch(`/posts/${postId}/status`, { status: nextStatus });
      fetchIssues();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center gap-6">
      <div className="flex justify-between items-center w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-white">Civic Issue Tracker</h1>
        <Link to="/" className="px-4 py-2 bg-slate-700 text-white rounded font-semibold">
          ← Back to Feed
        </Link>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <LocalityMap center={testCenter} posts={issues} />
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {issues.length === 0 && <p className="text-slate-500 text-center">No civic issues reported nearby</p>}
          {issues.map((issue) => (
            <div key={issue._id} className="bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <span className={`text-xs px-2 py-1 rounded text-white font-semibold ${STATUS_COLORS[issue.status]}`}>
                  {STATUS_LABELS[issue.status]}
                </span>
                <span className="text-xs text-slate-500">{issue.confirmations?.length || 0} confirmations</span>
              </div>

              <h3 className="text-white font-semibold">{issue.title}</h3>
              <p className="text-slate-300 text-sm">{issue.content}</p>

              {/* Simple visual progress bar */}
              <div className="flex gap-1">
                {STATUS_FLOW.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded ${
                      STATUS_FLOW.indexOf(issue.status) >= i ? 'bg-blue-500' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleConfirm(issue._id)}
                  className="text-xs px-3 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600"
                >
                  Confirm Issue
                </button>
                {issue.status !== 'resolved' && (
                  <button
                    onClick={() => handleAdvanceStatus(issue._id, issue.status)}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Advance to {STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(issue.status) + 1]]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CivicTracker;