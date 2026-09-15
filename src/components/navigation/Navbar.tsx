import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { APP_NAME } from '../../lib/env';
import { cn } from '../../lib/utils';

interface NavbarProps {
  transparent?: boolean;
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Safety', href: '#safety' },
  { label: 'RideShare', href: '#rideshare' },
];

export function Navbar({ transparent = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
        transparent
          ? 'bg-transparent'
          : 'bg-white/90 backdrop-blur-md border-b border-surface-200/60 shadow-sm'
      )}
    >
      <nav className="page-container" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-surface-900 hover:opacity-80 transition-opacity"
            aria-label={`${APP_NAME} — Home`}
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-lg tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="btn-secondary btn-sm"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="btn-primary btn-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-surface-100 py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-surface-700 hover:text-surface-900 hover:bg-surface-100"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2 px-1">
              <Link
                to="/login"
                className="btn-secondary btn-sm flex-1 justify-center"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="btn-primary btn-sm flex-1 justify-center"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
