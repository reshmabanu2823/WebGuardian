import React from 'react';

interface NotificationItem {
  id: string;
  time: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'INFO' | 'WARN';
  read: boolean;
}

interface NotificationsDrawerProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
}) => {
  return (
    <div className="fixed right-4 top-16 w-80 md:w-96 bg-[#20252C] border-2 border-[#574142] shadow-2xl p-4 rounded-sm z-50 font-mono-tech text-xs space-y-3 max-h-[80vh] flex flex-col animate-in fade-in">
      <div className="flex items-center justify-between border-b border-[#343339] pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#ffb3b5]">notifications</span>
          <span className="font-extrabold text-white">SYSTEM ALERTS</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onMarkAllRead}
            className="text-[10px] text-[#ffb3b5] hover:underline"
          >
            MARK READ
          </button>
          <button onClick={onClose} className="text-[#debfbf] hover:text-white font-bold">
            ✕
          </button>
        </div>
      </div>

      <div className="overflow-y-auto space-y-2 flex-1 pr-1">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-3 rounded-sm border ${
              notif.type === 'CRITICAL'
                ? 'bg-[#291d1d] border-[#962333]'
                : 'bg-[#13171B] border-[#343339]'
            } space-y-1`}
          >
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#ffb3b5] font-bold">{notif.title}</span>
              <span className="text-[#a68a8a]">{notif.time}</span>
            </div>
            <p className="text-[11px] text-[#debfbf] leading-relaxed">{notif.message}</p>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-6 text-[#a68a8a]">
            NO UNREAD SYSTEM NOTIFICATIONS.
          </div>
        )}
      </div>
    </div>
  );
};
