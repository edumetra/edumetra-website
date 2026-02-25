import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import { Star, Users, Trophy, TrendingUp, BookOpen, MapPin, MessageSquare, Filter } from 'lucide-react';

const TABS = ['By Rating', 'By Reviews', 'By Stream'];
const STREAMS = ['Engineering', 'Medical', 'Arts', 'Commerce', 'Management', 'Law'];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingsPage() {
    const [activeTab, setActiveTab] = useState('By Rating');
    const [streamFilter, setStreamFilter] = useState('All');
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRankings();
    }, [activeTab, streamFilter]);

    const fetchRankings = async () => {
        setLoading(true);
        let query = supabase
            .from('colleges')
            .select('id, name, location_city, location_state, type, stream, naac_grade, rating, review_count, avg_package, image, rank')
            .eq('visibility', 'public')
            .limit(50);

        if (activeTab === 'By Rating') {
            query = query.order('rating', { ascending: false });
        } else if (activeTab === 'By Reviews') {
            query = query.order('review_count', { ascending: false });
        } else {
            if (streamFilter !== 'All') {
                query = query.eq('stream', streamFilter);
            }
            query = query.order('rating', { ascending: false });
        }

        const { data } = await query;
        setColleges(data || []);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="bg-gradient-to-b from-slate-900 to-black pt-24 pb-12 border-b border-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <Trophy className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Leaderboard</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3">College Rankings</h1>
                    <p className="text-slate-400">Top colleges ranked by rating, student reviews, and stream.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Tab Bar */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setStreamFilter('All'); }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Stream Filter (only for By Stream tab) */}
                {activeTab === 'By Stream' && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {['All', ...STREAMS].map(s => (
                            <button
                                key={s}
                                onClick={() => setStreamFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${streamFilter === s ? 'bg-red-600 border-red-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Leaderboard */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-20 bg-slate-900 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : colleges.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No colleges found for this category.</div>
                ) : (
                    <div className="space-y-3">
                        {colleges.map((college, index) => (
                            <button
                                key={college.id}
                                onClick={() => navigate(`/colleges/${college.id}`)}
                                className="w-full flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/40 hover:bg-slate-900/80 transition-all text-left group"
                            >
                                {/* Rank */}
                                <div className="w-10 text-center shrink-0">
                                    {index < 3 ? (
                                        <span className="text-2xl">{MEDALS[index]}</span>
                                    ) : (
                                        <span className="text-slate-500 font-bold text-sm">#{index + 1}</span>
                                    )}
                                </div>

                                {/* Image */}
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                                    {college.image ? (
                                        <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                            {college.name?.[0]}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-white font-bold text-sm group-hover:text-red-400 transition-colors truncate">{college.name}</span>
                                        {college.naac_grade && (
                                            <span className="shrink-0 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                                                NAAC {college.naac_grade}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                                        <MapPin className="w-3 h-3" />
                                        {college.location_city}, {college.location_state}
                                        {college.stream && <span className="ml-2 text-slate-600">· {college.stream}</span>}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="shrink-0 flex items-center gap-4 text-right">
                                    <div>
                                        <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            {college.rating || '—'}
                                        </div>
                                        <div className="text-slate-600 text-xs">{college.review_count || 0} reviews</div>
                                    </div>
                                    {college.avg_package && (
                                        <div className="hidden sm:block">
                                            <div className="text-green-400 font-bold text-sm">{college.avg_package}</div>
                                            <div className="text-slate-600 text-xs">Avg pkg</div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
