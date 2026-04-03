import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Gallery', path: '/gallery' },
    { name: 'Service', path: '/services' },
    { name: 'Journal', path: '/journal' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
        ? 'bg-surface/90 backdrop-blur-md border-b border-outline-variant/10 py-3 shadow-lg'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="w-full px-6 md:px-12 flex items-center justify-between">
        {/* LEFT: Logo + Name */}
        <div className="flex items-center gap-4">
          <img
            src="/assets/sp.jpg"
            alt="Singleframe Logo"
            className="h-10 w-10 object-cover border border-white/10"
          />

          <Link
            to="/"
            className="hidden sm:block text-xl font-headline tracking-tight text-on-surface uppercase font-bold"
          >
            Singleframe
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface/70 hover:text-on-surface transition"
              >
                {link.name}

                {isActive(link.path) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 -bottom-1 w-full h-[2px] bg-primary"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6">
            <ThemeToggle />

            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3 text-[10px] tracking-[0.2em] uppercase bg-primary text-on-primary hover:bg-primary-container transition font-bold"
            >
              Book a Shoot
            </button>
          </div>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden text-on-surface p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-outline-variant/10 overflow-hidden"
          >
            <div className="px-6 py-12 flex flex-col items-center gap-8 shadow-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl font-headline uppercase tracking-widest ${isActive(link.path)
                    ? 'text-primary'
                    : 'text-on-surface'
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="w-full h-px bg-outline-variant/10" />

              <div className="flex flex-col items-center gap-6 w-full">
                <ThemeToggle />

                <button
                  onClick={() => {
                    navigate('/contact');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-4 bg-primary text-on-primary text-[10px] tracking-[0.3em] uppercase font-bold"
                >
                  Book a Shoot
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;