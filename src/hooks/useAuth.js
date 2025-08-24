// Custom hook for authentication
import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, db, doc, getDoc } from '../services/firebase';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                try {
                    const userDocRef = doc(db, "users", authUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    let combinedUserData;

                    if (userDocSnap.exists()) {
                        const firestoreData = userDocSnap.data();
                        // Prioritize Firestore data but keep Firebase Auth data as fallback
                        combinedUserData = {
                            // Firebase Auth data
                            uid: authUser.uid,
                            email: authUser.email,
                            displayName: authUser.displayName || firestoreData.displayName,
                            photoURL: authUser.photoURL || firestoreData.photoURL,
                            emailVerified: authUser.emailVerified,
                            // Firestore data
                            ...firestoreData,
                            // Override with Firebase Auth data if it exists
                            ...(authUser.photoURL && { photoURL: authUser.photoURL }),
                            ...(authUser.displayName && { displayName: authUser.displayName })
                        };
                    } else {
                        // Use Firebase Auth data if no Firestore document
                        combinedUserData = {
                            uid: authUser.uid,
                            email: authUser.email,
                            displayName: authUser.displayName,
                            photoURL: authUser.photoURL,
                            emailVerified: authUser.emailVerified
                        };
                    }

                    console.log('Combined user data:', combinedUserData);
                    setUserData(combinedUserData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Fallback to Firebase Auth data only
                    setUserData({
                        uid: authUser.uid,
                        email: authUser.email,
                        displayName: authUser.displayName,
                        photoURL: authUser.photoURL,
                        emailVerified: authUser.emailVerified
                    });
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, userData, loading, setUserData };
};
