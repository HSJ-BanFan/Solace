import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from '../widget/SearchModal';
import { HuePicker } from '../widget/HuePicker';
import { useState } from 'react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Archive', path: '/archive' },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showHuePicker, setShowHuePicker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <div className="z-50 sticky top-0 onload-animation">
        <div className="max-w-[var(--page-width)] mx-auto">
          <div className="card-base !rounded-t-none h-[4.5rem] flex items-center justify-between px-4">
            {/* Logo */}
            <Link
              to="/"
              className="btn-plain scale-animation rounded-lg h-11 px-4 font-bold active:scale-95"
            >
              <div className="flex items-center text-[var(--primary)]">
                <Icon icon="material-symbols:home-outline-rounded" className="text-[1.5rem] mr-2" />
                <span>Blog</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center">
              {navLinks.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className="btn-plain scale-animation rounded-lg h-11 font-bold px-4 active:scale-95"
                >
                  {l.name}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/admin"
                  className="btn-plain scale-animation rounded-lg h-11 font-bold px-4 active:scale-95"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center">
              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
                aria-label="Search"
              >
                <Icon icon="material-symbols:search-rounded" className="text-xl" />
              </button>

              {/* Hue Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowHuePicker(!showHuePicker)}
                  className="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
                  aria-label="Display Settings"
                >
                  <Icon icon="material-symbols:palette-outline" className="text-xl" />
                </button>
                <HuePicker isOpen={showHuePicker} />
              </div>

              <ThemeToggle />

              {/* Auth */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-50 text-sm">{user?.username}</span>
                  <button
                    onClick={handleLogout}
                    className="btn-plain scale-animation rounded-lg h-11 px-3 active:scale-95 text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to="/login"
                    className="btn-plain scale-animation rounded-lg h-11 px-3 active:scale-95 text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-regular scale-animation rounded-lg h-11 px-3 active:scale-95 text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="btn-plain scale-animation rounded-lg w-11 h-11 active:scale-90 md:hidden"
                aria-label="Menu"
              >
                <Icon icon="material-symbols:menu-rounded" className="text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          {showMobileMenu && (
            <div className="float-panel mt-1 mx-4 p-2 md:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className="group flex justify-between items-center py-2 pl-3 pr-1 rounded-lg
                    hover:bg-[var(--btn-plain-bg-hover)] transition"
                >
                  <span className="text-75 font-bold group-hover:text-[var(--primary)] transition">
                    {link.name}
                  </span>
                  <Icon icon="material-symbols:chevron-right-rounded" className="text-lg text-[var(--primary)]" />
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setShowMobileMenu(false)}
                    className="group flex justify-between items-center py-2 pl-3 pr-1 rounded-lg
                      hover:bg-[var(--btn-plain-bg-hover)] transition"
                  >
                    <span className="text-75 font-bold group-hover:text-[var(--primary)] transition">Admin</span>
                    <Icon icon="material-symbols:chevron-right-rounded" className="text-lg text-[var(--primary)]" />
                  </Link>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    className="w-full group flex justify-between items-center py-2 pl-3 pr-1 rounded-lg
                      hover:bg-[var(--btn-plain-bg-hover)] transition text-left"
                  >
                    <span className="text-75 font-bold group-hover:text-[var(--primary)] transition">Logout</span>
                    <Icon icon="material-symbols:logout-rounded" className="text-lg text-[var(--primary)]" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="group flex justify-between items-center py-2 pl-3 pr-1 rounded-lg
                      hover:bg-[var(--btn-plain-bg-hover)] transition"
                  >
                    <span className="text-75 font-bold group-hover:text-[var(--primary)] transition">Login</span>
                    <Icon icon="material-symbols:chevron-right-rounded" className="text-lg text-[var(--primary)]" />
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="group flex justify-between items-center py-2 pl-3 pr-1 rounded-lg
                      hover:bg-[var(--btn-plain-bg-hover)] transition"
                  >
                    <span className="text-75 font-bold group-hover:text-[var(--primary)] transition">Register</span>
                    <Icon icon="material-symbols:chevron-right-rounded" className="text-lg text-[var(--primary)]" />
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
}