import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSignup } from './SignupContext';

const PremiumContext = createContext(null);

// Feature limits per tier
const LIMITS = {
    free: { compare: 2, saved: 5, aiInsights: false },
    premium: { compare: 5, saved: 50, aiInsights: true },
    pro: { compare: 10, saved: Infinity, aiInsights: true },
};

export function PremiumProvider({ children }) {
    const { user } = useSignup();
    const [tier, setTier] = useState('free');
    const [loadingTier, setLoadingTier] = useState(false);

    useEffect(() => {
        if (user) fetchTier();
        else setTier('free');
    }, [user]);

    const fetchTier = async () => {
        setLoadingTier(true);
        const { data } = await supabase
            .from('user_profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();
        setTier(data?.subscription_tier || 'free');
        setLoadingTier(false);
    };

    const limits = LIMITS[tier] || LIMITS.free;
    const isPremium = tier === 'premium' || tier === 'pro';
    const isPro = tier === 'pro';

    const can = (feature) => {
        if (feature === 'aiInsights') return limits.aiInsights;
        if (feature in limits) return limits[feature];
        return true;
    };

    return (
        <PremiumContext.Provider value={{ tier, isPremium, isPro, limits, can, loadingTier }}>
            {children}
        </PremiumContext.Provider>
    );
}

export const usePremium = () => useContext(PremiumContext);
