// Modern notification center with real-time updates
import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, Package, Star, Truck, MessageCircle, ChefHat } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../services/notifications';

const NotificationCenter = ({ userData }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (userData?.uid) {
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
        setNotifications([]);
        setUnreadCount(0);
    }, [userData?.uid]);

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
                    {/* Mobile full-screen sheet */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute right-0 mt-2 w-96 max-h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden sm:w-96 sm:rounded-2xl sm:max-h-96 w-[90vw] max-h-[70vh] md:w-96 md:max-h-96`}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto sm:max-h-80 max-h-[55vh]">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No notifications yet</p>
                                    <p className="text-sm text-gray-400 mt-1">We'll notify you when something arrives</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {getNotificationIcon(notification)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <h4 className={`font-semibold text-sm text-gray-900`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
                                                    <div className="flex items-center space-x-1">
                                                        {!notification.read && (
                                                            <button onClick={() => markAsRead(notification.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                                                Mark read
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteOne(notification.id)} className="p-1 rounded hover:bg-gray-200 transition-colors">
                                                            <X className="w-3 h-3 text-gray-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-4 border-t border-gray-200">
                                <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
