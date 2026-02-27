import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Home, Search, Trophy, ArrowRight, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        // Fetch top 4 public colleges by rating as suggestions
        supabase
            .from('colleges')
            .select('id, name, location_city, location_state, rating, type, image')
            .eq('visibility', 'public')
            .order('rating', { ascending: false })
            .limit(4)
            .then(({ data }) => setSuggestions(data || []));
    }, []);

    const quickLinks = [
        { label: 'Find Colleges', to: '/colleges', icon: Search, desc: 'Browse our full college directory' },
        { label: 'Top Rankings', to: '/rankings', icon: Trophy, desc: 'See the highest-rated colleges' },
        { label: 'Go Home', to: '/', icon: Home, desc: 'Back to the Edumetra homepage' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4">
            <SEOHead
                title="Page Not Found — Edumetra Colleges"
                description="The page you're looking for doesn't exist. Browse top colleges or search our directory."
                url="/404"
            />

            <div className="max-w-4xl mx-auto">

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    {/* Big 404 */}
                    <div className="relative inline-block mb-6">
                        <span className="text-[9rem] md:text-[12rem] font-black text-slate-900 leading-none select-none">
                            404
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-red-500/15 border border-red-500/25 rounded-2xl p-4">
                                <GraduationCap className="w-12 h-12 text-red-400" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
                        This page doesn't exist
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto">
                        The college or page you were looking for couldn't be found. It may have been removed or the link might be wrong.
                    </p>
                </motion.div>

                {/* Quick links */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid sm:grid-cols-3 gap-4 mb-14"
                >
                    {quickLinks.map(({ label, to, icon: Icon, desc }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex flex-col items-center gap-3 p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-red-500/40 hover:bg-slate-800/60 transition-all group text-center"
                        >
                            <div className="p-3 bg-slate-800 group-hover:bg-red-500/15 border border-slate-700 group-hover:border-red-500/30 rounded-xl transition-all">
                                <Icon className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">{label}</p>
                                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                            </div>
                        </Link>
                    ))}
                </motion.div>

                {/* Suggested Colleges */}
                {suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-white">Top colleges you might like</h2>
                            <Link to="/colleges" className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-medium">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {suggestions.map((college, i) => (
                                <motion.div
                                    key={college.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                                >
                                    <Link
                                        to={`/colleges/${college.id}`}
                                        className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-red-500/30 hover:bg-slate-800/60 transition-all group"
                                    >
                                        {/* College image / initial */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                                            {college.image
                                                ? <img src={college.image} alt={college.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                                : <div className="w-full h-full flex items-center justify-center text-slate-500 font-black text-xl">{college.name?.[0]}</div>
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors truncate">
                                                {college.name}
                                            </p>
                                            <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{college.location_city}, {college.location_state}</span>
                                            </div>
                                            {college.type && (
                                                <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded font-semibold uppercase tracking-wider">
                                                    {college.type}
                                                </span>
                                            )}
                                        </div>

                                        <div className="shrink-0 flex flex-col items-end gap-2">
                                            {college.rating > 0 && (
                                                <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    {college.rating}
                                                </div>
                                            )}
                                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
