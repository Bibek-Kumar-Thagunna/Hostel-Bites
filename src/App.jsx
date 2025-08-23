// Welcome to your Hostel Night Canteen Web App!
// This single file contains the complete React application.
// This version uses a semi-automated UPI Transaction ID verification system.

// -----------------------------------------------------------------------------
// ---------------------------------- SETUP ------------------------------------
// -----------------------------------------------------------------------------
//
// STEP 1-5: (Same as before - Firebase Setup)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    runTransaction,
    Timestamp
} from 'firebase/firestore';

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyBdqmXcj8QJxsS7RFbgL3zv6jqYOUrEIfg",
  authDomain: "hostel-canteen-app.firebaseapp.com",
  projectId: "hostel-canteen-app",
  storageBucket: "hostel-canteen-app.firebasestorage.app",
  messagingSenderId: "360421932587",
  appId: "1:360421932587:web:901bd8df43cb657351f46e",
  measurementId: "G-6WQCEESMRD"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ICONS (Same as before) ---
const CanteenIcon = () => (
    <span className="text-2xl">🍔</span>
);
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.836 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);
const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const OrdersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);


// --- COMPONENTS (LoadingScreen, AuthComponent are the same) ---
const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 text-white">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-dashed rounded-full animate-spin border-yellow-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">🍔</span>
                </div>
            </div>
            <p className="mt-4 text-lg font-semibold tracking-wider animate-pulse">Warming up the kitchen...</p>
        </div>
    );
};
const AuthComponent = ({ setUserData }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showWhatsappPrompt, setShowWhatsappPrompt] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || !userDoc.data().whatsapp) {
                setGoogleUser(user);
                setShowWhatsappPrompt(true);
            } else {
                setUserData({ ...user, ...userDoc.data() });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWhatsappSubmit = async (e) => {
        e.preventDefault();
        if (!/^\d{10,15}$/.test(whatsapp)) {
            setError("Please enter a valid WhatsApp number.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const userToUpdate = googleUser || auth.currentUser;
            if (userToUpdate) {
                await setDoc(doc(db, "users", userToUpdate.uid), {
                    email: userToUpdate.email,
                    displayName: userToUpdate.displayName,
                    whatsapp: whatsapp,
                    isAdmin: false,
                }, { merge: true });
                const userDoc = await getDoc(doc(db, "users", userToUpdate.uid));
                setUserData({ ...userToUpdate, ...userDoc.data() });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
            setShowWhatsappPrompt(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!isLogin) { // Signup
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                setIsLoading(false);
                return;
            }
            if (!/^\d{10,15}$/.test(whatsapp)) {
                setError("Please enter a valid WhatsApp number.");
                setIsLoading(false);
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    whatsapp: whatsapp,
                    isAdmin: false,
                });
                const userDoc = await getDoc(doc(db, "users", user.uid));
                setUserData({ ...user, ...userDoc.data() });
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    setError('Email Already Exists');
                } else {
                    setError(error.message);
                }
            }
        } else { // Login
            try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        setUserData({ ...user, ...userDoc.data() });
    } else {
        await signOut(auth);
        setError("User data not found. Please sign up.");
    }
} catch (error) {
    // Handle Firebase auth errors with friendly messages
    switch (error.code) {
        case "auth/wrong-password":
            setError("Invalid password. Please try again.");
            break;
        case "auth/user-not-found":
            setError("User does not exist. Please sign up.");
            break;
        case "auth/invalid-email":
            setError("Invalid email format.");
            break;
        case "auth/user-disabled":
            setError("This account has been disabled. Contact support.");
            break;
        case "auth/too-many-requests":
            setError("Too many failed attempts. Please wait and try again later.");
            break;
        case "auth/network-request-failed":
            setError("Network error. Please check your internet connection.");
            break;
        case "auth/invalid-credential":
            setError("Invalid login credentials. Please try again.");
            break;
        default:
            setError("Something went wrong. Please try again.");
            console.error("Login error:", error); // log for debugging
            break;
    }
}   
        }
        setIsLoading(false);
    };

    if (showWhatsappPrompt) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">One Last Step!</h2>
                    <p className="text-center mb-6">Please provide your WhatsApp number for order updates.</p>
                    <form onSubmit={handleWhatsappSubmit}>
                        <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="WhatsApp Number (e.g., 9876543210)"
                            className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-gray-900 font-bold p-3 rounded-lg hover:bg-yellow-500 transition duration-300 disabled:bg-gray-500">
                            {isLoading ? 'Saving...' : 'Save and Continue'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 bg-grid-yellow-400/[0.2]">
            <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-white border border-yellow-400/20">
                <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2">{isLogin ? 'Welcome Back!' : 'Join the Club'}</h2>
                <p className="text-center text-gray-400 mb-8">{isLogin ? 'Sign in to get your grub on.' : 'Create an account to start ordering.'}</p>

                <form onSubmit={handleEmailAuth}>
                    {!isLogin && (
                        <>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                required
                            />
                             <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="WhatsApp Number"
                                className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                required
                            />
                        </>
                    )}
                    {isLogin && (
                         <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    )}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                    />
                    {!isLogin && (
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    )}

                    {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

                    <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-gray-900 font-bold p-3 rounded-lg hover:bg-yellow-500 transition duration-300 disabled:bg-gray-500">
                        {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-white text-gray-700 font-semibold p-3 rounded-lg flex items-center justify-center hover:bg-gray-200 transition duration-300 disabled:bg-gray-400">
                    <GoogleIcon />
                    <span className="ml-2">Sign in with Google</span>
                </button>

                <p className="mt-8 text-center text-sm text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-yellow-400 hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- Main App Component (User View) ---
const UserApp = ({ userData, setUserData }) => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState({});
    const [userOrders, setUserOrders] = useState([]);
    const [view, setView] = useState('menu'); // 'menu', 'cart', 'checkout', 'orders'
    const [deliveryOption, setDeliveryOption] = useState('delivery');
    const [paymentInfo, setPaymentInfo] = useState({ upiId: '', qrCodeUrl: '' });
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', timer: false });
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [upiTransactionId, setUpiTransactionId] = useState('');
    const upiTransactionIdRef = useRef(null);

    // UseEffect to keep focus on the input field after each re-render
    useEffect(() => {
        // Focus the input field every time the component re-renders
        if (upiTransactionIdRef.current) {
            upiTransactionIdRef.current.focus();
        }
    }, [upiTransactionId]); 
    const cartRef = doc(db, 'carts', userData.uid);

    useEffect(() => {
        const unsubscribeMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
            const menuData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenu(menuData);
        });
        
        const unsubscribePayment = onSnapshot(doc(db, "config", "payment"), (doc) => {
            if (doc.exists()) {
                setPaymentInfo(doc.data());
            }
        });

        const q = query(collection(db, "orders"), where("userId", "==", userData.uid));
        const unsubscribeOrders = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            ordersData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            setUserOrders(ordersData);
        });

        const unsubscribeCart = onSnapshot(cartRef, (doc) => {
            if (doc.exists()) {
                setCart(doc.data().items || {});
            }
        });

        return () => {
            unsubscribeMenu();
            unsubscribePayment();
            unsubscribeOrders();
            unsubscribeCart();
        };
    }, [userData.uid]);

    const updateCartInDb = async (newCart) => {
        await setDoc(cartRef, { items: newCart });
    };

    const addToCart = (item) => {
        const newCart = { ...cart };
        const existingItem = newCart[item.id];
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;

        if (currentQtyInCart >= item.quantity) {
            setModalContent({ title: 'Stock Limit', message: `Available Only ${item.quantity} Quantity`, timer: false });
            setShowModal(true);
            return;
        }

        if (existingItem) {
            newCart[item.id] = { ...existingItem, quantity: existingItem.quantity + 1 };
        } else {
            newCart[item.id] = { ...item, quantity: 1 };
        }
        updateCartInDb(newCart);
    };

    const removeFromCart = (itemId) => {
        const newCart = { ...cart };
        const existingItem = newCart[itemId];

        if (!existingItem) return;

        if (existingItem.quantity > 1) {
            newCart[itemId] = { ...existingItem, quantity: existingItem.quantity - 1 };
        } else {
            delete newCart[itemId];
        }
        updateCartInDb(newCart);
    };

    const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = Object.values(cart).reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
    const deliveryCharge = deliveryOption === 'delivery' ? 10 : 0;
    const finalTotal = cartTotal + deliveryCharge;

    const placeOrder = async () => {
        if (deliveryOption === 'delivery' && (!upiTransactionId || upiTransactionId.length < 12)) {
            setModalContent({ title: 'Invalid Input', message: 'Please enter a valid 12-digit UPI Transaction ID.', timer: false });
            setShowModal(true);
            return;
        }
        
        setIsPlacingOrder(true);
        try {
         await runTransaction(db, async (transaction) => {
    // Phase 1: Read all documents first
    const menuItemsRefs = Object.values(cart).map(item => doc(db, "menu", item.id));
    const menuItemDocs = await Promise.all(menuItemsRefs.map(ref => transaction.get(ref)));

    // Phase 2: Now, perform all writes
    menuItemDocs.forEach((menuItemDoc, index) => {
        const cartItem = Object.values(cart)[index];
        if (!menuItemDoc.exists()) {
            throw new Error(`Item ${cartItem.name} not found.`);
        }
        const newQuantity = menuItemDoc.data().quantity - cartItem.quantity;
        if (newQuantity < 0) {
            throw new Error(`Not enough stock for ${cartItem.name}.`);
        }
        transaction.update(menuItemDoc.ref, { quantity: newQuantity });
    });

    // Phase 3: Create the order and delete the cart
    const newOrderRef = doc(collection(db, "orders")); // Generate a new doc ref for the order
    transaction.set(newOrderRef, {
        userId: userData.uid,
        items: Object.values(cart),
        totalAmount: finalTotal,
        orderType: deliveryOption,
        status: deliveryOption === 'delivery' ? 'payment_pending' : 'preparing',
        createdAt: Timestamp.now(),
        userName: userData.displayName || userData.email,
        upiTransactionId: deliveryOption === 'delivery' ? upiTransactionId : 'N/A',
    });

    transaction.delete(cartRef);
});
            const newOrderData = {
    userName: userData.displayName || userData.email,
    orderType: deliveryOption,
    totalAmount: finalTotal,
    upiTransactionId: deliveryOption === 'delivery' ? upiTransactionId : 'N/A',
    items: Object.values(cart)
};

// Send email notification to admin
await fetch('/api/send-order-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        orderDetails: newOrderData,
        toEmail: 'bibekthagunna102367009@gmail.com' // <-- REPLACE WITH YOUR EMAIL
    }),
});

            if (deliveryOption === 'takeaway') {
                setModalContent({ title: 'Order Placed!', message: 'Please collect your order from Room 510.', timer: false });
            } else {
                setModalContent({ title: 'Order Submitted!', message: 'Your order will be confirmed after payment verification.', timer: false });
            }
            setShowModal(true);
            setCart({});
            setView('orders');
            setUpiTransactionId('');

        } catch (error) {
            console.error("Order failed: ", error);
            setModalContent({ title: 'Order Failed', message: `Could not place order: ${error.message}`, timer: false });
            setShowModal(true);
        } finally {
            setIsPlacingOrder(false);
        }
    };
    
    const renderContent = () => {
        switch (view) {
            case 'cart': return <CartView />;
            case 'checkout': return <CheckoutView />;
            case 'orders': return <OrdersView />;
            default: return <MenuView />;
        }
    };

    const MenuView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
            {menu.map(item => {
                const itemInCart = cart[item.id];
                const quantityInCart = itemInCart ? itemInCart.quantity : 0;

                return (
                    <div key={item.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                        <img src={item.imageUrl || `https://placehold.co/600x400/1F2937/FBBF24?text=${item.name}`} alt={item.name} className="w-full h-48 object-cover"/>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-yellow-400">{item.name}</h3>
                            <p className="text-gray-400 mt-1 flex-grow">{item.description}</p>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-2xl font-semibold text-white">₹{item.sellingPrice}</p>
                                {item.quantity > 0 ? (
                                    quantityInCart === 0 ? (
                                        <button onClick={() => addToCart(item)} className="bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300">
                                            Add
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-gray-700 rounded-full">
                                            <button onClick={() => removeFromCart(item.id)} className="px-3 py-1 text-lg font-bold text-white rounded-full hover:bg-gray-600">-</button>
                                            <span className="font-bold text-white w-8 text-center">{quantityInCart}</span>
                                            <button onClick={() => addToCart(item)} className="px-3 py-1 text-lg font-bold text-white rounded-full hover:bg-gray-600">+</button>
                                        </div>
                                    )
                                ) : (
                                    <button disabled className="bg-gray-600 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-not-allowed">
                                        Out of Stock
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
    
    const CartView = () => (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Your Cart</h2>
            {Object.keys(cart).length === 0 ? (
                <p className="text-gray-400 text-center">Your cart is empty. Go grab some food!</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {Object.values(cart).map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                    <p className="text-gray-400">₹{item.sellingPrice}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-gray-700 rounded-full">
                                        <button onClick={() => removeFromCart(item.id)} className="px-3 py-1 text-lg font-bold text-white rounded-full hover:bg-gray-600">-</button>
                                        <span className="font-bold text-white w-8 text-center">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="px-3 py-1 text-lg font-bold text-white rounded-full hover:bg-gray-600">+</button>
                                    </div>
                                    <p className="font-bold text-white w-20 text-right">₹{item.sellingPrice * item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <div className="flex justify-between text-xl font-bold text-white">
                            <span>Subtotal</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <button onClick={() => setView('checkout')} className="w-full mt-6 bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg text-lg hover:bg-yellow-500 transition duration-300">
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    const CheckoutView = () => {
        const upiLink = `upi://pay?pa=${paymentInfo.upiId}&pn=Hostel%20Bites&am=${finalTotal}&cu=INR`;
        return (
            <div className="p-4 md:p-8 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-yellow-400 mb-6">Checkout</h2>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">Delivery Option</h3>
                    <div className="flex gap-4 mb-6">
                        <button onClick={() => setDeliveryOption('delivery')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${deliveryOption === 'delivery' ? 'bg-yellow-400/20 border-yellow-400' : 'border-gray-600 hover:border-yellow-300'}`}>
                            <p className="font-bold text-white">Room Delivery</p>
                            <p className="text-sm text-gray-400">+ ₹10 Delivery Charge</p>
                        </button>
                        <button onClick={() => setDeliveryOption('takeaway')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${deliveryOption === 'takeaway' ? 'bg-yellow-400/20 border-yellow-400' : 'border-gray-600 hover:border-yellow-300'}`}>
                            <p className="font-bold text-white">Takeaway</p>
                            <p className="text-sm text-gray-400">Collect from Room 510</p>
                        </button>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
                    <div className="space-y-2 text-gray-300">
                        <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                        <div className="flex justify-between"><span>Delivery Charge</span><span>₹{deliveryCharge}</span></div>
                        <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-2 mt-2"><span>Total</span><span>₹{finalTotal}</span></div>
                    </div>

                    {deliveryOption === 'delivery' && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Payment</h3>
                            <p className="text-gray-400 mb-2">1. Pay using the QR code or the button below.</p>
                            <div className="bg-gray-700 p-4 rounded-lg text-center">
                                {paymentInfo.qrCodeUrl && <img src={paymentInfo.qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto mb-4 rounded-lg" />}
                                <p className="text-lg font-mono text-yellow-400 break-all">{paymentInfo.upiId}</p>
                            </div>
                            <a href={upiLink} className="w-full mt-4 bg-blue-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-blue-600 transition duration-300 text-center block">
                                Pay ₹{finalTotal} via UPI App
                            </a>
                            <p className="text-gray-400 mt-4 mb-2">2. Enter the 12-digit UPI Transaction ID from your payment app below.</p>
                            <input
                                ref={upiTransactionIdRef}
                                type="text"
                                value={upiTransactionId}
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    if (/^[A-Z0-9]*$/.test(value) && value.length <= 12) {
                                        setUpiTransactionId(value);
                                    }
                                }}
                                placeholder="Enter UPI Transaction ID here"
                                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                maxLength="12"
                            />
                        </div>
                    )}

                    <button onClick={placeOrder} disabled={isPlacingOrder || Object.keys(cart).length === 0} className="w-full mt-8 bg-green-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-green-600 transition duration-300 disabled:bg-gray-500">
                        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        );
    }
    
    const OrdersView = () => (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Your Orders</h2>
            <div className="space-y-4">
                {userOrders.length > 0 ? userOrders.map(order => (
                    <div key={order.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg text-white capitalize">{order.orderType} Order</p>
                                <p className="text-sm text-gray-400">{order.createdAt.toDate().toLocaleString()}</p>
                                <p className="text-sm text-yellow-400 font-semibold capitalize mt-1">Status: {order.status.replace(/_/g, ' ')}</p>
                            </div>
                            <p className="font-bold text-xl text-white">₹{order.totalAmount}</p>
                        </div>
                        <div className="mt-2 border-t border-gray-600 pt-2">
                            {order.items.map((item, index) => (
                                <p key={index} className="text-gray-300">{item.name} x {item.quantity}</p>
                            ))}
                        </div>
                    </div>
                )) : <p className="text-gray-400 text-center">You haven't placed any orders yet.</p>}
            </div>
        </div>
    );
    
    const Timer = ({ duration, onEnd }) => {
        const [timeLeft, setTimeLeft] = useState(duration);
        useEffect(() => {
            if (timeLeft <= 0) { onEnd(); return; }
            const intervalId = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearInterval(intervalId);
        }, [timeLeft, onEnd]);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return <div className="text-4xl font-bold text-yellow-400">{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</div>;
    };

    const Modal = ({ title, message, hasTimer, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                {hasTimer && <Timer duration={300} onEnd={onClose} />}
                <button onClick={onClose} className="mt-6 w-full bg-yellow-400 text-gray-900 font-bold p-3 rounded-lg hover:bg-yellow-500 transition duration-300">
                    Close
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {showModal && <Modal title={modalContent.title} message={modalContent.message} hasTimer={modalContent.timer} onClose={() => setShowModal(false)} />}
            <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40 shadow-md">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('menu')}>
                        <CanteenIcon />
                        <h1 className="text-xl font-bold text-yellow-400">Hostel Bites</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setView('orders')} className="relative p-2 rounded-full hover:bg-gray-700">
                            <OrdersIcon />
                        </button>
                        <button onClick={() => setView('cart')} className="relative p-2 rounded-full hover:bg-gray-700">
                            <CartIcon />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button onClick={() => signOut(auth)} className="bg-red-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-red-600 transition">
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

// --- Admin Panel Component ---
const AdminPanel = ({ userData }) => {
    const [menu, setMenu] = useState([]);
    const [orders, setOrders] = useState([]);
    const [userCarts, setUserCarts] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', description: '', mrp: '', sellingPrice: '', quantity: '', imageUrl: '' });
    const [editingItem, setEditingItem] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState({ upiId: '', qrCodeUrl: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null);

    const businessData = orders.reduce((acc, order) => {
        if (order.status === 'delivered') {
            acc.totalRevenue += order.totalAmount;
            const orderProfit = order.items.reduce((profit, item) => {
                const itemProfit = (item.sellingPrice - item.mrp) * item.quantity;
                return profit + itemProfit;
            }, 0);
            acc.totalProfit += orderProfit;
        }
        return acc;
    }, { totalRevenue: 0, totalProfit: 0 });
    
    useEffect(() => {
        const unsubscribeMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
            const menuData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMenu(menuData);
        });

        const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            ordersData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            setOrders(ordersData);
        });

        const unsubscribeCarts = onSnapshot(collection(db, "carts"), async (snapshot) => {
            const cartsData = [];
            for (const cartDoc of snapshot.docs) {
                const userDoc = await getDoc(doc(db, "users", cartDoc.id));
                if (userDoc.exists()) {
                    cartsData.push({
                        userId: cartDoc.id,
                        userName: userDoc.data().displayName || userDoc.data().email,
                        ...cartDoc.data()
                    });
                }
            }
            setUserCarts(cartsData);
        });

        const fetchPaymentInfo = async () => {
            const docRef = doc(db, "config", "payment");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPaymentInfo(docSnap.data());
            }
        };
        fetchPaymentInfo();

        return () => {
            unsubscribeMenu();
            unsubscribeOrders();
            unsubscribeCarts();
        };
    }, []);

    const handleInputChange = (e, itemState, setItemState) => {
        const { name, value } = e.target;
        setItemState({ ...itemState, [name]: value });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.mrp || !newItem.sellingPrice || !newItem.quantity) return;
        await addDoc(collection(db, "menu"), { 
            ...newItem, 
            mrp: Number(newItem.mrp),
            sellingPrice: Number(newItem.sellingPrice),
            quantity: Number(newItem.quantity)
        });
        setNewItem({ name: '', description: '', mrp: '', sellingPrice: '', quantity: '', imageUrl: '' });
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            await deleteDoc(doc(db, "menu", id));
        }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        if (!editingItem || !editingItem.id) return;
        const { id, ...data } = editingItem;
        await updateDoc(doc(db, "menu", id), { 
            ...data, 
            mrp: Number(data.mrp),
            sellingPrice: Number(data.sellingPrice),
            quantity: Number(data.quantity)
        });
        setEditingItem(null);
    };

    const handlePaymentInfoUpdate = async (e) => {
        e.preventDefault();
        await setDoc(doc(db, "config", "payment"), paymentInfo);
        alert("Payment info updated!");
    };
    const handleCancelOrder = async (orderToCancel) => {
    try {
        await runTransaction(db, async (transaction) => {
            // 1. Add stock back to menu items
            for (const item of orderToCancel.items) {
                const menuItemRef = doc(db, "menu", item.id);
                const menuItemDoc = await transaction.get(menuItemRef);
                if (menuItemDoc.exists()) {
                    const newQuantity = menuItemDoc.data().quantity + item.quantity;
                    transaction.update(menuItemRef, { quantity: newQuantity });
                }
            }
            // 2. Update the order status to 'cancelled'
            const orderRef = doc(db, "orders", orderToCancel.id);
            transaction.update(orderRef, { status: 'cancelled' });
        });
    } catch (error) {
        console.error("Error cancelling order: ", error);
        // You can replace this with your themed modal if you prefer
        alert("Failed to cancel order. Please try again.");
    }
};

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    };

    const handleClearAction = (action) => {
        setActionToConfirm(action);
        setShowConfirmModal(true);
    };

    const confirmAction = async () => {
    if (actionToConfirm) {
        if (actionToConfirm.type === 'clearOrder') {
            await deleteDoc(doc(db, "orders", actionToConfirm.id));
        } else if (actionToConfirm.type === 'clearCart') {
            await deleteDoc(doc(db, "carts", actionToConfirm.id));
        } else if (actionToConfirm.type === 'cancelOrder') {
            await handleCancelOrder(actionToConfirm.order);
        }
        setActionToConfirm(null);
        setShowConfirmModal(false);
    }
};
    
    const startEditing = (item) => {
        setEditingItem(item);
    };

    const ConfirmationModal = ({ onConfirm, onCancel, title, message }) => (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition duration-300">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            {showConfirmModal && <ConfirmationModal 
                onConfirm={confirmAction} 
                onCancel={() => setShowConfirmModal(false)} 
                title={actionToConfirm.type === 'clearOrder' ? "Clear Order?" : "Clear Cart?"}
                message="This action cannot be undone."
            />}
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-400">Admin Panel</h1>
                    <button onClick={() => signOut(auth)} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition">
                        Logout
                    </button>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Business Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-400">₹{businessData.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Total Profit</p>
                            <p className="text-2xl font-bold text-green-400">₹{businessData.totalProfit.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Recent Orders</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {orders.length > 0 ? orders.map(order => (
                            <div key={order.id} className="bg-gray-700 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-white">From: {order.userName}</p>
                                        <p className="text-sm text-gray-400">
                                            {order.createdAt.toDate().toLocaleString()}
                                        </p>
                                        <p className="text-sm text-yellow-400 font-semibold capitalize">Status: {order.status.replace(/_/g, ' ')}</p>
                                        {order.upiTransactionId && order.upiTransactionId !== 'N/A' && (
                                            <p className="text-xs text-gray-300 mt-1">UPI ID: {order.upiTransactionId}</p>
                                        )}
                                    </div>
                                    <p className="font-bold text-xl text-white">₹{order.totalAmount}</p>
                                </div>
                                <div className="mt-2 border-t border-gray-600 pt-2">
                                    {order.items.map((item, index) => (
                                        <p key={index} className="text-gray-300">{item.name} x {item.quantity}</p>
                                    ))}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
    {order.status === 'payment_pending' && (
        <>
            <button onClick={() => handleUpdateOrderStatus(order.id, 'preparing')} className="bg-green-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-green-600">
                Verify Payment
            </button>
            <button onClick={() => handleClearAction({type: 'cancelOrder', order: order})} className="bg-red-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-red-600">
                Cancel
            </button>
        </>
    )}
    {order.status === 'preparing' && (
        <>
            {order.orderType === 'delivery' && (
                <button onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')} className="bg-blue-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-blue-600">
                    Out for Delivery
                </button>
            )}
            {order.orderType === 'takeaway' && (
                <button onClick={() => handleUpdateOrderStatus(order.id, 'ready_for_pickup')} className="bg-blue-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-blue-600">
                    Ready for Pickup
                </button>
            )}
            <button onClick={() => handleClearAction({type: 'cancelOrder', order: order})} className="bg-red-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-red-600">
                Cancel
            </button>
        </>
    )}
    {(order.status === 'out_for_delivery' || order.status === 'ready_for_pickup') && (
        <button onClick={() => handleUpdateOrderStatus(order.id, 'delivered')} className="bg-purple-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-purple-600">
            Mark as Delivered
        </button>
    )}
    {(order.status === 'delivered' || order.status === 'cancelled') && (
        <button onClick={() => handleClearAction({type: 'clearOrder', id: order.id})} className="bg-gray-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-gray-600">
            Clear
        </button>
    )}
</div>
                            </div>
                        )) : <p className="text-gray-400">No orders yet.</p>}
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Active User Carts</h2>
                    <div className="space-y-3">
                        {userCarts.length > 0 ? userCarts.map(cart => (
                            <div key={cart.userId} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg text-white">{cart.userName}</p>
                                    <p className="text-sm text-gray-400">{Object.keys(cart.items).length} items in cart</p>
                                </div>
                                <button onClick={() => handleClearAction({type: 'clearCart', id: cart.userId})} className="bg-red-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-red-600">
                                    Clear Cart
                                </button>
                            </div>
                        )) : <p className="text-gray-400">No active carts.</p>}
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Payment Settings</h2>
                    <form onSubmit={handlePaymentInfoUpdate} className="space-y-4">
                        <input
                            type="text"
                            name="upiId"
                            value={paymentInfo.upiId}
                            onChange={(e) => handleInputChange(e, paymentInfo, setPaymentInfo)}
                            placeholder="UPI ID (e.g., yourname@upi)"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        />
                        <input
                            type="text"
                            name="qrCodeUrl"
                            value={paymentInfo.qrCodeUrl}
                            onChange={(e) => handleInputChange(e, paymentInfo, setPaymentInfo)}
                            placeholder="QR Code Image URL"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                        />
                        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">
                            Update Payment Info
                        </button>
                    </form>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                    <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            value={editingItem ? editingItem.name : newItem.name}
                            onChange={(e) => handleInputChange(e, editingItem || newItem, editingItem ? setEditingItem : setNewItem)}
                            placeholder="Item Name"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 md:col-span-2"
                            required
                        />
                        <input
                            type="number"
                            name="mrp"
                            value={editingItem ? editingItem.mrp : newItem.mrp}
                            onChange={(e) => handleInputChange(e, editingItem || newItem, editingItem ? setEditingItem : setNewItem)}
                            placeholder="MRP (Cost Price)"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                            required
                        />
                        <input
                            type="number"
                            name="sellingPrice"
                            value={editingItem ? editingItem.sellingPrice : newItem.sellingPrice}
                            onChange={(e) => handleInputChange(e, editingItem || newItem, editingItem ? setEditingItem : setNewItem)}
                            placeholder="Selling Price"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                            required
                        />
                        <input
                            type="number"
                            name="quantity"
                            value={editingItem ? editingItem.quantity : newItem.quantity}
                            onChange={(e) => handleInputChange(e, editingItem || newItem, editingItem ? setEditingItem : setNewItem)}
                            placeholder="Quantity"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 md:col-span-2"
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            value={editingItem ? editingItem.description : newItem.description}
                            onChange={(e) => handleInputChange(e, editingItem || newItem, editingItem ? setEditingItem : setNewItem)}
                            placeholder="Description"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 md:col-span-2"
                        />
                        <input
                            type="text"
                            name="imageUrl"
                            value={editingItem ? editingItem.imageUrl : newItem.imageUrl}
                            onChange={(e) => handleInputChange(e, editingItem || newItem, editingItem ? setEditingItem : setNewItem)}
                            placeholder="Image URL (optional)"
                            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 md:col-span-2"
                        />
                        <div className="md:col-span-2 flex gap-4">
                            <button type="submit" className="flex-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                            {editingItem && (
                                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-white mb-4">Current Menu</h2>
                    <div className="space-y-3">
                        {menu.map(item => (
                            <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg text-white">{item.name}</p>
                                    <p className="text-gray-400">MRP: ₹{item.mrp} | Sells at: ₹{item.sellingPrice} - Stock: {item.quantity}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => startEditing(item)} className="bg-yellow-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-yellow-600">Edit</button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="bg-red-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-red-600">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                const userDocRef = doc(db, "users", authUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData({ ...authUser, ...userDocSnap.data() });
                } else {
                    setUserData(null);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setTimeout(() => setIsLoading(false), 1500);
        });
        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!user || !userData) {
        return <AuthComponent setUserData={setUserData} />;
    }



    if (userData && userData.isAdmin) {
        return <AdminPanel userData={userData} />;
    }

    return <UserApp userData={userData} setUserData={setUserData} />;
}
