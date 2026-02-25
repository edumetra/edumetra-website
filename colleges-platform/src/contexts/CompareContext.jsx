import { createContext, useContext, useState, useEffect } from 'react';
import { usePremium } from './PremiumContext';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
    const [compareList, setCompareList] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('compareList') || '[]');
        } catch {
            return [];
        }
    });
    // upgradeModal state lives here so any addToCompare call can trigger it
    const [showUpgrade, setShowUpgrade] = useState(false);

    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    // usePremium may not be available if PremiumProvider isn't mounted yet
    let limits = { compare: 2 };
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const premium = usePremium();
        if (premium) limits = premium.limits;
    } catch {
        // PremiumContext not ready
    }

    const maxCompare = limits?.compare ?? 2;

    const addToCompare = (college) => {
        let triggered = false;
        setCompareList(prev => {
            if (prev.find(c => c.id === college.id)) return prev;
            if (prev.length >= maxCompare) {
                triggered = true;
                return prev; // don't add
            }
            return [...prev, college];
        });
        if (triggered) setShowUpgrade(true);
    };

    const removeFromCompare = (id) =>
        setCompareList(prev => prev.filter(c => c.id !== id));

    const clearCompare = () => setCompareList([]);
    const isInCompare = (id) => compareList.some(c => c.id === id);
    const isFull = compareList.length >= maxCompare;

    return (
        <CompareContext.Provider value={{
            compareList, addToCompare, removeFromCompare, clearCompare,
            isInCompare, isFull, maxCompare,
            showUpgradeModal: showUpgrade, closeUpgradeModal: () => setShowUpgrade(false),
        }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const ctx = useContext(CompareContext);
    if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
    return ctx;
}
