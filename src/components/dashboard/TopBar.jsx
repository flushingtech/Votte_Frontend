import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROTATE_WORDS = ['projects', 'developers', 'events'];

export default function TopBar({ userName, profilePicture, userEmail, isAdmin, onSignOut }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue]   = useState('');
  const [focused, setFocused]           = useState(false);
  const [wordIdx, setWordIdx]           = useState(0);
  const [wordVisible, setWordVisible]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % ROTATE_WORDS.length);
        setWordVisible(true);
      }, 220);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  const initials = (userName || userEmail || 'G')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="flex items-center gap-4 px-6 flex-shrink-0"
      style={{
        height: '52px',
        backgroundColor: '#060e1c',
        borderBottom: '1px solid #0f1a2e',
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            boxShadow: focused ? '0 0 0 2px rgba(59,130,246,.25)' : 'none',
            position: 'relative',
          }}
        >
          {/* Black search icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            strokeWidth={2} stroke="#111827"
            className="w-3.5 h-3.5 flex-shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>

          {/* Input wrapper — holds the real input + fake animated placeholder */}
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="outline-none w-full text-sm"
              style={{ background: 'transparent', color: '#111827', caretColor: '#111827' }}
            />
            {/* Animated placeholder — only shown when input is empty and not focused */}
            {!searchValue && !focused && (
              <div
                style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center', gap: 3,
                  pointerEvents: 'none', userSelect: 'none',
                  fontSize: 14, color: 'rgba(17,24,39,.38)',
                }}
              >
                <span>Find</span>
                <span style={{
                  transition: 'opacity 220ms ease, transform 220ms ease',
                  opacity: wordVisible ? 1 : 0,
                  transform: wordVisible ? 'translateY(0)' : 'translateY(4px)',
                  fontStyle: 'italic',
                }}>
                  {ROTATE_WORDS[wordIdx]}
                </span>
              </div>
            )}
          </div>

          <kbd
            className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#6b7280' }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-all duration-150"
          style={{ border: '1px solid transparent' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Badge */}
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#3B82F6' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: '#1a2744' }} />

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-150 hover:bg-white/[0.04]"
            style={{ border: '1px solid transparent' }}
          >
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: '#0a1628', border: '1px solid #1E2D4A' }}
            >
              {profilePicture ? (
                <img src={profilePicture} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-blue-400">{initials}</span>
              )}
            </div>
            <span className="text-sm text-gray-400 hidden sm:block max-w-[100px] truncate">
              {userName || userEmail?.split('@')[0] || 'Guest'}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-3 h-3 text-gray-700 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-52 rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in"
              style={{
                backgroundColor: '#0a1628',
                border: '1px solid #1E2D4A',
              }}
            >
              {/* Header */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #1E2D4A' }}>
                <p className="text-sm font-semibold text-white truncate">
                  {userName || userEmail?.split('@')[0] || 'Guest'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {isAdmin ? 'Administrator' : 'Member'}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  View Profile
                </button>

                {isAdmin && (
                  <button
                    onClick={() => { navigate('/admin'); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </button>
                )}

                <div className="my-1" style={{ borderTop: '1px solid #1E2D4A' }} />

                <button
                  onClick={() => { onSignOut(); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
