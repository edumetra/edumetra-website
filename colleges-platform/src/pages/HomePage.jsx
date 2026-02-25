import { Link } from 'react-router-dom';
import {
    Search, Star, BookOpen, Shield, TrendingUp, Bell, FileText,
    CheckCircle, Zap, Crown, User, ArrowRight, GraduationCap,
    MapPin, Award, BarChart3, MessageSquare
} from 'lucide-react';
import { useSignup } from '../contexts/SignupContext';

/* ─── Data ─── */
const FEATURES = [
    {
        icon: Search,
        title: 'Smart College Search',
        description: 'Filter colleges by location, fees, courses, rankings, and entrance exams with our powerful search engine.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    {
        icon: BarChart3,
        title: 'Side-by-Side Comparison',
        description: 'Compare multiple colleges on fees, placements, ratings, and available programs at a glance.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
    {
        icon: Star,
        title: 'Verified Reviews',
        description: 'Read authentic student reviews and rating breakdowns for academics, campus life, and placements.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    {
        icon: TrendingUp,
        title: 'Placement Insights',
        description: 'Access detailed placement records — average packages, top recruiters, and year-on-year trends.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
    {
        icon: Bell,
        title: 'Deadline Alerts',
        description: 'Never miss important admission deadlines with personalised notifications for your shortlisted colleges.',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
    },
    {
        icon: BookOpen,
        title: 'Course Explorer',
        description: 'Browse courses offered, exam eligibility, and curriculum details for every college on the platform.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
    },
    {
        icon: MapPin,
        title: 'Campus Life Details',
        description: 'Explore campus galleries, hostel info, facilities, and extra-curricular highlights before you visit.',
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
    },
    {
        icon: Shield,
        title: 'Secure Applications',
        description: 'Submit and track your college applications safely through a verified, end-to-end secure process.',
        color: 'text-lime-400',
        bg: 'bg-lime-500/10',
        border: 'border-lime-500/20',
    },
];

const PLANS = [
    {
        name: 'Free',
        icon: User,
        price: '₹0',
        period: 'Forever',
        description: 'Perfect for getting started with college exploration.',
        color: 'text-slate-300',
        border: 'border-slate-700',
        bg: 'bg-slate-900/50',
        buttonClass: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
        features: [
            'Search all 10,000+ colleges',
            'View basic college profiles',
            'Read up to 5 reviews/month',
            'Access to entrance exam info',
            'Email support',
        ],
        notIncluded: [
            'Placement data & salary stats',
            'Application tracking',
            'Priority deadline alerts',
            'Unlimited shortlisting',
        ],
    },
    {
        name: 'Premium',
        icon: Star,
        price: '₹299',
        period: 'per month',
        description: 'Best for serious applicants comparing multiple colleges.',
        color: 'text-amber-400',
        border: 'border-amber-500/40',
        bg: 'bg-amber-500/5',
        badge: 'Most Popular',
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        buttonClass: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-900/30',
        features: [
            'Everything in Free',
            'Full placement stats & recruiters',
            'Unlimited college shortlisting',
            'Side-by-side comparison (up to 4)',
            'Unlimited reviews access',
            'Priority deadline reminders',
            'Application tracker',
        ],
        notIncluded: [
            'Expert counselling sessions',
            'Personalised college roadmap',
        ],
    },
    {
        name: 'Pro',
        icon: Crown,
        price: '₹799',
        period: 'per month',
        description: 'For students who want expert guidance and full access.',
        color: 'text-purple-400',
        border: 'border-purple-500/40',
        bg: 'bg-purple-500/5',
        buttonClass: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-900/30',
        features: [
            'Everything in Premium',
            '1-on-1 expert counselling (2/month)',
            'Personalised college roadmap',
            'Priority application reviews',
            'Early access to new features',
            'Dedicated account manager',
            'Interview preparation resources',
            'Scholarship discovery engine',
        ],
    },
];

/* ─── Subcomponents ─── */
function FeatureCard({ icon: Icon, title, description, color, bg, border }) {
    return (
        <div className={`p-6 rounded-2xl ${bg} border ${border} group hover:scale-[1.02] transition-transform duration-300`}>
            <div className={`w-11 h-11 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

function PricingCard({ plan, onSignUp }) {
    const Icon = plan.icon;
    return (
        <div className={`relative flex flex-col p-8 rounded-2xl border ${plan.border} ${plan.bg} ${plan.badge ? 'ring-2 ring-amber-500/30' : ''}`}>
            {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold border ${plan.badgeColor}`}>
                    {plan.badge}
                </div>
            )}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${plan.bg} border ${plan.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <div>
                    <div className={`text-lg font-bold ${plan.color}`}>{plan.name}</div>
                    <div className="text-xs text-slate-500">{plan.description}</div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-end gap-1">
                    <span className={`text-4xl font-black ${plan.color}`}>{plan.price}</span>
                    <span className="text-slate-500 text-sm mb-1">/{plan.period}</span>
                </div>
            </div>

            <button
                onClick={onSignUp}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 mb-6 hover:scale-105 ${plan.buttonClass}`}
            >
                Get Started
            </button>

            <div className="space-y-2.5">
                {plan.features?.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-300">{f}</span>
                    </div>
                ))}
                {plan.notIncluded?.map(f => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                        <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                            <span className="text-slate-500 text-xs">✕</span>
                        </div>
                        <span className="text-sm text-slate-500 line-through">{f}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Main Component ─── */
export default function HomePage() {
    const { openSignUp } = useSignup();

    return (
        <div className="min-h-screen bg-[#070c1a]">

            {/* ── Hero ── */}
            <section className="relative overflow-hidden pt-20 pb-32 px-4">
                {/* Glow orbs */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-10 right-1/4 w-56 h-56 bg-rose-500/15 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-8">
                        <GraduationCap className="w-4 h-4" />
                        India's Most Comprehensive College Platform
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                        Find Your{' '}
                        <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-300 bg-clip-text text-transparent">
                            Perfect College
                        </span>
                        , Smarter
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Search 10,000+ colleges. Read verified reviews. Compare placements.
                        Make the most important decision of your life with confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/colleges"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 shadow-xl shadow-red-900/30"
                        >
                            <Search className="w-5 h-5" />
                            Explore Colleges
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={openSignUp}
                            className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 text-white border border-white/12 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
                        >
                            Get Started Free
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-white/6">
                        {[
                            { value: '10,000+', label: 'Colleges Listed' },
                            { value: '50,000+', label: 'Student Reviews' },
                            { value: '500+', label: 'Cities Covered' },
                            { value: '98%', label: 'Success Rate' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-20 px-4 scroll-mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Zap className="w-3.5 h-3.5" />
                            Platform Features
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Everything You Need to Choose Right
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">
                            Powerful tools to research, compare, and apply to colleges — all in one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="py-20 px-4 bg-slate-900/30 border-y border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">How It Works</h2>
                        <p className="text-slate-400">From discovery to decision in 4 simple steps.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '01', icon: Search, title: 'Search', desc: 'Enter your preferred location, course, or exam to find matching colleges instantly.' },
                            { step: '02', icon: BarChart3, title: 'Compare', desc: 'Compare shortlisted colleges on fees, ratings, placements, and facilities.' },
                            { step: '03', icon: MessageSquare, title: 'Review', desc: 'Read genuine student reviews and write your own to help the community.' },
                            { step: '04', icon: Award, title: 'Apply', desc: 'Submit applications and track their progress from one secure dashboard.' },
                        ].map(({ step, icon: Icon, title, desc }) => (
                            <div key={step} className="text-center">
                                <div className="relative inline-flex mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                                        <Icon className="w-7 h-7 text-red-400" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                                        {step}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="py-20 px-4 scroll-mt-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Crown className="w-3.5 h-3.5" />
                            Pricing Plans
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">
                            Start free. Upgrade when you're ready to dive deeper.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {PLANS.map(plan => (
                            <PricingCard key={plan.name} plan={plan} onSignUp={openSignUp} />
                        ))}
                    </div>

                    <p className="text-center text-slate-600 text-sm mt-8">
                        All plans include a 7-day free trial. No credit card required to start.
                    </p>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600/20 to-rose-900/20 border border-red-500/20 p-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent pointer-events-none" />
                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                Ready to Find Your College?
                            </h2>
                            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                                Join thousands of students who used Edumetra to make the right call.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={openSignUp}
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-xl shadow-red-900/30"
                                >
                                    Create Free Account
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <Link
                                    to="/colleges"
                                    className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 text-white border border-white/12 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
                                >
                                    Browse Colleges
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
