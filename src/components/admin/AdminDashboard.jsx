// Modern admin dashboard with analytics and management tools
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, Package, Star, Clock, AlertCircle, Activity, PieChart, BarChart3, Settings, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { getAdminAnalytics, getRecentOrders, getMenuItems, updateMenuItem, addMenuItem, deleteMenuItem, updateOrderStatus, updateOrder, deleteOrder } from '../../services/admin';
import { subscribeAppSettings, updateAppSettings } from '../../services/settings';
import MenuForm from './MenuForm';
import { subscribeCategories, addCategory, updateCategory, deleteCategory as deleteCategorySvc } from '../../services/categories';
import { auth, db, doc, setDoc, updateProfile } from '../../services/firebase';

const AdminDashboard = ({ userData }) => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [imageError, setImageError] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [menuSearch, setMenuSearch] = useState('');
    const [orders, setOrders] = useState([]);
    const [orderSearch, setOrderSearch] = useState('');
    const [orderMgmtSearch, setOrderMgmtSearch] = useState('');
    const [orderMgmtStatus, setOrderMgmtStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0,
        avgOrderValue: 0,
        topSellingItems: [],
        revenueChart: [],
        orderStatus: {}
    });
    const [settings, setSettings] = useState({ upiId: '', upiQrUrl: '' });
    const [menuModal, setMenuModal] = useState({ open: false, editing: null });
    const [profileName, setProfileName] = useState(userData?.displayName || '');
    const [profilePhoto, setProfilePhoto] = useState(userData?.photoURL || '');
    const [savingProfile, setSavingProfile] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    const [orderModal, setOrderModal] = useState({ open: false, order: null, status: '', notes: '', upiRef: '' });
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [savingOrder, setSavingOrder] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryModal, setCategoryModal] = useState({ open: false, editing: null, name: '', icon: '', key: '' });

    const ORDER_STATUS_OPTIONS = [
        'payment_pending',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled',
    ];

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    // Handle URL section parameter
    useEffect(() => {
        const section = searchParams.get('section');
        if (section) {
            switch (section) {
                case 'overview':
                    setActiveTab('overview');
                    break;
                case 'menu':
                    setActiveTab('menu');
                    break;
                case 'orders':
                    setActiveTab('orders');
                    break;
                case 'analytics':
                    setActiveTab('analytics');
                    break;
                case 'settings':
                    setActiveTab('settings');
                    break;
                case 'profile':
                    setActiveTab('profile');
                    break;
                case 'help':
                    setActiveTab('help');
                    break;
                default:
                    setActiveTab('overview');
            }
        } else {
            setActiveTab('overview');
        }
    }, [searchParams]);

    // Load data from Firebase
    useEffect(() => {
        // Load analytics data
        const unsubscribeAnalytics = getAdminAnalytics((analyticsData) => {
            setAnalytics(analyticsData);
        });

        // Load recent orders
        const unsubscribeOrders = getRecentOrders((ordersData) => {
            setOrders(ordersData);
        });

        // Load menu items
        const unsubscribeMenu = getMenuItems((menuData) => {
            setMenuItems(menuData);
        });

        // Load app settings
        const unsubscribeSettings = subscribeAppSettings((data) => setSettings({ upiId: data.upiId || '', upiQrUrl: data.upiQrUrl || '' }));

        // Load categories
        const unsubscribeCategories = subscribeCategories((cats) => setCategories(cats));

        return () => {
            unsubscribeAnalytics();
            unsubscribeOrders();
            unsubscribeMenu();
            unsubscribeSettings();
            unsubscribeCategories();
        };
    }, []);

    // Sync profile fields with userData
    useEffect(() => {
        setProfileName(userData?.displayName || '');
        setProfilePhoto(userData?.photoURL || '');
    }, [userData?.displayName, userData?.photoURL]);

    // Set loading to false when we have data
    useEffect(() => {
        if (analytics.totalOrders > 0 || menuItems.length > 0) {
            setIsLoading(false);
        }
    }, [analytics.totalOrders, menuItems.length]);

    const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => ( // eslint-disable-line no-unused-vars
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last week
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    color === 'green' ? 'bg-green-100' :
                    color === 'blue' ? 'bg-blue-100' :
                    color === 'purple' ? 'bg-purple-100' :
                    color === 'orange' ? 'bg-orange-100' :
                    'bg-gray-100'
                }`}>
                    <Icon className={`w-6 h-6 ${
                        color === 'green' ? 'text-green-600' :
                        color === 'blue' ? 'text-blue-600' :
                        color === 'purple' ? 'text-purple-600' :
                        color === 'orange' ? 'text-orange-600' :
                        'text-gray-600'
                    }`} />
                </div>
            </div>
        </div>
    );

    const renderOverview = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${analytics.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend={12.5}
                    color="green"
                />
                <StatCard
                    title="Total Orders"
                    value={analytics.totalOrders}
                    icon={Package}
                    trend={8.2}
                    color="blue"
                />
                <StatCard
                    title="Active Users"
                    value={analytics.activeUsers}
                    icon={Users}
                    trend={-2.1}
                    color="purple"
                />
                <StatCard
                    title="Avg Order Value"
                    value={`₹${analytics.avgOrderValue}`}
                    icon={TrendingUp}
                    trend={5.7}
                    color="orange"
                />
                {/* Profit */}
                <StatCard
                    title="Profit (est.)"
                    value={`₹${(analytics.profit || 0).toLocaleString()}`}
                    icon={DollarSign}
                    trend={undefined}
                    color="green"
                />
                <StatCard title="Payment Pending" value={analytics.orderStatus?.payment_pending || 0} icon={AlertCircle} color="orange" />
                <StatCard title="Ready" value={analytics.orderStatus?.ready_for_pickup || analytics.orderStatus?.ready || 0} icon={Clock} color="blue" />
                <StatCard title="Delivered" value={analytics.orderStatus?.delivered || 0} icon={Package} color="green" />
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Items */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Items</h3>
                    <div className="space-y-4">
                        {analytics.topSellingItems.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-600">{item.sales} sales</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">₹{item.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Status */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status</h3>
                    <div className="space-y-4">
                        {Object.entries(analytics.orderStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        status === 'completed' ? 'bg-green-500' :
                                        status === 'preparing' ? 'bg-blue-500' :
                                        status === 'ready' ? 'bg-orange-500' : 'bg-gray-400'
                                    }`}></div>
                                    <span className="text-gray-900 capitalize">{status}</span>
                                </div>
                                <span className="font-bold text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <input
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search by ID or customer name..."
                        className="input-primary w-64"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.filter((o) => {
                                if (!orderSearch.trim()) return true;
                                const q = orderSearch.toLowerCase();
                                return (o.id?.toLowerCase?.().includes(q)) || (o.userName?.toLowerCase?.().includes(q));
                            }).map((order) => (
                                <tr key={order.id} className="border-b border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="py-3 px-4 text-gray-900">{order.userName || order.customerName || 'Unknown'}</td>
                                    <td className="py-3 px-4 text-gray-600">{order.items?.length || 0} items</td>
                                    <td className="py-3 px-4 font-medium text-gray-900">₹{order.total || 0}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        );
    };

    const handleSaveMenuItem = async (payload) => {
        if (menuModal.editing) {
            const result = await updateMenuItem(menuModal.editing.id, payload);
            if (result?.success) {
                setMenuModal({ open: false, editing: null });
                showToast('Menu item updated', 'success');
            } else {
                showToast(result?.error || 'Failed to update item', 'error');
            }
        } else {
            const result = await addMenuItem(payload);
            if (result?.success) {
                setMenuModal({ open: false, editing: null });
                showToast('Menu item added', 'success');
            } else {
                showToast(result?.error || 'Failed to add item', 'error');
            }
        }
    };

    const renderMenuManagement = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                <div className="flex items-center gap-3">
                    <input
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search menu by name or category..."
                        className="input-primary w-64"
                    />
                    <button
                        onClick={() => setCategoryModal({ open: true, editing: null, name: '', icon: '', key: '' })}
                        className="px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-50"
                    >Manage Categories</button>
                    <button
                        onClick={() => setMenuModal({ open: true, editing: null })}
                        className="btn-primary flex items-center space-x-2 shadow-md"
                        aria-label="Add new menu item"
                        title="Add new menu item"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Item</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.filter((it) => {
                    if (!menuSearch.trim()) return true;
                    const q = menuSearch.toLowerCase();
                    return (it.name?.toLowerCase?.().includes(q)) || (it.category?.toLowerCase?.().includes(q));
                }).map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        {item.imageUrl && (
                            <div className="mb-4">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-xl border" />
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setMenuModal({ open: true, editing: item })} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Edit item" title="Edit item">
                                    <Edit className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm(`Delete ${item.name}? This cannot be undone.`)) {
                                            const result = await deleteMenuItem(item.id);
                                            if (result?.success) {
                                                showToast('Menu item deleted', 'success');
                                            } else {
                                                showToast(result?.error || 'Failed to delete item', 'error');
                                            }
                                        }
                                    }}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    aria-label="Delete item"
                                    title="Delete item"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">Price: ₹{item.sellingPrice ?? item.price}</p>
                            <p className="text-sm text-gray-600">Category: {categories.find(c => c.key === item.category)?.name || item.category}</p>
                            <p className="text-sm text-gray-600">Stock: {item.quantity ?? item.stock} left</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                item.available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {item.available ? 'Available' : 'Out of Stock'}
                            </span>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={item.available}
                                    onChange={async () => {
                                        const result = await updateMenuItem(item.id, { available: !item.available });
                                        if (result?.success) {
                                            showToast('Availability updated', 'success');
                                        } else {
                                            showToast(result?.error || 'Failed to update availability', 'error');
                                        }
                                    }}
                                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            

            {/* Toast */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border ${toast.variant === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {toast.message}
                </div>
            )}
            {/* Category Manager Modal */}
            {categoryModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setCategoryModal({ open: false, editing: null, name: '', icon: '', key: '' })} />
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Manage Categories</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setCategoryModal({ open: false, editing: null, name: '', icon: '', key: '' })}>×</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input value={categoryModal.name} onChange={(e) => setCategoryModal(m => ({ ...m, name: e.target.value }))} className="input-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                                <input value={categoryModal.icon} onChange={(e) => setCategoryModal(m => ({ ...m, icon: e.target.value }))} className="input-primary" placeholder="🍕" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                                <input value={categoryModal.key} onChange={(e) => setCategoryModal(m => ({ ...m, key: e.target.value }))} className="input-primary" placeholder="pizza, burgers (lowercase, underscore)" />
                                <p className="text-xs text-gray-500 mt-1">Key is used in items. If changed, update existing items accordingly.</p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button className="px-4 py-2 rounded-xl border" onClick={() => setCategoryModal({ open: false, editing: null, name: '', icon: '', key: '' })}>Close</button>
                            <button
                                className="btn-primary"
                                onClick={async () => {
                                    if (categoryModal.editing) {
                                        const res = await updateCategory(categoryModal.editing.id, { name: categoryModal.name, icon: categoryModal.icon, key: categoryModal.key });
                                        if (!res?.success) showToast(res?.error || 'Failed to update category', 'error');
                                    } else {
                                        const res = await addCategory({ name: categoryModal.name, icon: categoryModal.icon, key: categoryModal.key });
                                        if (!res?.success) showToast(res?.error || 'Failed to add category', 'error');
                                    }
                                    setCategoryModal({ open: false, editing: null, name: '', icon: '', key: '' });
                                }}
                            >Save</button>
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <div className="text-sm font-medium text-gray-900 mb-2">Existing Categories</div>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {categories.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg border">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-xl">{c.icon || '🍽️'}</div>
                                            <div>
                                                <div className="font-medium text-gray-900">{c.name}</div>
                                                <div className="text-xs text-gray-500">key: {c.key}</div>
                                            </div>
                                        </div>
                                        <div className="space-x-2">
                                            <button className="px-3 py-1 rounded-lg border" onClick={() => setCategoryModal({ open: true, editing: c, name: c.name, icon: c.icon, key: c.key })}>Edit</button>
                                            <button className="px-3 py-1 rounded-lg border border-red-300 text-red-700" onClick={async () => {
                                                if (confirm(`Delete category ${c.name}?`)) {
                                                    const res = await deleteCategorySvc(c.id);
                                                    if (!res?.success) showToast(res?.error || 'Failed to delete category', 'error');
                                                }
                                            }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Chart placeholder - Revenue over time</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">Order Distribution</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Chart placeholder - Order types</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrderManagement = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {/* Controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <input
                        value={orderMgmtSearch}
                        onChange={(e) => setOrderMgmtSearch(e.target.value)}
                        placeholder="Search orders by ID or customer..."
                        className="input-primary md:w-80"
                    />
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'payment_pending', label: 'Payment Pending' },
                            { id: 'preparing', label: 'Preparing' },
                            { id: 'ready_for_pickup', label: 'Ready' },
                            { id: 'out_for_delivery', label: 'Out for Delivery' },
                            { id: 'delivered', label: 'Delivered' },
                            { id: 'cancelled', label: 'Cancelled' },
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setOrderMgmtStatus(s.id)}
                                className={`px-3 py-1 rounded-full text-sm border ${orderMgmtStatus === s.id ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-300'}`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.filter((o) => {
                                if (orderMgmtStatus !== 'all' && (o.status || 'payment_pending') !== orderMgmtStatus) return false;
                                if (!orderMgmtSearch.trim()) return true;
                                const q = orderMgmtSearch.toLowerCase();
                                return (o.id?.toLowerCase?.().includes(q)) || (o.userName?.toLowerCase?.().includes(q));
                            }).map((order) => (
                                <>
                                    <tr key={order.id} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium text-gray-900">{order.id.slice(-8)}</td>
                                        <td className="py-3 px-4 text-gray-900">{order.userName || order.customerName || 'Unknown'}</td>
                                        <td className="py-3 px-4 text-gray-600">{order.items?.length || 0} items</td>
                                        <td className="py-3 px-4 font-medium text-gray-900">₹{order.total || 0}</td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={order.status || 'payment_pending'}
                                                onChange={async (e) => {
                                                    const res = await updateOrderStatus(order.id, e.target.value);
                                                    if (res?.success) showToast('Order status updated', 'success'); else showToast(res?.error || 'Failed to update status', 'error');
                                                }}
                                                className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 bg-white"
                                            >
                                                <option value="payment_pending">Payment Pending</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="ready_for_pickup">Ready</option>
                                                <option value="out_for_delivery">Out for Delivery</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                className="text-blue-600 hover:text-blue-700 mr-2"
                                                onClick={() => setOrderModal({ open: true, order, status: order.status || 'payment_pending', notes: order.notes || '', upiRef: order.upiTransactionId || '' })}
                                                aria-label="Edit order"
                                                title="Edit order"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-gray-700 hover:text-gray-900 mr-2"
                                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                aria-label="View details"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-700"
                                                onClick={async () => {
                                                    if (confirm(`Delete order ${order.id.slice(-8)}?`)) {
                                                        const res = await deleteOrder(order.id);
                                                        if (res?.success) showToast('Order deleted', 'success'); else showToast(res?.error || 'Failed to delete order', 'error');
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <div className="font-semibold text-gray-900 mb-2">Items</div>
                                                        <div className="space-y-2">
                                                            {order.items?.map((it, idx) => (
                                                                <div key={idx} className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <img src={it.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=40&h=40&fit=crop&crop=center`} className="w-8 h-8 rounded object-cover" alt={it.name} />
                                                                        <span className="text-gray-800">{it.name} × {it.quantity}</span>
                                                                    </div>
                                                                    <span className="font-medium text-gray-900">₹{(it.price || it.sellingPrice || 0) * (it.quantity || 1)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 mb-2">Payment</div>
                                                        <div className="space-y-1 text-gray-700">
                                                            <div>Method: {order.paymentMethod || 'N/A'}</div>
                                                            <div>UPI ID: {settings.upiId || 'N/A'}</div>
                                                            <div>UPI Ref: {order.upiTransactionId || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 mb-2">Summary</div>
                                                        <div className="space-y-1 text-gray-700">
                                                            <div><span className="font-medium">Customer:</span> {order.userName || order.customerName || 'Unknown'}</div>
                                                            <div><span className="font-medium">Status:</span> {order.status}</div>
                                                            <div><span className="font-medium">Total:</span> ₹{order.total || 0}</div>
                                                            <div><span className="font-medium">Updated:</span> {order.updatedAt?.toDate ? order.updatedAt.toDate().toLocaleString() : '—'}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 mb-2">Meta</div>
                                                        <div className="text-gray-700">Type: {order.orderType}</div>
                                                        <div className="text-gray-700">Created: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => {
        const saveProfile = async () => {
            setSavingProfile(true);
            try {
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: profileName, photoURL: profilePhoto });
                }
                if (userData?.uid) {
                    await setDoc(doc(db, 'users', userData.uid), { displayName: profileName, photoURL: profilePhoto }, { merge: true });
                }
            } finally {
                setSavingProfile(false);
            }
        };

        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Profile</h2>
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        {profilePhoto && profilePhoto.trim() !== '' && !imageError ? (
                            <img
                                src={profilePhoto}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl font-bold">
                                    {profileName?.charAt(0) || userData?.displayName?.charAt(0) || 'A'}
                                </span>
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-semibold">{profileName || userData?.displayName || 'Admin'}</h3>
                            <p className="text-gray-600">{userData?.email}</p>
                            <p className="text-sm text-orange-600 font-medium">Administrator</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                            <input className="input-primary" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                            <input className="input-primary" value={profilePhoto} onChange={(e) => setProfilePhoto(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">Total Orders Managed</h4>
                            <p className="text-2xl font-bold text-orange-600">{orders.length}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">Menu Items</h4>
                            <p className="text-2xl font-bold text-orange-600">{menuItems.length}</p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button disabled={savingProfile} onClick={saveProfile} className="btn-primary">{savingProfile ? 'Saving...' : 'Save Profile'}</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderHelp = () => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Help & Support</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start Guide</h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">Managing Orders</h4>
                            <p className="text-gray-600 mt-1">Update order status from pending to delivered in the Order Management section.</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">Menu Management</h4>
                            <p className="text-gray-600 mt-1">Add, edit, or remove menu items. Toggle availability to show/hide items.</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900">Analytics</h4>
                            <p className="text-gray-600 mt-1">Monitor revenue, popular items, and customer trends in real-time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Content */}
                <div className="transition-all duration-300">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'menu' && renderMenuManagement()}
                    {activeTab === 'orders' && renderOrderManagement()}
                    {activeTab === 'analytics' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
                            <p className="text-gray-600">Analytics will be added later.</p>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                    <input
                                        value={settings.upiId}
                                        onChange={(e) => setSettings((s) => ({ ...s, upiId: e.target.value }))}
                                        placeholder="yourname@upi"
                                        className="input-primary"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {settings.upiId && (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent('upi://pay?pa=' + settings.upiId + '&pn=Hostel Bites&cu=INR')}`} alt="UPI QR" className="w-28 h-28 object-contain rounded-lg border" />
                                    )}
                                    <div className="text-sm text-gray-600">
                                        <div>Preview</div>
                                        <div className="text-xs">QR is generated from your UPI ID</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
                                        if (settings.upiId && !upiPattern.test(settings.upiId)) {
                                            alert('Please enter a valid UPI ID (e.g., name@bank)');
                                            return;
                                        }
                                        updateAppSettings(settings);
                                    }}
                                    className="btn-primary"
                                >Save</button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'help' && renderHelp()}
                </div>
            </div>

            {/* Edit Order Modal */}
            {activeTab === 'orders' && orderModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOrderModal({ open: false, order: null, status: '', notes: '', upiRef: '' })} />
                    <div role="dialog" aria-modal="true" className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 p-6">
                        <div className="flex items-start justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Edit Order {orderModal.order?.id ? `#${orderModal.order.id.slice(-8)}` : ''}</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setOrderModal({ open: false, order: null, status: '', notes: '', upiRef: '' })}
                                aria-label="Close"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={orderModal.status}
                                    onChange={(e) => setOrderModal((m) => ({ ...m, status: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white"
                                >
                                    {ORDER_STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">UPI Reference ID</label>
                                <input
                                    value={orderModal.upiRef}
                                    onChange={(e) => setOrderModal((m) => ({ ...m, upiRef: e.target.value }))}
                                    placeholder="e.g., TID12345678"
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional. Ask customer for the UPI reference after payment.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={orderModal.notes}
                                    onChange={(e) => setOrderModal((m) => ({ ...m, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2"
                                    placeholder="Add any internal notes..."
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setOrderModal({ open: false, order: null, status: '', notes: '', upiRef: '' })}
                                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={savingOrder}
                                onClick={async () => {
                                    if (!orderModal.order?.id) return;
                                    setSavingOrder(true);
                                    const res = await updateOrder(orderModal.order.id, {
                                        status: orderModal.status,
                                        upiTransactionId: orderModal.upiRef || '',
                                        notes: orderModal.notes || ''
                                    });
                                    setSavingOrder(false);
                                    if (res?.success) {
                                        showToast('Order updated', 'success');
                                        setOrderModal({ open: false, order: null, status: '', notes: '', upiRef: '' });
                                    } else {
                                        showToast(res?.error || 'Failed to update order', 'error');
                                    }
                                }}
                                className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-70"
                            >
                                {savingOrder ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Form Modal */}
            {activeTab === 'menu' && menuModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setMenuModal({ open: false, editing: null })} />
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl mx-4 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{menuModal.editing ? 'Edit Item' : 'Add New Item'}</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setMenuModal({ open: false, editing: null })}>×</button>
                        </div>
                        <MenuForm
                            initialValues={menuModal.editing}
                            categories={categories}
                            onCancel={() => setMenuModal({ open: false, editing: null })}
                            onSave={handleSaveMenuItem}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
