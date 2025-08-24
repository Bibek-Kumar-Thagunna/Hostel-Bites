// Modern header component with search and navigation
import React, { useState } from 'react';
import { Menu, User, ShoppingCart, LogOut, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationCenter from '../common/NotificationCenter';
import { auth, signOut } from '../../services/firebase';

const Header = ({ userData, onMenuClick }) => {
    const [imageError, setImageError] = useState(false);
    // Reset image error when photoURL changes
    React.useEffect(() => {
        setImageError(false);
    }, [userData?.photoURL]);
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    void location; // location retained in case of future route-based tweaks

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const goHome = () => {
        if (userData?.isAdmin) {
            navigate('/admin?section=overview');
        } else if (userData) {
            navigate('/app');
        } else {
            navigate('/');
        }
    };

    return (
        <header className={"fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-lg border-b border-gray-200"}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Open menu"
                            title="Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <button onClick={goHome} className="flex items-center space-x-2 hover:scale-105 transition-transform">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-teal-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">🍔</span>
                            </div>
                            <span className={"text-xl font-bold hidden sm:block transition-colors text-gray-900"}>
                                Hostel Bites
                            </span>
                        </button>
                    </div>

                    {/* Center Section - Removed search bar */}

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Location */}
                        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Room 510</span>
                        </div>

                        {/* Action Buttons */}
                        <NotificationCenter userData={userData} />

                        {/* Address/Profile Quick Edit (users) */}
                        {!userData?.isAdmin && (
                            <motion.button
                                onClick={() => navigate('/app?section=profile&focus=room')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Update room/WhatsApp"
                                aria-label="Update address"
                            >
                                <MapPin className="w-5 h-5" />
                            </motion.button>
                        )}

                        {/* Cart */}
                        <motion.button
                            onClick={() => navigate('/app?section=cart')}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <motion.span
                                    className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    key={cartCount}
                                >
                                    {cartCount > 9 ? '9+' : cartCount}
                                </motion.span>
                            )}
                        </motion.button>

                        {/* User Profile */}
                        <motion.button
                            onClick={() => navigate('/app?section=profile')}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {userData?.photoURL && userData.photoURL.trim() !== '' && !imageError ? (
                                <img
                                    src={userData.photoURL}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <span className="hidden md:block text-sm font-medium">
                                {userData?.displayName || 'Guest'}
                            </span>
                        </motion.button>

                        {/* Quick Logout (all users) */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
