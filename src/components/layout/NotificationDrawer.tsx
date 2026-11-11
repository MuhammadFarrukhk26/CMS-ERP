/**
 * Enterprise Campus Management System (Campus ERP)
 * Real-time Notifications & Approval Alerts Drawer
 */

import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationDrawerProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigateTab }) => {
  const { notifications, isOpen, toggleDrawer, markAsRead, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  const handleItemClick = (n: any) => {
    markAsRead(n.id);
    if (n.actionUrl) {
      const tab = n.actionUrl.replace('/', '');
      onNavigateTab(tab);
      toggleDrawer();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-2xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#DD2A2A]" />
              <h3 className="text-sm font-bold text-slate-900">Notifications & Alerts</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Read</span>
              </button>
              <button
                onClick={toggleDrawer}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isWarning = n.type === 'warning';
                const isSuccess = n.type === 'success';
                const isAlert = n.type === 'alert';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3 rounded-lg transition-colors cursor-pointer flex items-start gap-3 ${
                      !n.read ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isAlert ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-bold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      {n.actionUrl && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DD2A2A] mt-1.5 hover:underline">
                          <span>View in {n.module.toUpperCase()}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
