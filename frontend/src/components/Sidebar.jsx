import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  History,
  Target,
  BarChart3,
  Database,
  PlusCircle,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ onOpenBookModal, onOpenSessionModal, isMobileOpen, setIsMobileOpen }) => {
  const { dbHealth, openCompassModal } = useApp();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/books', label: 'My Books', icon: BookOpen },
    { to: '/sessions', label: 'Reading Sessions', icon: History },
    { to: '/goals', label: 'Reading Goals', icon: Target },
    { to: '/analytics', label: 'Analytics & Insights', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-parchment-300 flex flex-col z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-parchment-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-md">
              <BookMarked className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-ink-900 block leading-none">
                ReadSphere
              </span>
              <span className="text-[11px] font-medium tracking-wider text-forest-700 uppercase mt-0.5 block">
                Smart Reading Tracker
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="p-4 space-y-2 border-b border-parchment-200 bg-parchment-50/50">
          <button
            onClick={() => {
              onOpenSessionModal();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition-all hover:shadow active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            Log Reading Session
          </button>
          <button
            onClick={() => {
              onOpenBookModal();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-parchment-100 text-forest-800 border border-parchment-300 text-xs font-semibold transition-all hover:border-forest-600"
          >
            <BookOpen className="w-4 h-4 text-forest-600" />
            Add New Book
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-700 text-white shadow-sm font-semibold'
                      : 'text-ink-700 hover:text-ink-950 hover:bg-parchment-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-ink-500'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status Widget (MongoDB Compass) */}
        <div className="p-4 border-t border-parchment-200 bg-parchment-50">
          <button
            onClick={openCompassModal}
            className="w-full text-left p-3 rounded-xl border border-parchment-300 bg-white hover:border-forest-600 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-forest-700" />
                MongoDB Compass
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dbHealth.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </div>
            <p className="text-xs font-medium text-ink-900 group-hover:text-forest-700 transition-colors">
              {dbHealth.isConnected ? 'Local MongoDB Connected' : 'MongoDB Offline'}
            </p>
            <p className="text-[11px] text-ink-500 font-mono mt-0.5 truncate">
              mongodb://127.0.0.1:27017
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};

