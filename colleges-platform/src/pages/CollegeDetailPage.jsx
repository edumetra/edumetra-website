
/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Users, DollarSign, Calendar, Award,
    BookOpen, CheckCircle, TrendingUp, Building2, GraduationCap,
    Star, ExternalLink, ChevronRight
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { useCollegeDetails } from '../hooks/useCollegeDetails';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { StatCard, PlacementHighlight } from '../components/college-detail/StatsComponents';
import { PlacementChart } from '../components/college-detail/PlacementChart';
import { CampusLife } from '../components/college-detail/CampusLife';
import { ReviewForm, ReviewList } from '../components/ReviewComponents';
import { PhotosGallery } from '../components/college-detail/PhotosGallery';
import { CoursesTable } from '../components/college-detail/CoursesTable';
import { QASection } from '../components/college-detail/QASection';
import { FAQSection } from '../components/college-detail/FAQSection';
import { ReviewInsights } from '../components/college-detail/ReviewInsights';
import { SimilarColleges } from '../components/college-detail/SimilarColleges';
import SEOHead from '../components/SEOHead';

export default function CollegeDetailPage() {
    const { collegeId } = useParams();
    const navigate = useNavigate();

    // Custom Hook
    const { college, loading, error } = useCollegeDetails(collegeId);

    const [activeTab, setActiveTab] = useState('overview');
    const [refreshReviews, setRefreshReviews] = useState(false);

    // Admission Chances State
    const [score, setScore] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [admissionChance, setAdmissionChance] = useState(null);

    // Parallax Scroll Hooks
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-20">
                <LoadingState message="Loading college details..." />
            </div>
        );
    }

    if (error || !college) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-20">
                <ErrorState
                    title="College Not Found"
                    message={error || "The institution you're looking for doesn't exist or has been removed."}
                    onRetry={() => navigate('/colleges', { replace: true })}
                />
            </div>
        );
    }



    const stats = college.placementStats || {};

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: college.name,
        description: college.description || `${college.name} is located in ${college.location}. Type: ${college.type}.`,
        url: `https://colleges.edumetra.in/colleges/${college.id}`,
        image: college.image,
        address: {
            '@type': 'PostalAddress',
            addressLocality: college.city,
            addressRegion: college.state,
            addressCountry: 'IN',
        },
        ...(college.rating ? {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: college.rating,
                bestRating: 5,
                worstRating: 1,
                ratingCount: college.review_count || 1,
            }
        } : {}),
    };

    const handleCalculateChances = () => {
        if (!score.trim()) return;
        setCalculating(true);
        setTimeout(() => {
            const numScore = parseFloat(score);
            let chanceText = 'Low';
            let color = 'text-red-400';

            // basic mock logic depending on score/rank scale
            if (numScore > 90) {
                chanceText = 'Excellent';
                color = 'text-emerald-400';
            } else if (numScore > 75) {
                chanceText = 'Good';
                color = 'text-amber-400';
            } else if (numScore > 60) {
                chanceText = 'Fair';
                color = 'text-yellow-400';
            }

            setAdmissionChance({ chance: chanceText, color });
            setCalculating(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
            <SEOHead
                title={college.name}
                description={`${college.name} in ${college.location} — Fees: ${college.fees || 'N/A'}, Rating: ${college.rating || 'N/A'}/5. Read student reviews and compare with other colleges.`}
                image={college.image}
                url={`/colleges/${college.id}`}
                jsonLd={jsonLd}
            />
            {/* Parallax Hero */}
            <div ref={targetRef} className="relative h-[70vh] min-h-[500px] overflow-hidden">
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0"
                >
                    <img
                        src={college.image}
                        alt={college.name}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/20" />

                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-32">
                    <Link
                        to="/colleges"
                        className="absolute top-8 left-4 sm:left-8 inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-colors text-sm hover:bg-black/40"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                {college.type}
                            </span>
                            {college.rank && (
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-xl text-white border border-white/20 text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                                    <Award className="w-3 h-3" /> Rank #{college.rank}
                                </span>
                            )}
                            {college.rating > 0 && (
                                <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-xl text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                                    <Star className="w-3 h-3 fill-current" /> {college.rating}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
                            {college.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-200 text-sm md:text-base font-medium">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-500/20 rounded-full backdrop-blur-sm">
                                    <MapPin className="w-4 h-4 text-red-400" />
                                </div>
                                {college.location}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-500/20 rounded-full backdrop-blur-sm">
                                    <Building2 className="w-4 h-4 text-red-400" />
                                </div>
                                Est. {college.founded}
                            </div>
                            {college.website_url && (
                                <>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
                                    <a
                                        href={college.website_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Visit Website <ExternalLink className="w-4 h-4" />
                                    </a>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Quick Stats Grid (Floating Overlap) */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <StatCard icon={DollarSign} label="Annual Fees" value={college.tuition} delay={0.1} />
                    <StatCard icon={TrendingUp} label="Avg Package" value={college.avg_package || "N/A"} delay={0.2} />
                    <StatCard icon={Calendar} label="Exams Accepted" value={college.exams || "Merit Based"} delay={0.3} />
                    <StatCard icon={GraduationCap} label="Total Courses" value={`${college.programs.length}+ Courses`} delay={0.4} />
                </div>

                <div className="grid lg:grid-cols-4 gap-8 lg:gap-12 pb-20 relative items-start">
                    {/* Main Left Column */}
                    <div className="lg:col-span-3 space-y-16 lg:space-y-20">
                        {/* Hidden Glassmorphic Tabs (Now handled by sticky sidebar on desktop, but keep minimal visible top-nav on mobile) */}
                        <div className="sticky top-0 z-50 -mx-4 px-4 sm:mx-0 sm:px-0 pt-4 pb-4 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 transition-all lg:hidden">
                            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                                {['Overview', 'Placement', 'Photos', 'Courses', 'Campus', 'Q&A', 'FAQ', 'Reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab.toLowerCase());
                                            document.getElementById(tab.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`pb-2 text-sm font-bold transition-colors whitespace-nowrap relative ${activeTab === tab.toLowerCase() ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        {tab}
                                        {activeTab === tab.toLowerCase() && (
                                            <motion.div layoutId="activeTabMobile" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* About Section */}
                        <section id="overview" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> About {college.name}
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-lg mb-8">
                                {college.description || "Information about this institution is currently being updated. Please check back later for detailed insights on campus life, academic excellence, and student achievements."}
                            </p>
                        </section>

                        {/* Visual Placement Stats */}
                        {(stats || college.placement_stats) && (
                            <section id="placement" className="scroll-mt-32">
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Placements & ROI
                                </h2>
                                <PlacementChart stats={stats} />
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <PlacementHighlight
                                        label="Highest Package"
                                        value={stats.highest_package || "₹45 LPA"}
                                        subtext="Domestic"
                                    />
                                    <PlacementHighlight
                                        label="Average Package"
                                        value={stats.average_package || college.avg_package || "₹8.5 LPA"}
                                        subtext="Across all streams"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Campus Life */}
                        <section id="campus" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Campus Facilities
                            </h2>
                            <CampusLife />
                        </section>

                        {/* Photos Gallery */}
                        <section id="photos" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Campus Gallery
                            </h2>
                            <PhotosGallery photos={college.campus_photos || []} />
                        </section>

                        {/* Courses & Fees */}
                        <section id="courses" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Courses &amp; Fees
                            </h2>
                            <CoursesTable courses={college.courses_fees || []} />
                        </section>

                        {/* Popular Programs */}
                        {college.programs.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-6">Popular Programs</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {college.programs.map((program, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/30 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-red-400 transition-colors">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-slate-200 group-hover:text-white">{program}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Q&A */}
                        <section id="q&a" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Questions & Answers
                            </h2>
                            <QASection collegeId={collegeId} />
                        </section>

                        {/* FAQs */}
                        <section id="faq" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Frequently Asked Questions
                            </h2>
                            <FAQSection collegeName={college.name} />
                        </section>

                        {/* Reviews */}
                        <section id="reviews" className="scroll-mt-32">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Student Reviews
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center text-amber-400">
                                        <Star className="w-5 h-5 fill-current" />
                                        <span className="ml-1 text-xl font-bold text-white">{college.rating}</span>
                                    </div>
                                    <span className="text-slate-400 text-sm">/ 5.0</span>
                                </div>
                            </div>

                            <div className="grid gap-8">
                                <ReviewForm collegeId={collegeId} onReviewSubmitted={() => setRefreshReviews(prev => !prev)} />
                                <ReviewInsights collegeId={collegeId} />
                                <ReviewList collegeId={collegeId} refreshTrigger={refreshReviews} />
                            </div>
                        </section>

                        {/* Similar Colleges */}
                        <SimilarColleges collegeId={college.id} stream={college.stream} state={college.state} />
                    </div>

                    {/* Right Sidebar (Sticky Container) */}
                    <div className="space-y-6 lg:col-span-1 hidden lg:block sticky top-24 self-start">
                        {/* Jump to Sections Navigation */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Jump to Section</h3>
                            <nav className="flex flex-col gap-1">
                                {['Overview', 'Placement', 'Campus', 'Photos', 'Courses', 'Q&A', 'FAQ', 'Reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab.toLowerCase());
                                            document.getElementById(tab.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between group ${activeTab === tab.toLowerCase() ? 'bg-slate-800 text-white border-l-2 border-red-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                                    >
                                        {tab}
                                        <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.toLowerCase() ? 'text-red-500 opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-slate-500'}`} />
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Admission Probability Calculator */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Admission Chances</h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    Enter your expected percentage/score to predict your priority for {college.name}.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Your Score (%)</label>
                                        <input
                                            type="number"
                                            value={score}
                                            onChange={(e) => setScore(e.target.value)}
                                            placeholder="e.g. 85"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCalculateChances}
                                        disabled={calculating || !score.trim()}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {calculating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Calculate Chances'}
                                    </button>
                                </div>

                                {admissionChance && (
                                    <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="text-sm text-slate-400 mb-1">Prediction</div>
                                        <div className={`text-2xl font-bold ${admissionChance.color}`}>
                                            {admissionChance.chance}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Based on historical cutoffs and recent trends. This is an estimate, not a guarantee.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

