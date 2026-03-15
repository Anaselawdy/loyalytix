import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBusiness = async (currentUser) => {
        if (currentUser) {
            console.log('AuthContext - current session user:', currentUser);

            let { data: bizData, error: lookupError } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', currentUser.id)
                .single();

            console.log('existing business lookup:', { data: bizData, error: lookupError });

            if (!bizData) {
                // Determine if we have setup details waiting from SignUp
                const setupJson = localStorage.getItem('pendingBusinessSetup');
                const setup = setupJson ? JSON.parse(setupJson) : { name: 'My Business', phone: '000000' };

                console.log('Attempting to create business profile now that user is authenticated...');
                
                // 1. Insert Business
                const { data: newBiz, error: insertError } = await supabase
                    .from('businesses')
                    .insert([{
                        owner_id: currentUser.id,
                        name: setup.name,
                        phone: setup.phone,
                        industry: 'restaurant'
                    }])
                    .select()
                    .single();

                console.log('business insert result:', { data: newBiz, error: insertError });

                if (newBiz) {
                    bizData = newBiz;
                    
                    // 2. Insert Settings
                    const { error: settingsError } = await supabase
                        .from('settings')
                        .insert([{
                            business_id: newBiz.id,
                            points_per_currency: 10,
                            vip_threshold: 1000,
                            reward_visits_count: 5,
                            inactive_days: 30
                        }]);
                    
                    console.log('settings insert error if any:', settingsError);

                    // Clear local storage pending data
                    localStorage.removeItem('pendingBusinessSetup');
                }
            }

            setBusiness(bizData);
        } else {
            setBusiness(null);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            fetchBusiness(currentUser).finally(() => setLoading(false));
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            fetchBusiness(currentUser);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        business,
        refreshBusiness: () => fetchBusiness(user),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
