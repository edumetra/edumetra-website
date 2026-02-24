import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import FilterSidebar from '../components/college-list/FilterSidebar';
import SearchHeader from '../components/college-list/SearchHeader';
import CollegeCard from '../components/college-list/CollegeCard';

export default function CollegeListPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        locations: [],
        states: [],
        types: [],
        courses: []
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('colleges')
                .select('*')
                .eq('is_published', true)
                .order('rank', { ascending: true });

            if (error) throw error;

            if (data) {
                // Map Supabase data to component format
                const formattedColleges = data.map(college => ({
                    id: college.id,
                    rank: college.rank,
                    name: college.name,
                    location: `${college.location_city}, ${college.location_state}`,
                    state: college.location_state,
                    type: college.type,
                    rating: college.rating || 0,
                    fees: college.fees,
                    avgPackage: college.avg_package,
                    exams: college.exams,
                    courses: college.courses || [],
                    image: college.image || 'https://via.placeholder.com/800x600?text=No+Image'
                }));
                setColleges(formattedColleges);
            }
        } catch (error) {
            console.error('Error fetching colleges:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (category, value) => {
        if (category === 'reset') {
            setFilters({ locations: [], states: [], types: [], courses: [] });
        } else {
            setFilters(prev => ({
                ...prev,
                [category]: value
            }));
        }
    };

    const filteredColleges = useMemo(() => {
        return colleges.filter(college => {
            // Search Logic
            const matchesSearch =
                college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                college.location.toLowerCase().includes(searchQuery.toLowerCase());

            // Filter Logic
            const matchesLocation = filters.locations.length === 0 || filters.locations.includes(college.location.split(',')[0]);
            const matchesState = filters.states.length === 0 || filters.states.includes(college.state);
            const matchesType = filters.types.length === 0 || filters.types.includes(college.type);
            const matchesCourse = filters.courses.length === 0 || college.courses.some(c => filters.courses.includes(c));

            return matchesSearch && matchesLocation && matchesState && matchesType && matchesCourse;
        });
    }, [searchQuery, filters, colleges]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading colleges...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Page Header */}
            <div className="bg-gradient-to-b from-slate-900 to-black pt-24 pb-12 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Top Colleges & Universities
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl">
                        Discover the best institutions ranked by top agencies. Filter by location, fees, and more to find your perfect match.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />

                    {/* Main Content */}
                    <div className="flex-1">
                        <SearchHeader
                            query={searchQuery}
                            onSearchChange={setSearchQuery}
                            resultCount={filteredColleges.length}
                            onToggleFilters={() => setSidebarOpen(true)}
                        />

                        {/* Results List */}
                        <div className="space-y-4">
                            {filteredColleges.length > 0 ? (
                                filteredColleges.map(college => (
                                    <CollegeCard key={college.id} college={college} />
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                                    <p className="text-slate-500 text-lg">No colleges found matching your criteria.</p>
                                    <button
                                        onClick={() => handleFilterChange('reset')}
                                        className="mt-4 text-red-500 hover:text-red-400 font-medium hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
