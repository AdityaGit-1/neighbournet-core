const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'civic', label: 'Civic Issue' },
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'alert', label: 'Alert' },
  { value: 'lostfound', label: 'Lost & Found' },
  { value: 'buysell', label: 'Buy/Sell' },
  { value: 'service', label: 'Service Needed' },
];

const RADIUS_OPTIONS = [1, 2, 5, 10];

function FeedFilter({ category, radius, onCategoryChange, onRadiusChange }) {
  return (
    <div className="flex gap-3 flex-wrap">
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="p-2 rounded bg-slate-700 text-white text-sm"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={radius}
        onChange={(e) => onRadiusChange(Number(e.target.value))}
        className="p-2 rounded bg-slate-700 text-white text-sm"
      >
        {RADIUS_OPTIONS.map((r) => (
          <option key={r} value={r}>
            Within {r}km
          </option>
        ))}
      </select>
    </div>
  );
}

export default FeedFilter;