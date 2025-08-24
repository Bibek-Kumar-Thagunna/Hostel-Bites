// Modern authentication component with Google and Email/Password
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from '../../services/firebase';
import { auth, db } from '../../services/firebase';
import { doc, setDoc, getDoc } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';

const AuthComponent = () => {
    const { setUserData } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showWhatsappPrompt, setShowWhatsappPrompt] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

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
                        console.error("Login error:", error);
                        break;
                }
            }
        }
        setIsLoading(false);
    };

    if (showWhatsappPrompt) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
                <motion.div
                    className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">One Last Step!</h2>
                        <p className="text-gray-600">Please provide your WhatsApp number for order updates.</p>
                    </div>

                    <form onSubmit={handleWhatsappSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                WhatsApp Number
                            </label>
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="9876543210"
                                className="input-primary"
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                className="bg-red-50 border border-red-200 rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <p className="text-red-600 text-sm">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full"
                        >
                            {isLoading ? 'Saving...' : 'Save and Continue'}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🍔</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {isLogin ? 'Welcome Back!' : 'Join the Club'}
                    </h2>
                    <p className="text-gray-600">
                        {isLogin ? 'Sign in to get your grub on.' : 'Create an account to start ordering.'}
                    </p>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-6">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="input-primary pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="9876543210"
                                    className="input-primary"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="input-primary pl-10"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="input-primary pl-10 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="input-primary pl-10 pr-10"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <motion.div
                            className="bg-red-50 border border-red-200 rounded-xl p-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <p className="text-red-600 text-sm">{error}</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full"
                    >
                        {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 disabled:bg-gray-100 flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.836 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
                    </svg>
                    Sign in with Google
                </button>

                <p className="mt-8 text-center text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-semibold text-primary-600 hover:text-primary-700 ml-1"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default AuthComponent;
