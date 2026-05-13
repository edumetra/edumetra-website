import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSignup } from './SignupContext';

const PremiumContext = createContext(null);

// Feature limits per tier
const LIMITS = {
    free: { compare: 2, saved: 5, aiInsights: false, aiLimit: 1 },
    premium: { compare: 5, saved: 50, aiInsights: true, aiLimit: 5 },
    pro: { compare: 10, saved: Infinity, aiInsights: true, aiLimit: Infinity },
};

export function PremiumProvider({ children }) {
    const { user } = useSignup();
    const [tier, setTier] = useState('free');
    const [visibilityTier, setVisibilityTier] = useState('free');
    const [aiUsage, setAiUsage] = useState(0);
    const [loadingTier, setLoadingTier] = useState(false);

    useEffect(() => {
        if (user) {
            fetchTier();
        } else {
            setTier('free');
            setVisibilityTier('free');
        }
    }, [user]);

    const fetchTier = async () => {
        setLoadingTier(true);
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('account_type, ai_usage_count')
                .eq('id', user.id)
                .single();
            
            if (error) throw error;

            const apiTier = data?.account_type;
            setTier(apiTier || 'free');
            setAiUsage(data?.ai_usage_count || 0);
            setVisibilityTier(apiTier || 'free');
        } catch (err) {
            console.warn('PremiumProvider: Failed to fetch tier (possibly blocked):', err);
            // Default to free state
            setTier('free');
            setVisibilityTier('free');
        } finally {
            setLoadingTier(false);
        }
    };

    const refreshUsage = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('user_profiles')
            .select('ai_usage_count')
            .eq('id', user.id)
            .single();
        if (data) setAiUsage(data.ai_usage_count || 0);
    };

    const limits = LIMITS[tier] || LIMITS.free;
    const isPremium = tier === 'premium' || tier === 'pro';
    const isPro = tier === 'pro';

    const can = (feature) => {
        if (feature === 'aiInsights') return limits.aiInsights;
        if (feature in limits) return limits[feature];
        return true;
    };

    /**
     * Checks if a section is fully visible to the user based on the college's visibility arrays.
     * @param {string} sectionId - The ID of the section (e.g., 'placement', 'reviews')
     * @param {object} collegeDetails - The college details object containing visible_in_* arrays
     * @returns {boolean} True if visible, false if locked
     */
    const isSectionVisible = (sectionId, collegeDetails) => {
        if (!collegeDetails) return true; // Default to true if no details

        // Map the current visibilityTier to the exact column name in DB
        const arrayKey = `visible_in_${visibilityTier}`;

        const allowedSections = collegeDetails[arrayKey];
        if (!Array.isArray(allowedSections)) return true; // Default true if array is missing/malformed

        return allowedSections.includes(sectionId);
    };

    return (
        <PremiumContext.Provider value={{ tier, visibilityTier, isPremium, isPro, limits, can, loadingTier, isSectionVisible, aiUsage, refreshUsage }}>
            {children}
        </PremiumContext.Provider>
    );
}

export const usePremium = () => useContext(PremiumContext);
