// App constants and configuration
export const APP_CONFIG = {
    name: 'Hostel Bites',
    tagline: 'Your midnight hunger savior',
    description: 'Delicious food delivered straight to your hostel room',
    version: '2.0.0',
    contact: {
        whatsapp: '+91 9876543210',
        email: 'support@hostelbites.com'
    }
};

export const ORDER_STATUSES = {
    PAYMENT_PENDING: 'payment_pending',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    READY_FOR_PICKUP: 'ready_for_pickup',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const DELIVERY_OPTIONS = {
    DELIVERY: 'delivery',
    TAKEAWAY: 'takeaway'
};

export const PAYMENT_METHODS = {
    UPI: 'upi',
    CASH: 'cash',
    CARD: 'card'
};

export const CATEGORIES = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'meals', name: 'Meals', icon: '🍛' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
    { id: 'sweets', name: 'Sweets', icon: '🍰' },
    { id: 'breakfast', name: 'Breakfast', icon: '🥐' }
];

export const THEME = {
    primary: '#FF6B35',      // Orange
    secondary: '#4ECDC4',    // Teal
    accent: '#FFE66D',       // Yellow
    success: '#6BC785',      // Green
    error: '#FF4757',        // Red
    warning: '#FFA726',      // Orange
    info: '#29B6F6',         // Blue
    dark: '#1A1A1A',
    light: '#FFFFFF',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
    }
};
