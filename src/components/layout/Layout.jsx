// Main layout component with modern design
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { CartProvider } from '../../contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children, userData }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const viewIsProfile = location.pathname.startsWith('/app') && new URLSearchParams(location.search).get('section') === 'profile';

    return (
        <CartProvider>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header */}
                <Header
                    userData={userData}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden"
                        >
                            <Sidebar
                                userData={userData}
                                onClose={() => setSidebarOpen(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Sidebar */}
                <div className="hidden lg:block fixed left-0 top-16 h-full w-80 bg-white shadow-lg">
                    <Sidebar userData={userData} />
                </div>

                {/* Main Content */}
                <motion.main
                    className="lg:ml-80 pt-16 min-h-screen"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="container mx-auto px-4 py-6">
                        {children}
                    </div>
                </motion.main>

                {/* Floating Action Button for Cart (Mobile) - only for non-admin users */}
                {!userData?.isAdmin && viewIsProfile !== true && (
                    <motion.div
                        className="lg:hidden fixed bottom-6 right-6 z-40"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <button onClick={() => navigate('/app?section=cart')} className="bg-orange-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </div>
        </CartProvider>
    );
};

export default Layout;
