import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../services/supabaseClient';
import { Loader2, MapPin, Star, Share2, Award, Heart, CheckCircle, ArrowLeft, ArrowRight, BookOpen, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../features/auth/AuthProvider';
import { useGuestLimit } from '../shared/hooks/useGuestLimit';
import GuestLimitModal from '../shared/ui/GuestLimitModal';

const CollegeDetailPage = () => {
    const { slug } = useParams();
    const [college, setCollege] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { hasExceededLimit } = useGuestLimit(user, slug);

    useEffect(() => {
        const fetchCollegeData = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('colleges')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("College not found");

                setCollege(data);
            } catch (err) {
                console.error("Error fetching college:", err);
                setError(err.message || "An error occurred while fetching college details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchCollegeData();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-slate-900 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-white">Loading College Details...</h2>
            </div>
        );
    }

    if (error || !college) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-slate-900 flex flex-col items-center justify-center">
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-red-500/30 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">College Not Found</h2>
                    <p className="text-slate-300 mb-6">{error || "The college you are looking for does not exist or has been removed."}</p>
                    <Link to="/find-colleges" className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Search
                    </Link>
                </div>
            </div>
        );
    }

    // Default Images Fallback
    const heroImage = college.gallery_images?.[0] || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2000';
    const gallery = college.gallery_images?.length > 1 ? college.gallery_images.slice(1, 4) : [];

    return (
        <>
            <Helmet>
                <title>{`${college.name} - Admission, Fees, Courses | Neocipher`}</title>
                <meta name="description" content={college.description?.substring(0, 160) || `Explore admission details, fee structure, and courses for ${college.name} located in ${college.city}, ${college.state}.`} />
            </Helmet>

            <main className="min-h-screen bg-slate-900 pt-20 pb-20">
                {/* Hero Banner Area */}
                <div className="relative h-[400px] md:h-[500px]">
                    <div className="absolute inset-0">
                        <img
                            src={heroImage}
                            alt={college.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 container-custom pb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl"
                        >
                            <div className="flex flex-wrap gap-2 mb-4">
                                {college.type === 'Government' ? (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium backdrop-blur-sm">Government</span>
                                ) : (
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm font-medium backdrop-blur-sm">Private</span>
                                )}
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium backdrop-blur-sm">Top Ranked #{college.ranking || 'N/A'}</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                {college.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-slate-300">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-500" />
                                    <span className="text-lg">{college.city}, {college.state}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                    <span className="text-lg font-medium text-white">4.5 <span className="text-sm font-normal text-slate-400">(120 Reviews)</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-400" />
                                    <span className="text-lg">Est. {college.established_year || 'N/A'}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Action Floating Buttons */}
                    <div className="absolute top-6 right-6 flex gap-3 container-custom justify-end hidden md:flex">
                        <button className="p-3 bg-slate-900/50 hover:bg-slate-800 backdrop-blur-md border border-slate-700 rounded-full text-white transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-slate-900/50 hover:bg-slate-800 backdrop-blur-md border border-slate-700 rounded-full text-white transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="container-custom mt-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content Column */}
                        <div className="flex-1 space-y-8">

                            {/* Key Stats Strip */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl"
                            >
                                <div>
                                    <div className="text-slate-400 text-sm mb-1">Total Intake</div>
                                    <div className="text-2xl font-bold text-white">{college.total_intake_capacity || 'N/A'} <span className="text-base font-normal text-slate-500">Seats</span></div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm mb-1">Avg Fees</div>
                                    <div className="text-2xl font-bold text-white">₹{(college.fees || 0).toLocaleString()} <span className="text-base font-normal text-slate-500">/yr</span></div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm mb-1">Cutoff Score</div>
                                    <div className="text-2xl font-bold text-white">{college.cutoff || 'N/A'} <span className="text-base font-normal text-slate-500">%</span></div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm mb-1">Minority Status</div>
                                    <div className="text-2xl font-bold justify-center flex text-white">
                                        {college.minority_status === 'Non-Minority' || !college.minority_status ? (
                                            <span className="text-slate-400 text-lg">None</span>
                                        ) : (
                                            <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded text-lg">{college.minority_status}</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* About Section */}
                            <motion.section
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8"
                            >
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-red-500" />
                                    About College
                                </h2>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {college.description || "Detailed description for this college is currently being updated. Please check back later."}
                                </p>
                            </motion.section>

                            {/* Quota / Reservations Section */}
                            {college.seat_reservations && Object.keys(college.seat_reservations).length > 0 && (
                                <motion.section
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8"
                                >
                                    <h2 className="text-2xl font-bold text-white mb-6">Seat Reservations / Quota Breakdown</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {Object.entries(college.seat_reservations).map(([category, percentage]) => (
                                            <div key={category} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-center">
                                                <div className="text-3xl font-bold text-red-500 mb-1">{percentage}%</div>
                                                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">{category}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Mini Image Gallery */}
                            {gallery.length > 0 && (
                                <section>
                                    <div className="flex justify-between items-end mb-4">
                                        <h2 className="text-2xl font-bold text-white">Campus Gallery</h2>
                                        <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center gap-1">
                                            View All <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {gallery.map((imgUrl, idx) => (
                                            <div key={idx} className="h-48 rounded-xl overflow-hidden cursor-pointer group">
                                                <img
                                                    src={imgUrl}
                                                    alt="Campus"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>

                        {/* Sticky Sidebar */}
                        <div className="lg:w-80 flex-shrink-0">
                            <div className="sticky top-28 space-y-6">
                                {/* Action Card */}
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                                    <div className="text-center mb-6">
                                        <div className="text-slate-400 text-sm mb-1">Estimated First Year Fees</div>
                                        <div className="text-4xl font-bold text-white mb-2">₹{(college.fees || 0).toLocaleString()}</div>
                                        <p className="text-xs text-slate-500">*excluding hostel & other miscellaneous charges</p>
                                    </div>

                                    <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-[0.98] mb-4">
                                        Apply Now
                                    </button>
                                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-600 transition-colors">
                                        Download Brochure
                                    </button>
                                </div>

                                {/* Quick Highlights */}
                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-4">Why Choose {college.name}?</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-300">Modern State-of-the-art Infrastructure & Labs</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-300">High Patient Inflow Teaching Hospital</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-300">{college.minority_status && college.minority_status !== 'Non-Minority' ? `Reserved Quota for ${college.minority_status} Students` : 'Merit based transparent admissions'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <GuestLimitModal isOpen={hasExceededLimit} />
        </>
    );
};

export default CollegeDetailPage;
