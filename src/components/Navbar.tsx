import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationDrawer } from './common/NotificationDrawer';
import { 
  Sprout, 
  Store, 
  Building2, 
  LayoutDashboard, 
  Bell, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  IndianRupee,
  Leaf,
  Bot,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    notifications, 
    impactStats, 
    resetToDemoData 
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Left: Brand & Rythu Bazaar Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
                <Sprout className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight leading-tight">
                    AI Surplus Matcher
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    రైతు బజార్
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Zero Vegetable Waste &bull; Direct Farmer Redistribution
                </p>
              </div>
            </div>

            {/* Middle: Role Selector Navigation Tabs */}
            <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/70 shadow-inner">
              <button
                onClick={() => setCurrentRole('farmer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentRole === 'farmer'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Farmer / Vendor</span>
              </button>

              <button
                onClick={() => setCurrentRole('recipient')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentRole === 'recipient'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Recipient Org</span>
              </button>

              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Hub</span>
              </button>
            </div>

            {/* Right: Quick Impact Pill, Notifications, Reset */}
            <div className="flex items-center gap-2">
              {/* Quick Impact Stats Pill (Desktop) */}
              <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs">
                <div className="flex items-center gap-1 text-emerald-800 font-bold">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{impactStats.totalKgRedistributed} kg</span>
                  <span className="font-normal text-emerald-600 text-[10px]">saved</span>
                </div>
                <div className="w-px h-3.5 bg-emerald-200" />
                <div className="flex items-center gap-0.5 text-emerald-800 font-bold">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{impactStats.farmerLossAvoidedInr.toLocaleString('en-IN')}</span>
                  <span className="font-normal text-emerald-600 text-[10px]">recovered</span>
                </div>
              </div>

              {/* n8n AI Assistant button */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-n8n-chat'))}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
                title="Chat with n8n AI Assistant"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden md:inline">AI Chat</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition border border-gray-200"
                title="View Alerts & Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Demo Reset */}
              <button
                onClick={() => {
                  if (confirm('Reset to initial Rythu Bazaar demo listings & state?')) {
                    resetToDemoData();
                  }
                }}
                className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-gray-200"
                title="Reset Demo Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
