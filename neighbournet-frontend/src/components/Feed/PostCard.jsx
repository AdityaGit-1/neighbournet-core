import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLORS = {
  civic: 'bg-orange-600',
  recommendation: 'bg-green-600',
  alert: 'bg-red-600',
  lostfound: 'bg-purple-600',
  buysell: 'bg-blue-600',
  service: 'bg-teal-600',
};

const CATEGORY_LABELS = {
  civic: 'Civic Issue',
  recommendation: 'Recommendation',
  alert: 'Alert',
  lostfound: 'Lost & Found',
  buysell: 'Buy/Sell',
  service: 'Service Needed',
};

function PostCard({ post, onUpvote, onDownvote, onConfirm }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <span className={`text-xs px-2 py-1 rounded text-white font-semibold ${CATEGORY_COLORS[post.category] || 'bg-slate-600'}`}>
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
        <span className="text-xs text-slate-500">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>

      <h3 className="text-white font-semibold text-lg">{post.title}</h3>
      <p className="text-slate-300 text-sm">{post.content}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          {post.userId?.name || 'Unknown'} · {post.locality}
        </p>
        <div className="flex gap-3 text-sm">
          <button onClick={() => onUpvote(post._id)} className="text-slate-400 hover:text-green-400">
            ▲ {post.upvotes?.length || 0}
          </button>
          <button onClick={() => onDownvote(post._id)} className="text-slate-400 hover:text-red-400">
            ▼ {post.downvotes?.length || 0}
          </button>
          {post.category === 'civic' && (
            <button onClick={() => onConfirm(post._id)} className="text-slate-400 hover:text-blue-400">
              ✓ {post.confirmations?.length || 0}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;