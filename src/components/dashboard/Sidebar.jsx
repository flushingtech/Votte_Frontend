import React, { useState } from 'react';
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
];

function NavItem({ item, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(item.path)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
        isActive
          ? 'bg-blue-600/10 text-white border border-blue-500/20'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'
      }`}
    >
      <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
        {item.icon}
      </span>
      <span className="font-medium">{item.label}</span>
    </button>
  );
}


export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      // fixed so it doesn't take up layout width and won't push the main content
      className="fixed left-0 top-16 bottom-0 flex flex-col overflow-hidden"
      style={{
        width: '220px',
        backgroundColor: '#060e1c',
        borderRight: '1px solid #0f1a2e',
        zIndex: 40,
      }}
    >
      {/* Logo */}
      {/* Nav */}
      <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 gap-0.5">
        {/* Main nav items */}
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              isActive={location.pathname === item.path}
              onClick={navigate}
            />
          ))}
        </div>

      </div>

    </aside>
  );
}
