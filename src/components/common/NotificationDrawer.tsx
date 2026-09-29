import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Bell, 
  Sparkles, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  CheckCheck 
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'match_alert':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'pickup_update':
        return <Truck className="w-4 h-4 text-sky-600" />;
      case 'expiry_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'waste_prevented':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base leading-none">Notifications & Alerts</h3>
              <p className="text-xs text-emerald-200 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread surplus alerts` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 px-2 py-1 rounded-md flex items-center gap-1 transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No alerts at this moment</p>
              <p className="text-xs text-gray-400 mt-1">You will receive live alerts when surplus is matched.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  notif.read
                    ? 'bg-white border-gray-100 hover:border-gray-200 text-gray-600'
                    : 'bg-emerald-50/60 border-emerald-200/80 hover:bg-emerald-50 text-gray-900 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-gray-100 shadow-xs shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
          AI Surplus Matcher &bull; Rythu Bazaar Automated Dispatch Engine
        </div>
      </div>
    </div>
  );
};
