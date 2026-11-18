import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogoMark } from './LogoMark.tsx';

export type ActivePage = 'home' | 'analyze' | 'history' | 'extension';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, sectionId?: string) => void;
  historyCount: number;
}

export function Navbar({ activePage, onNavigate, historyCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (page: ActivePage, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(page, sectionId);
  };

  const navItemClass = (isActive: boolean) =>
    `relative text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 py-1.5 ${
      isActive ? 'text-[#0F172A]' : 'text-[#475569] hover:text-[#0F172A]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDFCFA]/92 backdrop-blur-md border-b border-[#E3DFD6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 lg:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3730A3] rounded-md"
        >
          <LogoMark size={34} />
          <span className="font-display text-lg font-bold tracking-tight text-[#0F172A]">
            AgreeWise
          </span>
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6">
          {(
            [
              { label: 'Home', page: 'home' as ActivePage, active: activePage === 'home' },
              {
                label: 'Analyze Document',
                page: 'analyze' as ActivePage,
                active: activePage === 'analyze',
              },
              { label: 'Features', page: 'home' as ActivePage, section: 'features', active: false },
              {
                label: 'How It Works',
                page: 'home' as ActivePage,
                section: 'how-it-works',
                active: false,
              },
              {
                label: `Analysis History${historyCount > 0 ? ` (${historyCount})` : ''}`,
                page: 'history' as ActivePage,
                active: activePage === 'history',
              },
              {
                label: 'Extension',
                page: 'extension' as ActivePage,
                active: activePage === 'extension',
              },
              { label: 'About', page: 'home' as ActivePage, section: 'about', active: false },
            ] as const
          ).map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                handleLinkClick(item.page, 'section' in item ? item.section : undefined)
              }
              className={navItemClass(item.active)}
            >
              {item.label}
              {item.active && (
                <motion.span
                  layoutId="nav-active-underline"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 right-0 bottom-0 h-0.5 bg-gradient-to-r from-[#4338CA] to-[#2563EB] rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('analyze')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] via-[#4338CA] to-[#2563EB] hover:opacity-95 rounded-lg shadow-xs transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3730A3]"
          >
            Get Started
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2 rounded-lg text-[#334155] hover:bg-[#EFECE5] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-t border-[#E3DFD6] bg-[#FDFCFA] px-4 py-4 space-y-1"
          >
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#EFECE5] min-h-[44px]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('analyze')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#EFECE5] min-h-[44px]"
            >
              Analyze Document
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('home', 'features')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#EFECE5] min-h-[44px]"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('home', 'how-it-works')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#EFECE5] min-h-[44px]"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('history')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#EFECE5] min-h-[44px]"
            >
              Analysis History{historyCount > 0 ? ` (${historyCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('extension')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#EFECE5] min-h-[44px]"
            >
              Chrome Extension
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('home', 'about')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] hover:bg-[#EFECE5] min-h-[44px]"
            >
              About
            </button>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleLinkClick('analyze')}
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#3730A3] to-[#2563EB] rounded-lg text-center min-h-[44px]"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
