import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
        setTimeout(() => inputRef.current?.focus(), 50);

        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('colleges')
                .select('id, name, location_city, location_state, type')
                .ilike('name', `%${query}%`)
                .eq('visibility', 'public')
                .limit(5);

            setResults(data || []);
            setSelectedIndex(0);
            setLoading(false);
        };

        const timeoutId = setTimeout(fetchResults, 300); // debounce
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
                handleSelect(results[selectedIndex].id);
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, results, selectedIndex]);

    const handleSelect = (id) => {
        setIsOpen(false);
        navigate(`/colleges/${id}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop Blur Overlay */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Search Header */}
                <div className="flex items-center px-4 py-3 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-500 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search colleges... (e.g. 'IIT Bombay')"
                        className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none focus:ring-0 placeholder:text-slate-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex px-2 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400">ESC</kbd>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results Body */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-slate-400 text-sm animate-pulse">
                            Searching database...
                        </div>
                    )}

                    {!loading && query.length > 0 && query.length < 2 && (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            Keep typing to search...
                        </div>
                    )}

                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            No colleges found matching "{query}"
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Colleges
                            </div>
                            {results.map((c, index) => (
                                <button
                                    key={c.id}
                                    onClick={() => handleSelect(c.id)}
                                    className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-colors group ${index === selectedIndex ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}
                                >
                                    <div>
                                        <h4 className={`font-bold transition-colors ${index === selectedIndex ? 'text-red-400' : 'text-slate-200 group-hover:text-white'}`}>
                                            {c.name}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {c.location_city}, {c.location_state}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3" /> {c.type}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className={`w-4 h-4 transition-all ${index === selectedIndex ? 'text-red-400 translate-x-1 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">↓</kbd> to navigate</span>
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">↵</kbd> to select</span>
                    </div>
                    <span>Search provided by Supabase</span>
                </div>
            </div>
        </div>
    );
}
