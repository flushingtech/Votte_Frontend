import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import votteLogo from "../assets/votte_favicon.png";
import { checkAdminStatus, getContributorRequestCount, search } from "../api/API";

function Navbar({ userName, profilePicture }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [wordIdx, setWordIdx]     = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const ROTATE_WORDS = ['projects', 'developers', 'events'];

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
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "";

  useEffect(() => {
    const fetchData = async () => {
      if (userEmail) {
        const adminStatus = await checkAdminStatus(userEmail);
        setIsAdmin(adminStatus);

        // Fetch contributor request count
        try {
          const count = await getContributorRequestCount(userEmail);
          setRequestCount(count);
        } catch (error) {
          console.error('Error fetching request count:', error);
        }
      }
    };

    fetchData();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [userEmail]); // Runs when userEmail changes

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setResults(null); setSearchOpen(false); return; }
    setSearching(true);
    setSearchOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await search(val.trim());
        setResults(data);
      } catch { setResults(null); }
      finally { setSearching(false); }
    }, 300);
  }, []);

  const hasResults = results && (results.projects.length || results.developers.length || results.events.length);

  const AVATAR_COLORS = ['#1d4ed8','#7c3aed','#0891b2','#059669','#d97706','#dc2626'];
  const avatarColor = (email) => AVATAR_COLORS[(email || '').charCodeAt(0) % AVATAR_COLORS.length];

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
  };

  const goToAdminPage = () => {
    setIsDropdownOpen(false);
    navigate("/admin");
  };

  const goToHome = () => {
    navigate("/home");
  };
              

  return (
    <nav className="relative z-50">
      {/* Absolute logo positioned at the very left/top of the navbar: visible on sm+ */}
    <div className="flex absolute left-0 top-1/2 transform -translate-y-1/2 items-center" style={{ width: 220, zIndex: 60 }}>
  <div className="w-full flex items-center justify-start pl-6">
          <button onClick={goToHome} className="flex items-center space-x-3 group hover:scale-105 transition-all duration-200">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img src={votteLogo} alt="Votte Logo" className="relative h-10 w-10 rounded-xl shadow-lg border border-slate-600 bg-white p-1" />
            </div>
            <div>
              <h1 className="hidden sm:block text-lg font-bold text-white">Votte</h1>
            </div>
          </button>
        </div>
      </div>

      {/* User block (absolute to full-width nav right edge) */}
      <div className="flex absolute right-0 top-1/2 transform -translate-y-1/2 pr-6" style={{ zIndex: 70 }}>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right mr-3">
            <p className="text-sm font-medium text-white">{userName || userEmail?.split('@')[0] || 'Guest'}</p>
            <p className="text-xs text-slate-400">{isAdmin ? 'Administrator' : 'Member'}</p>
          </div>
          <div className="relative">
            {requestCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10 animate-pulse">
                {requestCount}
              </div>
            )}
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-600 rounded-xl px-3 py-2 transition-all duration-200 hover:shadow-lg group"
            >
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-8 h-8 rounded-lg object-cover border border-slate-500" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">{(userName || userEmail?.split('@')[0])?.charAt(0)?.toUpperCase() || 'G'}</div>
              )}
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Dropdown moved here so it's colocated with the trigger button (prevents duplicate UI) */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl backdrop-blur-sm z-[9999] overflow-hidden">
                {/* Dropdown Header */}
                <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-700/50 to-slate-600/50">
                  <p className="text-sm font-medium text-white truncate">
                    {userName || userEmail?.split('@')[0] || 'Guest'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isAdmin ? '👑 Administrator' : '👤 Team Member'}
                  </p>
                </div>

                {/* Dropdown Items */}
                <div className="py-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={goToAdminPage}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Admin Panel</span>
                      </button>
                      <div className="border-t border-slate-700/50 my-2"></div>
                    </>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Main Navbar (fixed height) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm border-b border-slate-700/50 shadow-2xl h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-16">

          {/* Search bar + dropdown */}
          <div className="hidden sm:flex absolute inset-0 items-center pointer-events-none">
            <div className="w-full flex justify-center" style={{ paddingLeft: '236px', paddingRight: '252px' }}>
              <div ref={searchRef} className="w-full pointer-events-auto relative">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                    setSearchOpen(false);
                  }}
                  role="search"
                  className="relative"
                >
                  {/* White pill wrapper — everything lives inside this */}
                  <div className="navbar-search flex items-center w-full h-10 rounded-full px-3 gap-2"
                    style={{ background: '#fff', border: '1px solid #d1d5db', transition: 'box-shadow 180ms ease, border-color 180ms ease' }}>

                    {/* Black icon */}
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#111827" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                    </svg>

                    {/* Input + animated placeholder */}
                    <div className="relative flex-1 flex items-center">
                      <input
                        name="search"
                        aria-label="Search"
                        value={query}
                        onChange={handleSearchChange}
                        onFocus={(e) => {
                          setSearchFocused(true);
                          e.currentTarget.closest('.navbar-search').style.boxShadow = '0 0 0 3px rgba(59,130,246,.2)';
                          e.currentTarget.closest('.navbar-search').style.borderColor = 'rgba(59,130,246,.5)';
                          if (results) setSearchOpen(true);
                        }}
                        onBlur={(e) => {
                          setSearchFocused(false);
                          e.currentTarget.closest('.navbar-search').style.boxShadow = '';
                          e.currentTarget.closest('.navbar-search').style.borderColor = '';
                        }}
                        className="w-full bg-transparent focus:outline-none text-sm"
                        style={{ color: '#111827' }}
                        autoComplete="off"
                      />
                      {/* Animated placeholder — only when empty + unfocused */}
                      {!query && !searchFocused && (
                        <div className="absolute inset-0 flex items-center gap-1 pointer-events-none select-none"
                          style={{ fontSize: 14 }}>
                          <span style={{ color: 'rgba(17,24,39,.7)' }}>Find</span>
                          <span style={{
                            color: 'rgba(17,24,39,.7)', fontStyle: 'italic',
                            transition: 'opacity 220ms ease, transform 220ms ease',
                            opacity: wordVisible ? 1 : 0,
                            transform: wordVisible ? 'translateY(0)' : 'translateY(4px)',
                            display: 'inline-block',
                          }}>
                            {ROTATE_WORDS[wordIdx]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </form>

                {/* Dropdown */}
                {searchOpen && (
                  <div className="absolute top-full mt-2 w-full bg-slate-900 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden z-[9999]">
                    {searching && (
                      <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Searching…
                      </div>
                    )}

                    {!searching && !hasResults && results && (
                      <div className="px-4 py-3 text-sm text-slate-500">No results for "{query}"</div>
                    )}

                    {!searching && hasResults && (
                      <>
                        {/* Projects */}
                        {results.projects.length > 0 && (
                          <div>
                            <div className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Projects</div>
                            {results.projects.map(p => (
                              <button key={p.id} onMouseDown={() => { navigate(`/idea/${p.id}`, { state: { eventId: p.event_id } }); setSearchOpen(false); setQuery(''); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/70 transition-colors text-left">
                                <div className="w-8 h-8 rounded flex-shrink-0 overflow-hidden bg-slate-800">
                                  {p.image_url
                                    ? <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
                                        </svg>
                                      </div>
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-white font-medium truncate">{p.title}</p>
                                  <p className="text-xs text-slate-500 truncate">{p.contributor_name || p.email?.split('@')[0]}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Developers */}
                        {results.developers.length > 0 && (
                          <div>
                            <div className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Developers</div>
                            {results.developers.map(d => (
                              <button key={d.email} onMouseDown={() => { navigate(`/profile/${d.email}`); setSearchOpen(false); setQuery(''); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/70 transition-colors text-left">
                                {d.profile_picture
                                  ? <img src={d.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  : <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                      style={{ backgroundColor: avatarColor(d.email) }}>
                                      {(d.name || d.email || 'U').slice(0,2).toUpperCase()}
                                    </div>
                                }
                                <div className="min-w-0">
                                  <p className="text-sm text-white font-medium truncate">{d.name || d.email?.split('@')[0]}</p>
                                  <p className="text-xs text-slate-500 truncate">{d.email}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Events */}
                        {results.events.length > 0 && (
                          <div>
                            <div className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Events</div>
                            {results.events.map(ev => (
                              <button key={ev.id} onMouseDown={() => { if (ev.link) window.open(ev.link, '_blank'); setSearchOpen(false); setQuery(''); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/70 transition-colors text-left">
                                <div className="w-8 h-8 rounded flex-shrink-0 bg-purple-900/50 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"/>
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-white font-medium truncate">{ev.title}</p>
                                  <p className="text-xs text-slate-500">{ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between h-16">

            {/* Spacer matching sidebar width so navbar content doesn't overlap the logo area */}
            <div className="hidden sm:block" style={{ width: 220 }} aria-hidden="true" />

            </div>
        </div>
      </div>

      {/* Subtle bottom border glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </nav>
  );
}

export default Navbar;
