import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    label: 'Community',
    path: '/home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75S6.615 21.75 12 21.75 21.75 17.385 21.75 12 17.385 2.25 12 2.25z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a8.25 8.25 0 0115 0" />
      </svg>
    ),
  },
  {
    label: 'Leaderboard',
    path: '/leaderboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/Bc7ZA8ch7n',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.04.036.051a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
];

// Build the shareable profile path for the current user
const getProfilePath = () => {
  const email = localStorage.getItem('userEmail') || '';
  const username = email.split('@')[0];
  return username ? `/profile/${username}` : '/profile';
};

function NavItem({ item, isActive, onClick, expanded }) {
  const handleClick = () => {
    if (item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      onClick(item.path);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={!expanded ? item.label : undefined}
      className={`w-full flex items-center py-2 rounded-lg text-sm transition-all duration-150 group ${
        expanded ? 'gap-3 px-3' : 'justify-center px-0'
      } ${
        isActive
          ? 'bg-blue-600/10 text-white border border-blue-500/20'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'
      }`}
    >
      <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : item.href ? 'text-indigo-500 group-hover:text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
        {item.icon}
      </span>
      {expanded && (
        <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
      )}
    </button>
  );
}

export default function Sidebar({ expanded, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Sync expanded state with breakpoint on mount
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    if (mq.matches !== expanded) onToggle();
    const handler = (e) => { if (e.matches !== expanded) onToggle(); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []); // eslint-disable-line

  return (
    <aside
      className="fixed left-0 top-16 bottom-0 flex flex-col overflow-hidden"
      style={{
        width: expanded ? '220px' : '52px',
        backgroundColor: '#060e1c',
        borderRight: '1px solid #0f1a2e',
        zIndex: 40,
        transition: 'width 200ms ease',
      }}
    >
      {/* Nav items */}
      <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 gap-0.5">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const resolvedPath = item.label === 'Profile' ? getProfilePath() : item.path;
            return (
              <NavItem
                key={item.label}
                item={{ ...item, path: resolvedPath }}
                isActive={
                  item.label === 'Profile'
                    ? location.pathname.startsWith('/profile')
                    : location.pathname === item.path
                }
                onClick={navigate}
                expanded={expanded}
              />
            );
          })}
        </div>
      </div>

      {/* Toggle arrow */}
      <div className="flex-shrink-0 border-t border-slate-800/60 py-3 flex justify-center">
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          <svg
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
