import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';
import FilterSidebar from '../components/college-list/FilterSidebar';
import SearchHeader from '../components/college-list/SearchHeader';
import CollegeCard from '../components/college-list/CollegeCard';
import CollegeCardSkeleton from '../components/college-list/CollegeCardSkeleton';
import SEOHead from '../components/SEOHead';
import { useColleges } from '../hooks/useColleges';

export default function CollegeListPage() {
    const { user } = useSignup();
    const { colleges, loading, error, hasMore, totalCount, fetchColleges, fetchFilterOptions } = useColleges();

    const [searchQuery, setSearchQuery] = useState('');
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

    // Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            const options = await fetchFilterOptions();
            if (options) setFilterOptions(options);
        };
        loadInitialData();
    }, [fetchFilterOptions]);

    // Fetch colleges whenever dependencies change
    useEffect(() => {
        setPage(1); // Reset to page 1 on new search/filter
        fetchColleges({ page: 1, query: searchQuery, filters, sort, isLoadMore: false });
    }, [searchQuery, filters, sort, fetchColleges]);

    // Fetch saved colleges for user
    useEffect(() => {
        if (user) fetchSavedIds();
    }, [user]);

    const fetchSavedIds = async () => {
        const { data } = await supabase
            .from('saved_colleges')
            .select('college_id')
            .eq('user_id', user.id);
        setSavedIds((data || []).map(r => r.college_id));
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
        fetchColleges({ page: nextPage, query: searchQuery, filters, sort, isLoadMore: true });
    };

    // Removing early return for `loading` as we now handle it inside the main render's layout

    return (
        <div className="min-h-screen bg-black">
            <SEOHead
                title="Find Colleges in India — Search, Filter & Compare"
                description="Explore 10,000+ colleges by stream, NAAC grade, fees, location and more. Compare side-by-side and read verified student reviews."
                url="/colleges"
            />
            <div className="bg-gradient-to-b from-slate-900 to-black pt-24 pb-12 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Top Colleges & Universities
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl">
                        Discover the best institutions ranked by top agencies. Filter by stream, NAAC grade, fees, and more.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar filterOptions={filterOptions} filters={filters} onFilterChange={handleFilterChange} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <div className="flex-1">
                        <SearchHeader
                            query={searchQuery}
                            onSearchChange={setSearchQuery}
                            resultCount={totalCount}
                            onToggleFilters={() => setSidebarOpen(true)}
                            sort={sort}
                            onSortChange={setSort}
                        />

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {loading ? (
                                [...Array(4)].map((_, i) => <CollegeCardSkeleton key={i} />)
                            ) : colleges.length > 0 ? (
                                <>
                                    {colleges.map(college => (
                                        <CollegeCard
                                            key={college.id}
                                            college={college}
                                            savedIds={savedIds}
                                            onSaveToggle={handleSaveToggle}
                                        />
                                    ))}

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
                                <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                                    <p className="text-slate-500 text-lg">No colleges found matching your criteria.</p>
                                    <button onClick={() => handleFilterChange('reset')} className="mt-4 text-red-500 hover:text-red-400 font-medium hover:underline">
                                        Clear all filters
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
