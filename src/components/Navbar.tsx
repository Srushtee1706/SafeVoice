import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const ADMIN_EMAILS = ['safevoiceforwomen@gmail.com', 'piyushydv011@gmail.com', 'aditiraj0205@gmail.com'];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  newFunction();

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-pink-100 via-white to-pink-200 shadow-xl border-b border-pink-200 backdrop-blur-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center group transform transition-transform duration-300 hover:scale-110"
            >
              <span className="relative">
                <Heart className="h-8 w-8 text-pink-500 animate-bounce drop-shadow-lg" />
                <span className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-70"></span>
              </span>
              <div className="ml-2">
                <span className="text-2xl font-extrabold text-pink-600 drop-shadow-sm tracking-wide font-serif">SafeVoice</span>
                <p className="text-xs text-gray-600 hidden md:block animate-fade-in italic font-light">
                  Your story. Your strength.
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/stories" className="nav-link">Stories</Link>
            <Link to="/share-story" className="nav-link">Share your Story</Link>
            <Link to="/resources" className="nav-link">Resources</Link>
            <Link to="/faqs" className="nav-link">FAQs</Link>
            <Link to="/about" className="nav-link">About</Link>
            {user ? (
              <div className="relative flex items-center space-x-4">
                {isAdmin && (
                  <Link to="/admin" className="admin-link">
                    Admin Panel
                  </Link>
                )}
                <span className="text-gray-700 font-mono bg-pink-100 px-2 py-1 rounded shadow-inner">
                  Anonymous_{user.uid.slice(0, 8)}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-4 py-2 rounded-md shadow-md hover:from-pink-600 hover:to-pink-500 transition-all duration-200 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-pink-500 to-pink-400 text-white px-4 py-2 rounded-md shadow-md hover:from-pink-600 hover:to-pink-500 transition-all duration-200 font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-pink-500 hover:text-pink-700 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/90 rounded-lg shadow-lg mt-2 border border-pink-100 animate-fade-in-down">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="mobile-link">Home</Link>
              <Link to="/stories" className="mobile-link">Stories</Link>
              <Link to="/share-story" className="mobile-link">Share your Story</Link>
              <Link to="/resources" className="mobile-link">Resources</Link>
              <Link to="/faqs" className="mobile-link">FAQs</Link>
              <Link to="/about" className="mobile-link">About</Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="mobile-admin-link">
                      Admin Panel
                    </Link>
                  )}
                  <span className="block text-gray-700 px-3 py-2 font-mono bg-pink-100 rounded shadow-inner">
                    Anonymous_{user.uid.slice(0, 8)}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="block text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 px-3 py-2 rounded-md font-semibold shadow"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Custom styles for nav links */}
      <style>{`
        .nav-link {
          position: relative;
          color: #be185d;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .nav-link:hover {
          background: linear-gradient(90deg, #f9a8d4 0%, #f472b6 100%);
          color: #fff;
          box-shadow: 0 2px 8px 0 #f472b633;
        }
        .admin-link {
          color: #f59e42;
          font-weight: bold;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          background: linear-gradient(90deg, #fef08a 0%, #fde68a 100%);
          box-shadow: 0 2px 8px 0 #fde68a33;
          transition: background 0.2s, color 0.2s;
        }
        .admin-link:hover {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e42 100%);
          color: #fff;
        }
        .mobile-link {
          display: block;
          color: #be185d;
          font-weight: 500;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          transition: background 0.2s, color 0.2s;
        }
        .mobile-link:hover {
          background: linear-gradient(90deg, #f9a8d4 0%, #f472b6 100%);
          color: #fff;
        }
        .mobile-admin-link {
          display: block;
          color: #f59e42;
          font-weight: bold;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          background: linear-gradient(90deg, #fef08a 0%, #fde68a 100%);
          box-shadow: 0 2px 8px 0 #fde68a33;
          transition: background 0.2s, color 0.2s;
        }
        .mobile-admin-link:hover {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e42 100%);
          color: #fff;
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease;
        }
      `}</style>
    </nav>
  );

  function newFunction() {
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }, []);
  }
}