// Sidebar navigation component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Home,
    ShoppingCart,
    ClipboardList,
    Settings,
    LogOut,
    User,
    Heart,
    Star,
    HelpCircle,
    X,
    ChefHat,
    BarChart3,
    Activity,
    Package as PackageIcon
} from 'lucide-react';
import { signOut } from '../../services/firebase';
import { auth } from '../../services/firebase';

const Sidebar = ({ userData, onClose }) => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('home');
    const [imageError, setImageError] = useState(false);
    React.useEffect(() => { setImageError(false); }, [userData?.photoURL]);

    const isAdmin = userData?.isAdmin;

    const userMenuItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/app' },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, path: '/app?section=cart' },
        { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/app?section=orders' },
    ];

    const adminMenuItems = [
        { id: 'admin-overview', label: 'Overview', icon: Activity, path: '/admin?section=overview' },
        { id: 'admin-menu', label: 'Menu Management', icon: ChefHat, path: '/admin?section=menu' },
        { id: 'admin-orders', label: 'Order Management', icon: BarChart3, path: '/admin?section=orders' },
        { id: 'admin-settings', label: 'Settings', icon: Settings, path: '/admin?section=settings' },
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    const otherItems = [
        { id: 'profile', label: 'Profile', icon: User, path: isAdmin ? '/admin?section=profile' : '/app?section=profile' },
        { id: 'help', label: 'Help & Support', icon: HelpCircle, path: isAdmin ? '/admin?section=help' : '/app?section=help' },
    ];

    const handleNavigation = (path, itemId) => {
        setActiveItem(itemId);
        navigate(path);
        if (onClose) onClose();
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const MenuItem = ({ item, isActive, onClick }) => (
        <motion.button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                    ? 'bg-orange-100 text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
        >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
        </motion.button>
    );

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {userData?.photoURL && userData.photoURL.trim() !== '' && !imageError ? (
                            <img
                                src={userData.photoURL}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {userData?.displayName || 'Guest'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {userData?.email || 'guest@example.com'}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Main Menu */}
                <div className="space-y-1">
                    <h4 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Main
                    </h4>
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeItem === item.id}
                            onClick={() => handleNavigation(item.path, item.id)}
                        />
                    ))}
                </div>



                {/* Other Items */}
                <div className="space-y-1 pt-4 border-t border-gray-100">
                    <h4 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Account
                    </h4>
                    {otherItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeItem === item.id}
                            onClick={() => handleNavigation(item.path, item.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <motion.button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </motion.button>

                {/* App Version */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">
                        Hostel Bites v2.0.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
