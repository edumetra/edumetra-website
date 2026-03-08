import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin, Award, Star } from 'lucide-react';

export function SimilarColleges({ collegeId, stream, state }) {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            if (!stream) return;
            try {
                setLoading(true);
                // Try to find colleges in same stream, prioritizing same state
                let query = supabase
                    .from('colleges')
                    .select('id, slug, name, location_city, location_state, type, fees, rating, image, rank')
                    .eq('visibility', 'public')
                    .eq('stream', stream)
                    .neq('id', collegeId)
                    .order('rank', { ascending: true })
                    .limit(3);

                const { data, error } = await query;
                if (!error && data) {
                    setColleges(data);
                }
            } catch (err) {
                console.error("Error fetching similar colleges:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilar();
    }, [collegeId, stream, state]);

    if (loading) {
        return (
            <div className="grid sm:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-slate-900 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (colleges.length === 0) return null;

    return (
        <section id="similar" className="scroll-mt-32 mt-16 pt-16 border-t border-slate-800">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Similar Colleges
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map(c => (
                    <Link
                        to={`/colleges/${c.slug}`}
                        key={c.id}
                        className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:-translate-y-1 block"
                    >
                        <div className="h-40 overflow-hidden relative">
                            <img
                                src={c.image || 'https://via.placeholder.com/800x600?text=Campus+View'}
                                alt={c.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-lg">
                                    {c.type}
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">{c.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-4">
                                <MapPin className="w-3.5 h-3.5" />
                                {c.location_city}, {c.location_state}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <div className="text-red-400 font-bold text-sm">
                                    {c.fees || 'Check Fees'}
                                </div>
                                <div className="flex gap-2">
                                    {c.rating > 0 && (
                                        <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded text-xs font-bold">
                                            <Star className="w-3 h-3 fill-current" /> {c.rating}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
