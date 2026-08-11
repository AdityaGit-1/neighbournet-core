function DigestCard({ digest, locality }) {
  if (!digest) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-lg p-5 space-y-3">
      <h2 className="text-white font-bold text-lg">Today in {locality || 'your area'}</h2>
      <p className="text-slate-300 text-sm">{digest.summary}</p>

      {digest.topIssues?.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Top Issues</p>
          <ul className="text-slate-300 text-sm list-disc list-inside">
            {digest.topIssues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {digest.topRecommendations?.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Recommendations</p>
          <ul className="text-slate-300 text-sm list-disc list-inside">
            {digest.topRecommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-slate-700 text-xs text-slate-500">
        <span>{digest.resolvedCount} issue(s) resolved today</span>
        <span>Updated {new Date(digest.generatedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export default DigestCard;