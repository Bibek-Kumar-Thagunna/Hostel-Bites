// User App Component - Main user interface
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Import Firebase services
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from '../services/firebase';
import { subscribeCategories } from '../services/categories';

// Import hooks and contexts
import { useCart } from '../hooks/useCart';

// Import constants
import { DELIVERY_OPTIONS } from '../constants/app';

// Import components
import MenuItem from './menu/MenuItem';
import CartSummary from './cart/CartSummary';
import Checkout from './checkout/Checkout';
import OrderHistory from './orders/OrderHistory';
import UserProfile from './user/UserProfile';

const UserApp = ({ userData }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [menu, setMenu] = useState([]);
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState('menu'); // 'menu', 'cart', 'orders'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'rating'
    const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
    const [isLoading, setIsLoading] = useState(true);

    const { cart, cartTotal, clearCart, addToCart, removeFromCart } = useCart();

    // Handle URL section parameter
    useEffect(() => {
        const section = searchParams.get('section');
        if (section) {
            switch (section) {
                case 'cart':
                    setView('cart');
                    break;
                case 'orders':
                    setView('orders');
                    break;
                case 'checkout':
                    setView('checkout');
                    break;
                case 'profile':
                    setView('profile');
                    break;
                case 'help':
                    setView('help');
                    break;
                default:
                    setView('menu');
            }
        } else {
            setView('menu');
        }
    }, [searchParams]);

    const [categories, setCategories] = useState([
        { id: 'all', key: 'all', name: 'All Items', icon: '🍽️' },
    ]);

    // Load menu items
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
            const menuData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenu(menuData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Load categories
    useEffect(() => {
        const unsub = subscribeCategories((cats) => {
            const normalized = [{ id: 'all', key: 'all', name: 'All Items', icon: '🍽️' }, ...cats.map(c => ({ id: c.id, key: c.key, name: c.name, icon: c.icon }))];
            setCategories(normalized);
        });
        return () => unsub();
    }, []);

    // Load user orders
    useEffect(() => {
        const q = query(collection(db, "orders"), where("userId", "==", userData.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            ordersData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            setOrders(ordersData);
        });

        return () => unsubscribe();
    }, [userData.uid]);

    // Enhanced filtering logic
    const filteredMenu = menu
        .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesPrice = item.sellingPrice >= priceRange.min && item.sellingPrice <= priceRange.max;
            const isAvailable = item.available !== false; // default to true if field missing
            return matchesSearch && matchesCategory && matchesPrice && isAvailable;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return a.sellingPrice - b.sellingPrice;
                case 'rating':
                    return (b.rating || 4.5) - (a.rating || 4.5);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    const renderContent = () => {
        switch (view) {
            case 'cart':
                return <CartSummary
                    cart={cart}
                    cartTotal={cartTotal}
                    onRemoveFromCart={removeFromCart}
                    onClearCart={clearCart}
                    onAddToCart={addToCart}
                    onBack={() => {
                        setSearchParams({});
                        setView('menu');
                    }}
                />;
            case 'checkout':
                return <Checkout
                    cart={cart}
                    cartTotal={cartTotal}
                    onBack={() => {
                        setSearchParams({ section: 'cart' });
                        setView('cart');
                    }}
                    onClearCart={clearCart}
                />;
            case 'orders':
                return <OrderHistory orders={orders} />;
            
            case 'profile':
                return (
                    <UserProfile userData={userData} orders={orders} focusField={searchParams.get('focus')} />
                );
            case 'help':
                return (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
                            <button
                                onClick={() => {
                                    setSearchParams({});
                                    setView('menu');
                                }}
                                className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                            >
                                ← Back to Menu
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Frequently Asked Questions</h3>
                                <div className="space-y-3">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900">How do I place an order?</h4>
                                        <p className="text-gray-600 mt-1">Browse the menu, add items to your cart, and proceed to checkout.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900">What are the delivery times?</h4>
                                        <p className="text-gray-600 mt-1">Orders are typically delivered within 15-20 minutes.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900">How do I contact support?</h4>
                                        <p className="text-gray-600 mt-1">You can reach us through the contact information provided.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}! 👋
                                    </h1>
                                    <p className="text-gray-600">What would you like to eat today?</p>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>Room 510</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>15 min delivery</span>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search for food..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Advanced Filters */}
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="price">Sort by Price</option>
                                    <option value="rating">Sort by Rating</option>
                                </select>

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Price:</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                        className="w-20"
                                    />
                                    <span className="text-sm text-gray-600">₹{priceRange.max}</span>
                                </div>

                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('all');
                                        setPriceRange({ min: 0, max: 500 });
                                        setSortBy('name');
                                    }}
                                    className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="category-tabs flex overflow-x-auto space-x-3 pb-2 border-b border-gray-100">
                            {categories.map((category) => (
                                <button
                                    key={category.key}
                                    onClick={() => setSelectedCategory(category.key)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-200 ${
                                        selectedCategory === category.key
                                            ? 'bg-primary-100 text-primary-600 shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                                    }`}
                                >
                                    <span className="text-lg">{category.icon}</span>
                                    <span className="font-medium">{category.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Menu Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-2xl p-6 animate-pulse">
                                        <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {filteredMenu.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <MenuItem
                                            item={item}
                                            quantityInCart={cart[item.id]?.quantity || 0}
                                            onAddToCart={addToCart}
                                            onRemoveFromCart={removeFromCart}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {filteredMenu.length === 0 && !isLoading && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🍽️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                                <p className="text-gray-600">Try adjusting your search or category filter</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {renderContent()}
        </div>
    );
};

export default UserApp;
