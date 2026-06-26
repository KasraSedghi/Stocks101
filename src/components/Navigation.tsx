'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, User, LogOut, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/config/routes';

const NAV_LINKS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  { href: ROUTES.TRANSACTIONS, label: 'Transactions' },
  { href: ROUTES.WATCHLIST, label: 'Watchlist' },
  { href: ROUTES.CALCULATOR, label: 'Calculator', icon: Calculator },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <nav className="sticky top-0 z-sticky bg-dark-base/80 backdrop-blur-md border-b border-dark-border">
      <div className="container-max flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-white hidden sm:inline">ShadowVest</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors duration-normal pb-2 border-b-2 border-transparent',
                isActive(link.href)
                  ? 'text-brand-purple border-b-brand-purple'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-2 hover:bg-dark-surface rounded-lg transition-colors text-gray-400 hover:text-white"
              aria-label="User menu"
            >
              <User size={20} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-panel border border-dark-border rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-normal">
                <Link
                  href={ROUTES.SETTINGS}
                  className="block px-4 py-2 text-sm text-white hover:bg-dark-surface transition-colors rounded-t-lg"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Profile Settings
                  </div>
                </Link>
                <button
                  onClick={async () => {
                    await fetch(ROUTES.API_AUTH_LOGOUT, { method: 'POST' });
                    window.location.href = ROUTES.LOGIN;
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-neon-red hover:bg-dark-surface transition-colors rounded-b-lg border-t border-dark-border"
                >
                  <div className="flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-dark-surface rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-dark-panel border-t border-dark-border animate-in fade-in slide-in-from-top duration-normal">
          <div className="container-max py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-400 hover:bg-dark-surface hover:text-white'
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
