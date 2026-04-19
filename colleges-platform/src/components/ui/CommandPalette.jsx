import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Building2, ArrowRight, LayoutDashboard, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const GLOBAL_PAGES = [
    { id: 'page-home', name: 'Home', type: 'Page', path: '/', icon: <Compass className="w-4 h-4" /> },
    { id: 'page-colleges', name: 'Explore Colleges', type: 'Page', path: '/colleges', icon: <Search className="w-4 h-4" /> },
    { id: 'page-compare', name: 'Compare Colleges', type: 'Page', path: '/compare', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'page-dashboard', name: 'My Dashboard / Profile', type: 'Page', path: '/profile', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'page-pricing', name: 'Pricing & Pro Plans', type: 'Page', path: '/pricing', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'page-eligibility', name: 'Eligibility Checker', type: 'Page', path: '/eligibility', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'page-news', name: 'News & Updates', type: 'Page', path: '/news-updates', icon: <ArrowRight className="w-4 h-4" /> },
];

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Toggle on Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Handle search logic
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
            return;
        }

        // Focus input when opened
        setTimeout(() => inputRef.current?.focus(), 150);

        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);

            // Safety timeout to reset loading state if request is blocked
            const safetyTimeout = setTimeout(() => {
                setLoading(false);
            }, 5000);

            try {
                // 1. Filter local static pages
                const filteredPages = GLOBAL_PAGES.filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase()) || 
                    p.path.toLowerCase().includes(query.toLowerCase())
                );

                // 2. Fetch colleges from Supabase
                const { data, error } = await supabase
                    .from('colleges')
                    .select('id, slug, name, location_city, location_state, type')
                    .ilike('name', `%${query}%`)
                    .eq('visibility', 'public')
                    .limit(5);

                if (error) throw error;

                // 3. Combine them
                const combined = [
                    ...filteredPages.map(p => ({ ...p, isPage: true })),
                    ...(data || []).map(c => ({ ...c, isPage: false }))
                ];

                setResults(combined);
                setSelectedIndex(0);
            } catch (err) {
                console.warn('CommandPalette: Search failed (possibly blocked):', err);
                // Still show local results even if API fails
                const filteredPages = GLOBAL_PAGES.filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase())
                ).map(p => ({ ...p, isPage: true }));
                setResults(filteredPages);
            } finally {
                clearTimeout(safetyTimeout);
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 200); // debounce
        return () => clearTimeout(timeoutId);
    }, [query, isOpen]);

    // Keyboard navigation within results
    useEffect(() => {
        const handleNav = (e) => {
            if (!isOpen || results.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(s => (s + 1) % results.length);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(s => (s - 1 + results.length) % results.length);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSelect(results[selectedIndex]);
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, results, selectedIndex]);

    const handleSelect = (item) => {
        setIsOpen(false);
        setQuery('');
        if (item.isPage) {
            navigate(item.path);
        } else {
            navigate(`/colleges/${item.slug}`);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop Blur Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px)' }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                    >
                        {/* Search Header */}
                        <div className="flex items-center px-4 py-4 border-b border-slate-800 bg-slate-900/50">
                            <Search className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search colleges or jump to a page... (Cmd+K)"
                                className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none focus:ring-0 placeholder:text-slate-500 font-medium"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-2 shrink-0">
                                <kbd className="hidden sm:inline-flex px-2 py-1 bg-slate-800 rounded text-[10px] font-bold tracking-widest text-slate-400 border border-slate-700">ESC</kbd>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Results Body */}
                        <div className="max-h-[60vh] overflow-y-auto w-full">
                            {loading && (
                                <div className="p-6 text-center flex flex-col items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin" />
                                    <span className="text-slate-400 text-sm font-medium">Searching our global database...</span>
                                </div>
                            )}

                            {!loading && query.length > 0 && query.length < 2 && (
                                <div className="p-8 text-center text-slate-500 text-sm font-medium">
                                    Keep typing to unleash the search engine...
                                </div>
                            )}

                            {!loading && query.length >= 2 && results.length === 0 && (
                                <div className="p-10 text-center text-slate-400">
                                    <div className="text-lg font-bold text-white mb-2">No results found for "{query}"</div>
                                    <p className="text-sm">Try searching for "IIT", "Delhi", or general pages like "Pricing".</p>
                                </div>
                            )}

                            {!loading && results.length > 0 && (
                                <div className="p-2 space-y-1">
                                    {/* Group results visually if possible, but keep single flat index */}
                                    <div className="px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/50 mb-2">
                                        Top Results
                                    </div>
                                    {results.map((item, index) => (
                                        <button
                                            key={item.id}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            onClick={() => handleSelect(item)}
                                            className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${index === selectedIndex ? 'bg-red-500/15 border-[1.5px] border-red-500/30 shadow-[0_4px_20px_rgba(220,38,38,0.1)]' : 'hover:bg-slate-800/50 border-[1.5px] border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Left Icon Area */}
                                                <div className={`p-2.5 rounded-lg flex items-center justify-center transition-colors ${index === selectedIndex ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/80 text-slate-400'}`}>
                                                    {item.isPage ? item.icon : <Building2 className="w-5 h-5" />}
                                                </div>

                                                {/* Content */}
                                                <div>
                                                    <h4 className={`font-bold transition-colors text-base ${index === selectedIndex ? 'text-white' : 'text-slate-200'}`}>
                                                        {item.name}
                                                    </h4>
                                                    {!item.isPage ? (
                                                        <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin className="w-3 h-3" /> {item.location_city}, {item.location_state}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                            <span className="flex items-center gap-1.5">
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-indigo-400 uppercase tracking-wide">
                                                            Quick Link
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Action */}
                                            <div className={`flex items-center gap-2 transition-all ${index === selectedIndex ? 'opacity-100 translate-x-0 text-red-400' : 'opacity-0 -translate-x-2 text-slate-600'}`}>
                                                <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">
                                                    {item.isPage ? 'Open Page' : 'View College'}
                                                </span>
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer hints */}
                        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300">↑</kbd> 
                                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300">↓</kbd> 
                                    Navigate
                                </span>
                                <span className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300">↵</kbd> 
                                    Select
                                </span>
                            </div>
                            <span className="font-semibold tracking-wide uppercase text-[10px]">Edumetra Global Search Engine</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
