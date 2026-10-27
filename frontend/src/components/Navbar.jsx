import React from 'react';
import { Menu, Database, Plus, BookPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({ onOpenBookModal, onOpenSessionModal, setIsMobileOpen }) => {
  const { dbHealth, openCompassModal } = useApp();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-parchment-200 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-parchment-200 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-forest-700 uppercase tracking-widest">
            FLEXI College Project
          </span>
          <h1 className="text-sm font-medium text-ink-600">
            ReadSphere Reading Analytics Platform
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Local MongoDB Compass Live Indicator */}
        <button
          onClick={openCompassModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-xs ${
            dbHealth.isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
          }`}
          title="Click to view MongoDB Compass instructions"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              dbHealth.isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <Database className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Local MongoDB:</span>
          <span className="font-semibold">
            {dbHealth.isConnected ? 'Connected' : 'Offline'}
          </span>
        </button>

        {/* Quick Log Session Button */}
        <button
          onClick={onOpenSessionModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-xs transition-all hover:shadow active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-300" />
          <span className="hidden sm:inline">Log Session</span>
        </button>

        {/* Quick Add Book Button */}
        <button
          onClick={onOpenBookModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-parchment-100 text-forest-800 border border-parchment-300 text-xs font-semibold transition-all hover:border-forest-600"
        >
          <BookPlus className="w-3.5 h-3.5 text-forest-600" />
          <span>Add Book</span>
        </button>
      </div>
    </header>
  );
};

