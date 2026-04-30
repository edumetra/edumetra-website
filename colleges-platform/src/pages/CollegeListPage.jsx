import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';
import FilterSidebar from '../components/college-list/FilterSidebar';
import SearchHeader from '../components/college-list/SearchHeader';
import CollegeCard from '../components/college-list/CollegeCard';
import CollegeCardSkeleton from '../components/college-list/CollegeCardSkeleton';
import SEOHead from '../components/SEOHead';
import { useColleges } from '../hooks/useColleges';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, WifiOff, RefreshCw, ShieldCheck } from 'lucide-react';

export default function CollegeListPage() {
    const { user } = useSignup();
    const { colleges, loading, error, hasMore, totalCount, fetchColleges, fetchFilterOptions } = useColleges();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sort, setSort] = useState('rank_asc');
    const [page, setPage] = useState(1);

    const [savedIds, setSavedIds] = useState([]);
    const [filterOptions, setFilterOptions] = useState(null);
    const [filters, setFilters] = useState({
        streams: [],
        naacGrades: [],
        feesMin: 0,
        feesMax: 0,
        locations: [],
        states: [],
        types: [],
        courses: [],
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 1. Debounce Search Query
    useEffect(() => {
        if (searchQuery !== debouncedSearchQuery) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                setDebouncedSearchQuery(searchQuery);
                setIsSearching(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, debouncedSearchQuery]);

    // 2. Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const options = await Promise.race([
                    fetchFilterOptions(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Filter timeout')), 8000))
                ]);
                if (options) setFilterOptions(options);
            } catch (err) {
                console.warn('CollegeList: Initial data fetch slow/blocked', err);
            }
        };
        loadInitialData();
    }, [fetchFilterOptions]);

    // 3. Fetch colleges whenever dependencies change
    useEffect(() => {
        setPage(1); // Reset to page 1 on new search/filter
        fetchColleges({ page: 1, query: debouncedSearchQuery, filters, sort, isLoadMore: false });
    }, [debouncedSearchQuery, filters, sort, fetchColleges]);

    // Fetch saved colleges for user
    useEffect(() => {
        if (user) fetchSavedIds();
    }, [user]);

    const fetchSavedIds = async () => {
        try {
            const { data, error } = await supabase
                .from('saved_colleges')
                .select('college_id')
                .eq('user_id', user.id);
            
            if (error) throw error;
            setSavedIds((data || []).map(r => r.college_id));
        } catch (err) {
            console.error('Error fetching saved IDs:', err);
        }
    };

    const handleSaveToggle = (collegeId, isSaved) => {
        setSavedIds(prev => isSaved ? [...prev, collegeId] : prev.filter(id => id !== collegeId));
    };

    const handleFilterChange = (category, value) => {
        if (category === 'reset') {
            setFilters({ streams: [], naacGrades: [], feesMin: 0, feesMax: 0, locations: [], states: [], types: [], courses: [] });
        } else {
            setFilters(prev => ({ ...prev, [category]: value }));
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchColleges({ page: nextPage, query: debouncedSearchQuery, filters, sort, isLoadMore: true });
    };

    // Removing early return for `loading` as we now handle it inside the main render's layout

    return (
        <div className="min-h-screen bg-black">
            <SEOHead
                title="Find Colleges in India — Search, Filter & Compare"
                description="Explore 10,000+ colleges by stream, NAAC grade, fees, location and more. Compare side-by-side and read verified student reviews."
                url="/colleges"
            />
            <div className="relative pt-28 pb-16 overflow-hidden border-b border-slate-800/60">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-slate-900 to-black z-0" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-600/10 blur-[120px] rounded-full point-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-white tracking-tight"
                    >
                        Top Colleges & Universities
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto md:mx-0"
                    >
                        Discover the best institutions ranked by top agencies. Filter by stream, NAAC grade, fees, and more.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <FilterSidebar filterOptions={filterOptions} filters={filters} onFilterChange={handleFilterChange} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <div className="flex-1">
                        <SearchHeader
                            query={searchQuery}
                            onSearchChange={setSearchQuery}
                            isSearching={isSearching}
                            resultCount={totalCount}
                            onToggleFilters={() => setSidebarOpen(true)}
                            sort={sort}
                            onSortChange={setSort}
                        />



                        <div className="space-y-5">
                            {loading ? (
                                [...Array(4)].map((_, i) => <CollegeCardSkeleton key={i} />)
                            ) : colleges.length > 0 ? (
                                <>
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                                        }}
                                        className="space-y-5"
                                    >
                                        {colleges.map((college, index) => (
                                            <motion.div
                                                key={college.id}
                                                variants={{
                                                    hidden: { opacity: 0, y: 20 },
                                                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                                                }}
                                            >
                                                <CollegeCard
                                                    college={college}
                                                    savedIds={savedIds}
                                                    onSaveToggle={handleSaveToggle}
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {hasMore && (
                                        <div className="pt-8 pb-4 flex justify-center">
                                            <button
                                                onClick={handleLoadMore}
                                                disabled={loading}
                                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {loading ? (
                                                    <><div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div> Loading...</>
                                                ) : 'Load More Colleges'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : !loading ? (
                                <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5 text-2xl">
                                        {error ? '📡' : '🔍'}
                                    </div>
                                    <h3 className="text-white font-bold text-xl mb-2">
                                        {error ? 'Connectivity Issue' : 'No colleges found'}
                                    </h3>
                                    <p className="text-slate-400 text-sm max-w-sm mb-6">
                                        {error 
                                            ? 'We are unable to connect to the database. This is usually caused by browser privacy shields (Brave/Ulaa).'
                                            : searchQuery
                                                ? <>No results for <span className="text-white font-semibold">"{searchQuery}"</span>. Try a different name, city, or stream.</>
                                                : 'Your current filters have no matches. Try broadening your search.'}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        {error ? (
                                            <button 
                                                onClick={() => window.location.reload()}
                                                className="px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" /> Try Again
                                            </button>
                                        ) : (
                                            <>
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                                                    >
                                                        Clear Search
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleFilterChange('reset')}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-red-900/30"
                                                >
                                                    Reset All Filters
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Connectivity Monitor - Moved to bottom */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-12"
                                >
                                    <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-amber-900/10">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                                            <WifiOff className="w-7 h-7 text-amber-500" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-lg font-bold text-white mb-1">Database Connectivity Blocked</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                Your browser (Ulaa/Brave) might be blocking the connection to our database to protect your privacy. 
                                                To load the college data, please click the <span className="text-amber-500 font-bold">Shield</span> or <span className="text-amber-500 font-bold">Lock</span> icon in your address bar and select <span className="text-white font-bold">"Allow"</span> for this site.
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
                                        >
                                            <RefreshCw className="w-4 h-4" /> Try Again
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
