import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
    const [compareList, setCompareList] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('compareList') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    // Hardcode to 3 max as per new user requirements
    const maxCompare = 3;

    const addToCompare = (college) => {
        let limitHit = false;
        setCompareList(prev => {
            if (prev.find(c => c.id === college.id)) return prev;
            if (prev.length >= maxCompare) {
                limitHit = true;
                return prev; // don't add
            }
            return [...prev, college];
        });
        if (limitHit) toast.error('You can only compare up to 3 colleges at a time.');
    };

    const removeFromCompare = (id) =>
        setCompareList(prev => prev.filter(c => c.id !== id));

    const clearCompare = () => setCompareList([]);
    const isInCompare = (id) => compareList.some(c => c.id === id);
    const isFull = compareList.length >= maxCompare;

    return (
        <CompareContext.Provider value={{
            compareList, addToCompare, removeFromCompare, clearCompare,
            isInCompare, isFull, maxCompare
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
