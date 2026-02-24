import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter as FilterIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import CollegeCard from '../features/colleges/components/CollegeCard';
import CollegeFilters from '../features/colleges/components/CollegeFilters';
import ComparisonFloatingBar from '../features/colleges/components/ComparisonFloatingBar';
import ComparisonModal from '../features/colleges/components/ComparisonModal';
import { colleges as initialColleges, filters } from '../data/colleges';

const FindCollegesPage = () => {
    const [colleges, setColleges] = useState(initialColleges);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        countries: [],
        types: [],
        feesRange: [],
        courses: []
    });
    const [compareList, setCompareList] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filtering Logic
    useEffect(() => {
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

        setColleges(filtered);
    }, [searchQuery, selectedFilters]);

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
            </main>
        </>
    );
};

export default FindCollegesPage;
