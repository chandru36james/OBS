import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { loginWithGoogle } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export const Login: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err) {
      setError('Failed to login. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-100 font-sans">
      <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold italic serif mb-4 text-neutral-900">Admin Login</h1>
          <p className="text-neutral-500 text-sm">Access your content management dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        {user && !isAdmin && (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-lg mb-6 text-sm border border-amber-100">
            You are logged in as {user.email}, but you don't have admin access.
          </div>
        )}

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-neutral-900 text-white p-4 rounded-xl font-semibold hover:bg-neutral-800 transition-all active:scale-95"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>

        <div className="mt-10 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">
            Secure Access Only
          </p>
        </div>
      </div>
    </div>
  );
};
