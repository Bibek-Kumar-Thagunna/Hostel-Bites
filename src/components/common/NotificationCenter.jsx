// Modern notification center with real-time updates
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, Package, Star, Truck, MessageCircle, ChefHat, Check, X as XIcon } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../services/notifications';
import { subscribeAdminNotifications, markAdminNotificationHandled } from '../../services/adminNotifications';
import { updateOrder } from '../../services/admin';
import { auth } from '../../services/firebase';

const NotificationCenter = ({ userData }) => {
    const isAdmin = Boolean(userData?.isAdmin);
    const [notifications, setNotifications] = useState([]);
    const [adminNotifs, setAdminNotifs] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const prevAdminUnhandledRef = useRef(0);

    // Prevent background scroll when the mobile sheet is open
    useEffect(() => {
        if (isOpen) {
            const original = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = original; };
        }
    }, [isOpen]);

    useEffect(() => {
        if (!userData?.uid) {
            setNotifications([]);
            setAdminNotifs([]);
            setUnreadCount(0);
            return;
        }
        if (isAdmin) {
            const unsub = subscribeAdminNotifications((list) => {
                setAdminNotifs(list);
                setUnreadCount(list.filter(n => !n.handled).length);
                // Auto-open when a new unhandled admin notification arrives
                const currentUnhandled = list.filter(n => !n.handled && n.type === 'order_placed').length;
                if (prevAdminUnhandledRef.current !== 0 && currentUnhandled > prevAdminUnhandledRef.current) {
                    setIsOpen(true);
                }
                prevAdminUnhandledRef.current = currentUnhandled;
            });
            return () => unsub();
        } else {
            const unsubscribe = getUserNotifications(userData.uid, (notificationsData) => {
                const transformedNotifications = notificationsData.map(notification => ({
                    ...notification,
                    icon: getIconComponent(notification.icon),
                    color: notification.color || 'blue'
                }));
                setNotifications(transformedNotifications);
                setUnreadCount(transformedNotifications.filter(n => !n.read).length);
            });
            return () => unsubscribe();
        }
    }, [userData?.uid, isAdmin]);

    const getIconComponent = (iconName) => {
        const iconMap = {
            'CheckCircle': CheckCircle,
            'Package': Package,
            'Star': Star,
            'Info': Info,
            'AlertCircle': AlertCircle,
            'Truck': Truck,
            'ChefHat': ChefHat,
            'MessageCircle': MessageCircle
        };
        return iconMap[iconName] || Info;
    };

    const markAsRead = async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        const result = await markNotificationAsRead(id);
        if (!result.success) console.error('Failed to mark notification as read:', result.error);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        if (userData?.uid) {
            const result = await markAllNotificationsAsRead(userData.uid);
            if (!result.success) console.error('Failed to mark all notifications as read:', result.error);
        }
    };

    const deleteOne = async (id) => {
        const n = notifications.find(x => x.id === id);
        setNotifications(prev => prev.filter(x => x.id !== id));
        if (!n?.read) setUnreadCount(prev => Math.max(0, prev - 1));
        const result = await deleteNotification(id);
        if (!result.success) console.error('Failed to delete notification:', result.error);
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const t = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const diff = now - t;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getNotificationIcon = (notification) => {
        const IconComponent = notification.icon;
        const colorClasses = {
            green: 'text-green-600',
            blue: 'text-blue-600',
            yellow: 'text-yellow-600',
            purple: 'text-purple-600',
            orange: 'text-orange-600',
            red: 'text-red-600'
        };
        return (
            <div className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center`}>
                <IconComponent className={`w-5 h-5 ${colorClasses[notification.color]}`} />
            </div>
        );
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-gray-100"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Overlay (desktop only) */}
                    <div className="hidden sm:block fixed inset-0 z-40 bg-black/40" onClick={() => setIsOpen(false)} />

                    {/* Desktop dropdown */}
                    <div className="hidden sm:block absolute right-0 mt-2 w-96 max-h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Mark all read</button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {(isAdmin && adminNotifs.filter(n => !n.handled).length === 0) || (!isAdmin && notifications.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No notifications yet</p>
                                    <p className="text-sm text-gray-400 mt-1">We'll notify you when something arrives</p>
                                </div>
                            ) : (
                                (isAdmin ? adminNotifs.filter(n => !n.handled) : notifications).map((notification) => (
                                    <div key={notification.id} className={`relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex items-start space-x-3">
                                            {isAdmin ? (
                                                <div className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center`}>
                                                    <Package className={`w-5 h-5 text-orange-600`} />
                                                </div>
                                            ) : (
                                                getNotificationIcon(notification)
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <h4 className={`font-semibold text-sm text-gray-900`}>{isAdmin ? `Order #${String(notification.orderId).slice(-8)}` : notification.title}</h4>
                                                    {!isAdmin && !notification.read && (<div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />)}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{isAdmin ? `${notification.userName || 'Unknown'} • ₹${notification.total || 0} • ${notification.itemsCount || 0} items` : notification.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">{formatTime(notification.createdAt || notification.timestamp)}</span>
                                                    {isAdmin ? (
                                                        <div className="flex items-center space-x-1">
                                                            <button onClick={async () => {
                                                                const res = await updateOrder(notification.orderId, { status: 'preparing' });
                                                                if (res?.success) await markAdminNotificationHandled(notification.id, 'accepted', auth.currentUser?.uid);
                                                            }} className="px-2 py-1 rounded bg-green-600 text-white text-xs flex items-center gap-1"><Check className="w-3 h-3" />Accept</button>
                                                            <button onClick={async () => {
                                                                const res = await updateOrder(notification.orderId, { status: 'cancelled' });
                                                                if (res?.success) await markAdminNotificationHandled(notification.id, 'declined', auth.currentUser?.uid);
                                                            }} className="px-2 py-1 rounded bg-red-600 text-white text-xs flex items-center gap-1"><XIcon className="w-3 h-3" />Decline</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-1">
                                                            {!notification.read && (<button onClick={() => markAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark read</button>)}
                                                            <button onClick={() => deleteOne(notification.id)} className="p-1 rounded hover:bg-gray-200 transition-colors"><X className="w-3 h-3 text-gray-400" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-4 border-t border-gray-200">
                                <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">View all notifications</button>
                            </div>
                        )}
                    </div>

                    {/* Mobile centered modal via portal to escape header stacking context */}
                    {createPortal(
                        <div className="sm:hidden fixed inset-0 z-[100] flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
                            <div className="relative z-[101] bg-white rounded-2xl shadow-2xl border border-gray-200 w-[92vw] max-h-[80vh]">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Mark all read</button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            </div>
                            <div className="max-h-[68vh] overflow-y-auto overscroll-contain">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No notifications yet</p>
                                    <p className="text-sm text-gray-400 mt-1">We'll notify you when something arrives</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div key={notification.id} className={`relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex items-start space-x-3">
                                            {getNotificationIcon(notification)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <h4 className={`font-semibold text-sm text-gray-900`}>{notification.title}</h4>
                                                    {!notification.read && (<div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />)}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
                                                    <div className="flex items-center space-x-1">
                                                        {!notification.read && (<button onClick={() => markAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark read</button>)}
                                                        <button onClick={() => deleteOne(notification.id)} className="p-1 rounded hover:bg-gray-200 transition-colors"><X className="w-3 h-3 text-gray-400" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-4 border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
                                    <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">View all notifications</button>
                                </div>
                            )}
                            </div>
                        </div>, document.body)}
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
