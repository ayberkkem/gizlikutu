'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                setUser(firebaseUser);

                // Rol kontrolü: users/{uid}.role === "admin"
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                const role = userDoc.data()?.role;

                if (role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    // Admin değilse ve dashboard'daysa login'e at
                    if (!pathname.startsWith('/login')) {
                        router.push('/login?error=unauthorized');
                    }
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                // Login değilse ve dashboard'daysa login'e at
                if (!pathname.startsWith('/login')) {
                    router.push('/login');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
