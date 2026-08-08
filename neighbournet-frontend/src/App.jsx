import Login from './pages/Login';
import useAuthStore from './store/authStore';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
        <p className="text-slate-400">{user?.email}</p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded font-semibold"
        >
          Logout
        </button>
      </div>
    );
  }

  return <Login />;
}

export default App;