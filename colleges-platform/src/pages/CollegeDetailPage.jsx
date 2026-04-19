
/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Users, IndianRupee, Calendar, Award,
    BookOpen, CheckCircle, Building2, GraduationCap,
    Star, ExternalLink, ChevronRight
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { useCollegeDetails } from '../hooks/useCollegeDetails';
import { ErrorState } from '../components/ui/ErrorState';
import CollegeDetailSkeleton from '../components/college-detail/CollegeDetailSkeleton';
import { StatCard, PlacementHighlight } from '../components/college-detail/StatsComponents';
import { PlacementChart } from '../components/college-detail/PlacementChart';
import { ReviewForm, ReviewList } from '../components/ReviewComponents';
import { CoursesTable } from '../components/college-detail/CoursesTable';
import { QASection } from '../components/college-detail/QASection';
import { FAQSection } from '../components/college-detail/FAQSection';
import { ReviewInsights } from '../components/college-detail/ReviewInsights';
import { SimilarColleges } from '../components/college-detail/SimilarColleges';
import { LockedSection } from '../components/college-detail/LockedSection';
import HeroCarousel from '../components/college-detail/HeroCarousel';
import { usePremium } from '../contexts/PremiumContext';
import { useSignup } from '../contexts/SignupContext';
import { useGuestLimit } from '../hooks/useGuestLimit';
import GuestLimitModal from '../components/ui/GuestLimitModal';
import SEOHead from '../components/SEOHead';
import { categorizePrediction } from '../components/predictor/predictorEngine';
import { useEffect } from 'react';

export default function CollegeDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Custom Hooks
    const { college, loading, error } = useCollegeDetails(slug);
    const { isSectionVisible, visibilityTier } = usePremium();
    const { user } = useSignup();
    const { hasExceededLimit } = useGuestLimit(user, slug);

    const [activeTab, setActiveTab] = useState('overview');
    const [refreshReviews, setRefreshReviews] = useState(false);
    const [myChances, setMyChances] = useState(null);

    useEffect(() => {
        const lastPrediction = sessionStorage.getItem('last_prediction');
        if (lastPrediction && college) {
            try {
                const { examId, score } = JSON.parse(lastPrediction);
                const prediction = categorizePrediction(college, examId, score);
                if (prediction.label !== 'Open') {
                    setMyChances(prediction);
                }
            } catch (e) { console.error(e); }
        }
    }, [college]);

    // Parallax Scroll Hooks
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    if (loading) {
        return <CollegeDetailSkeleton />;
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
    // SEO Construction
    const currentYear = new Date().getFullYear();
    const cityState = [college.city, college.state].filter(Boolean).join(', ');
    const seoTitle = `${college.name}, ${college.city || college.location} - ${currentYear} Admission, Fees, Ranking & Reviews`;
    
    // Description packing: Aim for ~155 chars with high-value data
    const feeInfo = college.fees ? `Fees: ${college.fees}` : (college.tuition ? `Fees: ${college.tuition}` : '');
    const examsInfo = college.exams ? ` | Exams: ${college.exams}` : '';
    const ratingInfo = college.rating ? ` | Rating: ${college.rating}/5` : '';
    const seoDescription = `Explore ${college.name} in ${cityState}. ${feeInfo}${examsInfo}${ratingInfo}. Read student reviews, verify placements stats & compare courses for the ${currentYear} session.`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: college.name,
        alternateName: college.slug.replace(/-/g, ' ').toUpperCase(),
        description: college.description || `Comprehensive details for ${college.name} in ${college.location}. Fees, ranking, courses, and student reviews.`,
        url: `${import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://colleges.edumetraglobal.com'}/colleges/${college.slug}`,
        logo: college.image,
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
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'https://colleges.edumetraglobal.com'}/colleges/${college.slug}`,
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                image={college.image}
                url={`/colleges/${college.slug}`}
                jsonLd={jsonLd}
            />
            {/* ── Hero: Split Layout ────────────────────────────────────────── */}
            <div ref={targetRef} className="relative bg-slate-950 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-0 min-h-[420px] md:min-h-[480px]">

                        {/* ── Left: Info ── */}
                        <div className="flex flex-col justify-center py-20 pr-0 lg:pr-12">
                            {/* Back */}
                            <Link
                                to="/colleges"
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-8 transition-colors group w-fit"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                Back to Colleges
                            </Link>

                            {/* Badges */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-wrap items-center gap-2 mb-5"
                            >
                                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                                    {college.type}
                                </span>
                                {college.rank && (
                                    <span className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                        <Award className="w-3 h-3 text-red-400" /> Rank #{college.rank}
                                    </span>
                                )}
                                {college.rating > 0 && (
                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold rounded-lg flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> {college.rating}
                                    </span>
                                )}
                                {myChances && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`px-3 py-1 border rounded-lg text-xs font-black shadow-lg ${myChances.bg} ${myChances.color} ${myChances.border} flex items-center gap-1.5`}
                                    >
                                        CHANCE: {myChances.label.toUpperCase()} {myChances.emoji}
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Name */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight"
                            >
                                {college.name}
                            </motion.h1>

                            {/* Meta row */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium"
                            >
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-red-400" />
                                    {college.location}
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-red-400" />
                                    Est. {college.founded}
                                </div>
                                {college.website_url && (
                                    <>
                                        <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                                        <a
                                            href={college.website_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Visit Website <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </>
                                )}
                            </motion.div>
                        </div>

                        {/* ── Right: Image Carousel ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="relative hidden lg:flex items-center py-8"
                        >
                            <div className="relative w-full h-[340px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                                <HeroCarousel
                                    images={[
                                        college.image,
                                        ...(Array.isArray(college.gallery_images) ? college.gallery_images : [])
                                    ].filter(Boolean)}
                                    alt={college.name}
                                />
                            </div>
                        </motion.div>

                        {/* Mobile: image below title (hidden on lg) */}
                        <div className="lg:hidden pb-6">
                            <div className="relative w-full h-[220px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/5">
                                <HeroCarousel
                                    images={[
                                        college.image,
                                        ...(Array.isArray(college.gallery_images) ? college.gallery_images : [])
                                    ].filter(Boolean)}
                                    alt={college.name}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <StatCard icon={IndianRupee} label="Annual Fees" value={college.tuition} delay={0.1} />
                    <StatCard icon={Calendar} label="Exams Accepted" value={college.exams || "Merit Based"} delay={0.2} />
                    <StatCard icon={GraduationCap} label="Total Courses" value={`${college.programs.length}+ Courses`} delay={0.3} />
                </div>

                <div className="grid lg:grid-cols-4 gap-8 lg:gap-12 pb-20 relative items-start">
                    {/* Main Left Column */}
                    <div className="lg:col-span-3 space-y-16 lg:space-y-20">
                        {/* Hidden Glassmorphic Tabs */}
                        <div className="sticky top-0 z-50 -mx-4 px-4 sm:mx-0 sm:px-0 pt-4 pb-4 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 transition-all lg:hidden">
                            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                                {['Overview', 'Admissions', 'Courses', 'Q&A', 'FAQ', 'Reviews'].map((tab) => (
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

                        {/* Detail Admissions & Capacity */}
                        {(college.intake_capacity > 0 || college.minority_status || categoryFees || reservationPercentages) && (
                            <section id="admissions" className="scroll-mt-32">
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Admission Details
                                </h2>
                                {!isSectionVisible('admissions', college) ? (
                                    <LockedSection title="Admission Details" requiredTier={visibilityTier === 'free' ? 'signed_up' : 'pro'}>
                                        <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl" />
                                    </LockedSection>
                                ) : (
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {college.intake_capacity > 0 && (
                                                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex items-start gap-4">
                                                    <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Users className="w-5 h-5"/></div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Intake</div>
                                                        <div className="text-xl font-bold text-slate-200">{college.intake_capacity} Seats</div>
                                                    </div>
                                                </div>
                                            )}
                                            {college.minority_status && (
                                                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex items-start gap-4">
                                                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Award className="w-5 h-5"/></div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Minority Status</div>
                                                        <div className="text-xl font-bold text-amber-500">Minority Institution</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {reservationPercentages && Object.keys(reservationPercentages).length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-300 mb-4 border-b border-slate-800 pb-2">Seat Reservations Breakdown</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {Object.entries(reservationPercentages).map(([cat, pct]) => (
                                                        <div key={cat} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                                                            <div className="text-red-400 font-bold mb-1">{cat}</div>
                                                            <div className="text-2xl font-black text-white">{pct}%</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {categoryFees && Object.keys(categoryFees).length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-300 mb-4 border-b border-slate-800 pb-2">Category-wise Fee Structure</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {Object.entries(categoryFees).map(([cat, fee]) => (
                                                        <div key={cat} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-xl">
                                                            <span className="font-semibold text-slate-400">{cat}</span>
                                                            <span className="font-bold text-emerald-400">{fee}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Courses & Fees */}
                        <section id="courses" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Courses &amp; Fees
                            </h2>
                            {!isSectionVisible('courses', college) ? (
                                <LockedSection title="Courses & Fees" requiredTier={visibilityTier === 'free' ? 'signed_up' : 'pro'}>
                                    <CoursesTable courses={(college.courses_fees || []).slice(0, 2)} />
                                </LockedSection>
                            ) : (
                                <CoursesTable courses={college.courses_fees || []} />
                            )}
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
                            {!isSectionVisible('qna', college) ? (
                                <LockedSection title="Questions & Answers" requiredTier={visibilityTier === 'free' ? 'signed_up' : 'pro'}>
                                    <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl" />
                                </LockedSection>
                            ) : (
                                <QASection collegeId={college.id} />
                            )}
                        </section>

                        {/* FAQs */}
                        <section id="faq" className="scroll-mt-32">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-red-600 rounded-full" /> Frequently Asked Questions
                            </h2>
                            {!isSectionVisible('faq', college) ? (
                                <LockedSection title="Frequently Asked Questions" requiredTier={visibilityTier === 'free' ? 'signed_up' : 'pro'}>
                                    <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl" />
                                </LockedSection>
                            ) : (
                                <FAQSection collegeName={college.name} customFaqs={college.faq} />
                            )}
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

                            {!isSectionVisible('reviews', college) ? (
                                <LockedSection title="Student Reviews" requiredTier={visibilityTier === 'free' ? 'signed_up' : 'pro'}>
                                    <div className="grid gap-8">
                                        <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl" />
                                    </div>
                                </LockedSection>
                            ) : (
                                <div className="grid gap-8">
                                    <ReviewForm collegeId={college.id} onReviewSubmitted={() => setRefreshReviews(prev => !prev)} />
                                    <ReviewInsights collegeId={college.id} />
                                    <ReviewList collegeId={college.id} refreshTrigger={refreshReviews} />
                                </div>
                            )}
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
                                {['Overview', 'Admissions', 'Courses', 'Q&A', 'FAQ', 'Reviews'].map((tab) => (
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
                    </div>
                </div>
            </div>
            
            <GuestLimitModal isOpen={hasExceededLimit} />
        </div>
    );
}

