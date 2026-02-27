import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';
import FilterSidebar from '../components/college-list/FilterSidebar';
import SearchHeader from '../components/college-list/SearchHeader';
import CollegeCard from '../components/college-list/CollegeCard';
import CollegeCardSkeleton from '../components/college-list/CollegeCardSkeleton';
import SEOHead from '../components/SEOHead';

export default function CollegeListPage() {
    const { user } = useSignup();
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [savedIds, setSavedIds] = useState([]);
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

    useEffect(() => { fetchColleges(); }, []);

    useEffect(() => {
        if (user) fetchSavedIds();
    }, [user]);

    const fetchColleges = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('colleges')
                .select('*')
                .eq('visibility', 'public')
                .order('rank', { ascending: true });
            if (error) throw error;
            if (data) {
                setColleges(data.map(c => ({
                    id: c.id,
                    rank: c.rank,
                    name: c.name,
                    location: `${c.location_city}, ${c.location_state}`,
                    state: c.location_state,
                    type: c.type,
                    stream: c.stream,
                    naac_grade: c.naac_grade,
                    fees_numeric: c.fees_numeric,
                    rating: c.rating || 0,
                    fees: c.fees,
                    avgPackage: c.avg_package,
                    exams: c.exams,
                    courses: c.courses || [],
                    image: c.image || 'https://via.placeholder.com/800x600?text=No+Image'
                })));
            }
        } catch (err) {
            console.error('Error fetching colleges:', err.message);
        } finally {
            setLoading(false);
        }
    };

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

    const filteredColleges = useMemo(() => {
        return colleges.filter(college => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q || college.name.toLowerCase().includes(q) || college.location.toLowerCase().includes(q);
            const matchesStream = filters.streams.length === 0 || filters.streams.includes(college.stream);
            const matchesNaac = filters.naacGrades.length === 0 || filters.naacGrades.includes(college.naac_grade);
            const matchesFees = (!filters.feesMin && !filters.feesMax) ||
                (college.fees_numeric && (!filters.feesMin || college.fees_numeric >= filters.feesMin) && (!filters.feesMax || college.fees_numeric <= filters.feesMax));
            const matchesLocation = filters.locations.length === 0 || filters.locations.includes(college.location.split(',')[0]);
            const matchesState = filters.states.length === 0 || filters.states.includes(college.state);
            const matchesType = filters.types.length === 0 || filters.types.includes(college.type);
            const matchesCourse = filters.courses.length === 0 || college.courses.some(c => filters.courses.includes(c));
            return matchesSearch && matchesStream && matchesNaac && matchesFees && matchesLocation && matchesState && matchesType && matchesCourse;
        });
    }, [searchQuery, filters, colleges]);

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
                    <FilterSidebar filters={filters} onFilterChange={handleFilterChange} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <div className="flex-1">
                        <SearchHeader query={searchQuery} onSearchChange={setSearchQuery} resultCount={filteredColleges.length} onToggleFilters={() => setSidebarOpen(true)} />
                        <div className="space-y-4">
                            {loading ? (
                                [...Array(4)].map((_, i) => <CollegeCardSkeleton key={i} />)
                            ) : filteredColleges.length > 0 ? (
                                filteredColleges.map(college => (
                                    <CollegeCard
                                        key={college.id}
                                        college={college}
                                        savedIds={savedIds}
                                        onSaveToggle={handleSaveToggle}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                                    <p className="text-slate-500 text-lg">No colleges found matching your criteria.</p>
                                    <button onClick={() => handleFilterChange('reset')} className="mt-4 text-red-500 hover:text-red-400 font-medium hover:underline">
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
