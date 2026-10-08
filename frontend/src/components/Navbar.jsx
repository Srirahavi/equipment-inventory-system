import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ROLE_CONFIG = {
  institution: { label: 'Institution',  gradient: 'from-indigo-500 to-indigo-600'  },
  bmeu:        { label: 'BMEU Officer', gradient: 'from-emerald-500 to-teal-600'   },
  rdhs:        { label: 'RDHS Officer', gradient: 'from-violet-500 to-purple-600'  }
};

// ── Sun icon ──────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

// ── Moon icon ─────────────────────────────────────────────────────────────────
function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const user   = JSON.parse(localStorage.getItem('user') || '{}');
  const config = ROLE_CONFIG[user.role] || { label: user.role, gradient: 'from-slate-500 to-slate-600' };
  const isDark = theme === 'dark';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = (user.name || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <nav className="sticky top-0 z-50
                    bg-white/80 dark:bg-slate-900/80
                    backdrop-blur-xl
                    border-b border-slate-200/70 dark:border-slate-700/60
                    shadow-sm shadow-slate-100 dark:shadow-slate-900
                    transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m0 5.625c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Equipment Inventory</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight font-medium uppercase tracking-wider">Management System</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Role badge */}
            <div className={`hidden sm:flex items-center gap-1.5 bg-gradient-to-r ${config.gradient} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              {config.label}
            </div>

            {/* ── Theme toggle ── */}
            <button
              onClick={toggle}
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
              style={{
                background: isDark
                  ? 'linear-gradient(to right, #6366f1, #8b5cf6)'
                  : 'linear-gradient(to right, #e2e8f0, #cbd5e1)'
              }}
            >
              {/* Track icons */}
              <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
                <SunIcon />
                <MoonIcon />
              </span>
              {/* Thumb */}
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md flex items-center justify-center
                            transition-all duration-300 ease-in-out
                            ${isDark ? 'translate-x-7 bg-slate-800 text-violet-300' : 'translate-x-0.5 bg-white text-amber-500'}`}
              >
                {isDark ? <MoonIcon /> : <SunIcon />}
              </span>
            </button>

            {/* User avatar dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(p => !p)}
                className="flex items-center gap-2.5
                           bg-slate-50 dark:bg-slate-800
                           hover:bg-slate-100 dark:hover:bg-slate-700
                           border border-slate-200 dark:border-slate-700
                           rounded-xl px-3 py-1.5 transition-all"
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {initials}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{user.username}</p>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52
                                  bg-white dark:bg-slate-800
                                  rounded-2xl shadow-xl
                                  border border-slate-100 dark:border-slate-700
                                  z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">@{user.username}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                                   text-red-600 dark:text-red-400
                                   hover:bg-red-50 dark:hover:bg-red-500/10
                                   transition font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
