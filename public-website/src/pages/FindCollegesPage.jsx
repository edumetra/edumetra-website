import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter as FilterIcon, Loader2 } from 'lucide-react';
import CollegeCard from '../features/colleges/components/CollegeCard';
import CollegeFilters from '../features/colleges/components/CollegeFilters';
import ComparisonFloatingBar from '../features/colleges/components/ComparisonFloatingBar';
import ComparisonModal from '../features/colleges/components/ComparisonModal';
import { filters } from '../data/colleges';
import { supabase } from '../services/supabaseClient';

const FindCollegesPage = () => {
    const [initialColleges, setInitialColleges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        countries: [],
        types: [],
        feesRange: [],
        courses: []
    });
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Fetch live colleges from Supabase
    useEffect(() => {
        const fetchColleges = async () => {
            try {
                // Fetch published colleges
                const { data, error } = await supabase
                    .from('colleges')
                    .select('*')
                    .eq('visibility', 'public');

                if (error) throw error;

                // Map Supabase rows to the format CollegeCard expects
                const mappedData = data.map(c => ({
                    id: c.id,
                    slug: c.slug,
                    name: c.name,
                    location: c.city || 'Unknown City',
                    country: c.state || 'India', // Fallback mapping
                    type: c.type || 'Private',
                    rating: 4.5, // Placeholder if no reviews system exists yet
                    reviews: 0,
                    ranking: `#${c.ranking || 'N/A'}`,
                    fees: `₹${(c.fees || 0).toLocaleString()}/yr`,
                    cutoff: `${c.cutoff || 'N/A'}%`,
                    images: c.gallery_images?.length > 0 ? c.gallery_images : ['https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000'],
                    badges: c.type === 'Government' ? ['Govt. Approved', 'Top Ranked'] : ['Top Private', 'UGC Approved'],
                    facilities: ['Hostel', 'Library', 'Hospital', 'Cafeteria', 'Labs'] // Mocks for now, expand DB schema if needed
                }));

                setInitialColleges(mappedData);
            } catch (err) {
                console.error("Error fetching colleges:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchColleges();
    }, []);

    // Filtering Logic
    const filteredColleges = useMemo(() => {
        let filtered = initialColleges;

        // Search
        if (searchQuery) {
            filtered = filtered.filter(college =>
                college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                college.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filters
        if (selectedFilters.countries.length > 0) {
            filtered = filtered.filter(c => selectedFilters.countries.includes(c.country));
        }
        if (selectedFilters.types.length > 0) {
            filtered = filtered.filter(c => selectedFilters.types.includes(c.type));
        }
        // Add logic for fees range if needed (requires parsing strings to numbers)
        // Add logic for fees range if needed (requires parsing strings to numbers)

        return filtered;
    }, [searchQuery, selectedFilters]);

    // Use derived state for colleges instead of manually syncing
    const colleges = filteredColleges;

    const handleFilterChange = (category, value) => {
        setSelectedFilters(prev => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const clearFilters = () => {
        setSelectedFilters({
            countries: [],
            types: [],
            feesRange: [],
            courses: []
        });
        setSearchQuery('');
    };

    const toggleCompare = (college) => {
        setCompareList(prev => {
            const exists = prev.find(c => c.id === college.id);
            if (exists) {
                return prev.filter(c => c.id !== college.id);
            }
            if (prev.length >= 3) {
                alert("You can only compare up to 3 colleges at a time.");
                return prev;
            }
            return [...prev, college];
        });
    };

    const removeFromCompare = (id) => {
        setCompareList(prev => prev.filter(c => c.id !== id));
    };

    return (
        <>
            <Helmet>
                <title>Find Top Medical Colleges | Compare MBBS Colleges - Neocipher</title>
                <meta name="description" content="Search and compare top medical colleges in India and abroad. Filter by fees, ranking, and location to find your perfect MBBS destination." />
            </Helmet>

            <main className="pt-20 min-h-screen bg-slate-900">
                {/* Hero / Search Section */}
                <div className="bg-slate-900 border-b border-slate-800 pt-12 pb-8 sticky top-0 z-30">
                    <div className="container-custom">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Find Your Dream <span className="gradient-text">Medical College</span>
                        </h1>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by college name, city, or country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                                className="lg:hidden px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white flex items-center gap-2"
                            >
                                <FilterIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container-custom py-8">
                    <div className="flex gap-8">
                        {/* Sidebar Filters - Desktop */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <CollegeFilters
                                filters={filters}
                                selectedFilters={selectedFilters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={clearFilters}
                            />
                        </aside>

                        {/* Mobile Filters Drawer */}
                        {isMobileFilterOpen && (
                            <div className="fixed inset-0 z-50 lg:hidden">
                                <div className="absolute inset-0 bg-black/80" onClick={() => setIsMobileFilterOpen(false)} />
                                <div className="absolute inset-y-0 right-0 w-80 bg-slate-900 p-4 shadow-xl overflow-y-auto">
                                    <div className="flex justify-end mb-4">
                                        <button onClick={() => setIsMobileFilterOpen(false)} className="text-white p-2">✕</button>
                                    </div>
                                    <CollegeFilters
                                        filters={filters}
                                        selectedFilters={selectedFilters}
                                        onFilterChange={handleFilterChange}
                                        onClearFilters={clearFilters}
                                    />
                                </div>
                            </div>
                        )}

                        {/* College Grid */}
                        <div className="flex-1">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-2xl border border-slate-700/30">
                                    <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Loading Colleges...</h3>
                                    <p className="text-slate-400">Fetching the latest data for you.</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-20 bg-red-500/10 rounded-2xl border border-red-500/30">
                                    <h3 className="text-2xl font-bold text-red-400 mb-2">Error Loading Data</h3>
                                    <p className="text-slate-300 max-w-xs mx-auto mb-6">{error}</p>
                                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 text-slate-400">
                                        Showing <span className="text-white font-bold">{colleges.length}</span> colleges
                                    </div>

                                    {colleges.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {colleges.map(college => (
                                                <CollegeCard
                                                    key={college.id}
                                                    college={college}
                                                    onCompare={toggleCompare}
                                                    isSelected={compareList.some(c => c.id === college.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                            <div className="text-6xl mb-4">🔍</div>
                                            <h3 className="text-2xl font-bold text-white mb-2">No colleges found</h3>
                                            <p className="text-slate-400 max-w-xs mx-auto mb-6">
                                                Try adjusting your filters or search query to find what you're looking for.
                                            </p>
                                            <button
                                                onClick={clearFilters}
                                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comparison Floating Bar */}
                <ComparisonFloatingBar
                    selectedColleges={compareList}
                    onRemove={removeFromCompare}
                    onCompareNow={() => setIsCompareModalOpen(true)}
                />

                {/* Comparison Modal */}
                <ComparisonModal
                    isOpen={isCompareModalOpen}
                    onClose={() => setIsCompareModalOpen(false)}
                    colleges={compareList}
                    onRemove={removeFromCompare}
                />
            </main >
        </>
    );
};

export default FindCollegesPage;
