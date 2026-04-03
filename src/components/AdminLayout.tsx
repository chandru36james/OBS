import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, Printer, MessageSquare } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { logout } from '../lib/firebase';
import { LogoutReminder } from './admin/LogoutReminder';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [showLogoutReminder, setShowLogoutReminder] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(15);

  const INACTIVITY_LIMIT = 90000; // 1.5 minutes in ms
  const WARNING_TIME = 15000; // 15 seconds in ms

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  React.useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  React.useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    let warningInterval: NodeJS.Timeout;

    const resetTimer = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      if (warningInterval) clearInterval(warningInterval);
      setShowLogoutReminder(false);
      setTimeLeft(15);

      inactivityTimeout = setTimeout(() => {
        setShowLogoutReminder(true);
        let count = 15;
        warningInterval = setInterval(() => {
          count -= 1;
          setTimeLeft(count);
          if (count <= 0) {
            clearInterval(warningInterval);
            handleLogout();
          }
        }, 1000);
      }, INACTIVITY_LIMIT - WARNING_TIME);
    };

    if (user && isAdmin) {
      const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
        if (inactivityTimeout) clearTimeout(inactivityTimeout);
        if (warningInterval) clearInterval(warningInterval);
      };
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fdfdfd]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Site Editor', icon: Settings, path: '/admin/site-editor' },
    { name: 'Pages', icon: FileText, path: '/admin/pages' },
    { name: 'Journal', icon: FileText, path: '/admin/posts' },
    { name: 'Brochures', icon: Printer, path: '/admin/brochures' },
    { name: 'Leads', icon: MessageSquare, path: '/admin/leads' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#fdfdfd] font-sans text-neutral-900 admin-root">
      {/* Sidebar */}
      <aside 
        className={`bg-[#0a0a0a] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-neutral-800`}
      >
        <div className="p-6 flex items-center justify-between border-b border-neutral-800">
          {isSidebarOpen && <span className="text-xl font-bold italic serif tracking-tight text-white">Admin Panel</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-neutral-800 rounded transition-colors text-white">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-4 p-3 rounded transition-all duration-200 group ${
                      isActive 
                        ? 'bg-neutral-800 text-white shadow-inner' 
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    <item.icon 
                      size={20} 
                      className={`transition-colors ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-white'}`} 
                    />
                    {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                    {isActive && isSidebarOpen && (
                      <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-neutral-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 w-full rounded hover:bg-red-900/20 text-red-400 transition-colors group"
          >
            <LogOut size={20} className="text-red-400/70 group-hover:text-red-400 transition-colors" />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 bg-[#fdfdfd]">
        <div className="max-w-6xl mx-auto text-neutral-900">
          <Outlet />
        </div>
      </main>

      <LogoutReminder 
        isOpen={showLogoutReminder}
        timeLeft={timeLeft}
        onStay={() => {
          setShowLogoutReminder(false);
          // The resetTimer will be triggered by the click event on the window
        }}
        onLogout={handleLogout}
      />
    </div>
  );
};
