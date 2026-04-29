import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    Clock, 
    Users, 
    MapPin, 
    ArrowLeft, 
    CheckCircle2, 
    Video, 
    Share2, 
    Bell,
    Award,
    Download,
    Globe,
    ArrowRight
} from 'lucide-react';
import SEO from '../components/SEO';
import { WEBINAR_EVENTS } from '../shared/constants/events';
import FAQSection from '../shared/ui/FAQSection';
import WebinarCTA from '../components/sections/webinars/WebinarCTA';
import { analytics } from '../shared/utils/analytics';
import { pushLeadToTeleCRM } from '../services/telecrm';

const EventDetailPage = () => {
    const { slug } = useParams();
    const [event, setEvent] = useState(null);
    const [regStatus, setRegStatus] = useState('idle'); // idle, submitting, success
    const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });

    const handleRegFormChange = (e) => {
        setRegForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const foundEvent = WEBINAR_EVENTS.find(e => e.slug === slug);
        setEvent(foundEvent);
        if (foundEvent) {
            analytics.trackPageView(`/webinars-seminars/${slug}`, foundEvent.title);
        }
    }, [slug]);

    const handleRegister = (e) => {
        e.preventDefault();
        setRegStatus('submitting');

        // Push to TeleCRM (fire-and-forget)
        pushLeadToTeleCRM(
            {
                name: regForm.name,
                email: regForm.email,
                phone: regForm.phone,
                status: 'Fresh',
            },
            ['Event Registration', event?.title].filter(Boolean)
        );

        analytics.trackEvent('Webinar', 'Registration', event.title);
        setTimeout(() => {
            setRegStatus('success');
        }, 1000);
    };

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
                    <Link to="/webinars-seminars" className="text-red-500 hover:underline">Back to All Events</Link>
                </div>
            </div>
        );
    }

    const benefits = [
        { icon: Video, title: 'Live Interactive Session', desc: 'Real-time interaction with experts' },
        { icon: Download, title: 'Study Materials', desc: 'Downloadable PDFs and checklists' },
        { icon: Award, title: 'Participation Certificate', desc: 'Get recognized for your attendance' },
        { icon: Globe, title: 'Global Recognition', desc: 'NMC & WHO approved guidance' }
    ];

    const faqs = [
        { question: 'Is this event free to attend?', answer: 'Yes, this event is completely free of cost for medical aspirants and parents.' },
        { question: 'Will I get the recording?', answer: 'Yes, all registered participants will receive the recording within 24 hours of the event.' },
        { question: 'How do I join the event?', answer: `For ${event.type === 'Offline Seminar' ? 'offline seminars' : 'online webinars'}, you will receive specific ${event.type === 'Offline Seminar' ? 'venue details' : 'joining links'} via email 24 hours before the start.` }
    ];

    return (
        <>
            <SEO 
                title={`${event.title} | Edumetra Webinars`}
                description={event.description}
                page="webinars-seminars"
            />

            <main className="pt-20 bg-slate-950 min-h-screen">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-slate-900/50 border-b border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                    <div className="container-custom relative py-12 md:py-20">
                        <Link 
                            to="/webinars-seminars" 
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to All Events
                        </Link>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Upcoming {event.type}
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                    {event.title}
                                </h1>
                                <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
                                    {event.description}
                                </p>

                                <div className="flex flex-wrap gap-6 text-slate-300 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date</div>
                                            <div className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Time</div>
                                            <div className="font-semibold">{event.time}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                            {event.type === 'Offline Seminar' ? <MapPin className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5 text-red-400" />}
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Format</div>
                                            <div className="font-semibold">{event.type}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Registration Form Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative z-10"
                            >
                                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-blue-500/20 blur-3xl opacity-50 pointer-events-none" />
                                <div className="relative z-20 card-premium p-8 rounded-3xl border border-slate-700 bg-slate-900/80 backdrop-blur-xl">
                                    <AnimatePresence mode="wait">
                                        {regStatus === 'success' ? (
                                            <motion.div 
                                                key="success"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-center py-8"
                                            >
                                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-4">You're Registered!</h3>
                                                <p className="text-slate-400 mb-8">
                                                    We've sent a confirmation email with all the details to your inbox.
                                                </p>
                                                <button 
                                                    onClick={() => setRegStatus('idle')}
                                                    className="btn btn-secondary w-full"
                                                >
                                                    Register Someone Else
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="form"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <h3 className="text-2xl font-bold text-white mb-2">Reserve Your Spot</h3>
                                                <p className="text-slate-400 mb-8">Join {event.attendees}+ students already registered for this event.</p>
                                                
                                                <form onSubmit={handleRegister} className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Full Name</label>
                                                        <input 
                                                            required
                                                            name="name"
                                                            type="text" 
                                                            value={regForm.name}
                                                            onChange={handleRegFormChange}
                                                            placeholder="Enter your name" 
                                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Email Address</label>
                                                        <input 
                                                            required
                                                            name="email"
                                                            type="email" 
                                                            value={regForm.email}
                                                            onChange={handleRegFormChange}
                                                            placeholder="you@example.com" 
                                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Phone Number</label>
                                                        <input 
                                                            required
                                                            name="phone"
                                                            type="tel" 
                                                            value={regForm.phone}
                                                            onChange={handleRegFormChange}
                                                            placeholder="+91 00000 00000" 
                                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                                        />
                                                    </div>
                                                    <button 
                                                        disabled={regStatus === 'submitting'}
                                                        className="w-full btn btn-primary py-4 text-lg font-bold group"
                                                    >
                                                        {regStatus === 'submitting' ? 'Processing...' : 'Complete Registration'}
                                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                    <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
                                                        By clicking, you agree to receive event reminders and medical education updates from Edumetra.
                                                    </p>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="section">
                    <div className="container-custom">
                        <div className="grid lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2 space-y-16">
                                {/* Speaker */}
                                <section>
                                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                        <div className="w-2 h-8 bg-red-600 rounded-full" />
                                        About the Speaker
                                    </h2>
                                    <div className="card-premium flex flex-col md:flex-row gap-8 items-center md:items-start p-8">
                                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-5xl text-white font-bold shrink-0 shadow-xl">
                                            {event.speaker.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">{event.speaker}</h3>
                                            <div className="text-red-400 font-semibold mb-4 tracking-wide">{event.speakerTitle}</div>
                                            <p className="text-slate-300 leading-relaxed text-lg">
                                                An expert in medical education and career guidance with over 15 years of experience. Having mentored thousands of students, Dr. Rajesh brings invaluable insights into the NEET ecosystem and institutional excellence.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Agenda */}
                                <section>
                                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                        <div className="w-2 h-8 bg-red-600 rounded-full" />
                                        Event Agenda
                                    </h2>
                                    <div className="space-y-4">
                                        {event.agenda.map((item, idx) => (
                                            <motion.div 
                                                key={idx}
                                                whileHover={{ x: 10 }}
                                                className="card p-6 flex items-center gap-6 border border-slate-800 bg-slate-900/30 group hover:border-red-500/30"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-red-500 shrink-0 group-hover:bg-red-500/10 transition-colors">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-lg font-medium text-slate-200">{item}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                {/* Description */}
                                <section>
                                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                        <div className="w-2 h-8 bg-red-600 rounded-full" />
                                        What to Expect
                                    </h2>
                                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                        {event.longDescription}
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {benefits.map((benefit, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                                                <benefit.icon className="w-6 h-6 text-red-500 shrink-0" />
                                                <div>
                                                    <div className="font-bold text-white text-sm">{benefit.title}</div>
                                                    <div className="text-xs text-slate-500">{benefit.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-8">
                                <div className="card border-slate-800 bg-slate-900/30 p-8 sticky top-28">
                                    <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                                    <div className="space-y-4">
                                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-200 font-semibold group">
                                            <div className="flex items-center gap-3">
                                                <Share2 className="w-5 h-5 text-red-400" />
                                                Share Event
                                            </div>
                                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-200 font-semibold group">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-5 h-5 text-red-400" />
                                                Get Reminders
                                            </div>
                                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                    </div>

                                    <div className="mt-12 p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                                        <h4 className="font-bold text-red-400 mb-2">Need Help?</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            If you're having trouble registering or need more details, contact our support team at hello@edumetraglobal.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <FAQSection faqs={faqs} />
                <WebinarCTA />
            </main>
        </>
    );
};

export default EventDetailPage;
