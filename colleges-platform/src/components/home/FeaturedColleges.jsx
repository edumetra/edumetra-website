import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin, Trophy, Star, ArrowRight } from 'lucide-react';

export function FeaturedColleges() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                setLoading(true);
                // Fetch top 4 public colleges ordered by rank ascending (lowest rank number = best), falling back to rating
                const { data, error } = await supabase
                    .from('colleges')
                    .select('id, slug, name, location_city, location_state, type, fees, rating, image, rank')
                    .eq('visibility', 'public')
                    .order('rank', { ascending: true, nullsFirst: false })
                    .order('rating', { ascending: false })
                    .limit(4);

                if (!error && data) {
                    setColleges(data);
                }
            } catch (err) {
                console.error("Error fetching featured colleges:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-72 bg-slate-900 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (colleges.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-slate-900/30 border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Trophy className="w-3.5 h-3.5" />
                            Top Ranked Institutions
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white">
                            Featured Colleges
                        </h2>
                    </div>
                    <Link
                        to="/colleges"
                        className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-bold transition-colors group"
                    >
                        View All Rankings
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {colleges.map((c, index) => (
                        <Link
                            to={`/colleges/${c.slug}`}
                            key={c.id}
                            className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:-translate-y-1 block relative"
                        >
                            <div className="absolute top-0 right-0 z-10 p-3">
                                {index === 0 && (
                                    <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-amber-900/50 flex items-center gap-1">
                                        <Trophy className="w-3 h-3" /> #1 Choice
                                    </div>
                                )}
                            </div>

                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={c.image || 'https://via.placeholder.com/800x600?text=Campus+View'}
                                    alt={c.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-3 left-3 flex gap-2">
                                    <span className="px-2 py-1 bg-red-600/90 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold rounded uppercase tracking-wider shadow-lg">
                                        {c.type}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">{c.name}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-4">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                    {c.location_city}, {c.location_state}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Starting Fees</span>
                                        <span className="text-red-400 font-bold text-sm">
                                            {c.fees || 'Check Site'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {c.rating > 0 && (
                                            <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-500/20">
                                                <Star className="w-3.5 h-3.5 fill-current" /> {c.rating}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
