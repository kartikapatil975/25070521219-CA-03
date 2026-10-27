import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Copy, Check, ExternalLink, X, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const CompassModal = () => {
  const { isCompassModalOpen, closeCompassModal, dbHealth, checkDbHealth } = useApp();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!isCompassModalOpen) return null;

  const connectionUri = 'mongodb://127.0.0.1:27017';

  const handleCopy = () => {
    navigator.clipboard.writeText(connectionUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkDbHealth();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-parchment-300 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-parchment-200 flex items-center justify-between bg-parchment-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-ink-900">
                MongoDB Compass & Local Database
              </h2>
              <p className="text-xs text-ink-500">
                Verified Local Community Server Connection
              </p>
            </div>
          </div>
          <button
            onClick={closeCompassModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-parchment-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Real-time Status Card */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              dbHealth.isConnected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {dbHealth.isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {dbHealth.isConnected
                    ? 'Local MongoDB Community Server is Connected'
                    : 'Local MongoDB Community Server Unavailable'}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  Database: <span className="font-mono font-medium">readsphere</span> • Port:{' '}
                  <span className="font-mono font-medium">27017</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-current hover:bg-black/5 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>

          {/* Connection URI Box */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-2">
              MongoDB Compass Connection String
            </label>
            <div className="flex items-center gap-2 bg-parchment-100 p-2.5 rounded-xl border border-parchment-300">
              <span className="font-mono text-sm text-forest-800 font-medium flex-1 px-2 select-all">
                {connectionUri}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-forest-700 text-white rounded-lg text-xs font-medium hover:bg-forest-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-ink-500 mt-1.5">
              Paste this into MongoDB Compass to inspect records directly.
            </p>
          </div>

          {/* Collections in readsphere database */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-2">
              Collections in Database <span className="font-mono font-bold">readsphere</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-parchment-50 rounded-xl border border-parchment-200 text-center">
                <span className="font-mono text-xs text-forest-700 font-semibold block">books</span>
                <span className="text-lg font-bold text-ink-900 mt-1 block">
                  {dbHealth.collections.books}
                </span>
                <span className="text-[10px] text-ink-500">documents</span>
              </div>
              <div className="p-3 bg-parchment-50 rounded-xl border border-parchment-200 text-center">
                <span className="font-mono text-xs text-forest-700 font-semibold block">readingsessions</span>
                <span className="text-lg font-bold text-ink-900 mt-1 block">
                  {dbHealth.collections.readingsessions}
                </span>
                <span className="text-[10px] text-ink-500">documents</span>
              </div>
              <div className="p-3 bg-parchment-50 rounded-xl border border-parchment-200 text-center">
                <span className="font-mono text-xs text-forest-700 font-semibold block">readinggoals</span>
                <span className="text-lg font-bold text-ink-900 mt-1 block">
                  {dbHealth.collections.readinggoals}
                </span>
                <span className="text-[10px] text-ink-500">documents</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 pt-2 border-t border-parchment-200">
            <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
              How to view records in MongoDB Compass
            </h4>
            <ol className="text-xs text-ink-700 space-y-2 list-decimal list-inside leading-relaxed bg-parchment-50/70 p-4 rounded-xl border border-parchment-200">
              <li>
                Open <strong>MongoDB Compass</strong> from your Applications folder.
              </li>
              <li>
                In the "New Connection" screen, enter URI: <code className="bg-white px-1.5 py-0.5 rounded border border-parchment-300 font-mono text-forest-700">mongodb://127.0.0.1:27017</code> and click <strong>Connect</strong>.
              </li>
              <li>
                In the left sidebar, click the database named <code className="bg-white px-1.5 py-0.5 rounded border border-parchment-300 font-mono text-forest-700">readsphere</code>.
              </li>
              <li>
                Click on the <code className="bg-white px-1.5 py-0.5 rounded border border-parchment-300 font-mono">books</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-parchment-300 font-mono">readingsessions</code>, or <code className="bg-white px-1.5 py-0.5 rounded border border-parchment-300 font-mono">readinggoals</code> collections.
              </li>
              <li>
                You can now view, query, edit, and verify all live records saved by ReadSphere!
              </li>
            </ol>
          </div>

          {/* Local mongod troubleshooting */}
          {!dbHealth.isConnected && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                MongoDB Community Server is not running
              </p>
              <p>To start your local MongoDB service on macOS:</p>
              <pre className="bg-amber-100/70 p-2 rounded text-[11px] font-mono text-ink-900 overflow-x-auto">
                brew services start mongodb-community
              </pre>
              <p className="opacity-90">Or run the mongod daemon directly in terminal:</p>
              <pre className="bg-amber-100/70 p-2 rounded text-[11px] font-mono text-ink-900 overflow-x-auto">
                mongod --dbpath ~/data/db
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-parchment-50 border-t border-parchment-200 flex justify-end rounded-b-2xl">
          <button
            onClick={closeCompassModal}
            className="px-5 py-2 bg-forest-700 text-white rounded-xl text-sm font-medium hover:bg-forest-800 transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

