import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Briefcase, Users, Rocket, Heart, 
    Send, Upload, CheckCircle2, ArrowRight,
    Globe, Shield, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

const CareersPage = () => {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        message: '',
        resume_url: ''
    });

    const positions = [
        { title: 'Academic Counselor', type: 'Full-time', location: 'Remote / Delhi', category: 'Sales' },
        { title: 'Content Writer (Medical)', type: 'Full-time', location: 'Remote', category: 'Content' },
        { title: 'Full Stack Developer', type: 'Full-time', location: 'Remote', category: 'Engineering' },
        { title: 'Digital Marketing Executive', type: 'Full-time', location: 'Delhi', category: 'Marketing' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('career_applications')
                .insert([formData]);

            if (error) throw error;

            setSubmitted(true);
            toast.success('Application submitted successfully!');
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4 flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4">Application Received!</h1>
                    <p className="text-slate-400 mb-8">
                        Thank you for your interest in joining Edumetra. Our HR team will review your application and get back to you soon.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                    >
                        Return to Home <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070c1a] pt-32 pb-20 px-4">
            <SEOHead 
                title="Careers at Edumetra — Join Our Mission"
                description="Join Edumetra and help us revolutionise the way students find and apply to medical colleges in India."
                url="/careers"
            />

            {/* Ambient Background */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none -z-0" />
            <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-0" />

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/15 text-red-400 text-xs font-black uppercase tracking-wider mb-6"
                    >
                        <Rocket className="w-4 h-4" /> We're Hiring
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight"
                    >
                        Build the Future of <br/>
                        <span className="bg-gradient-to-r from-red-500 via-rose-500 to-indigo-500 bg-clip-text text-transparent">
                            Medical Education
                        </span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-xl max-w-2xl mx-auto"
                    >
                        Help us empower millions of students on their journey to becoming doctors. At Edumetra, we value passion, innovation, and impact.
                    </motion.p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {[
                        { icon: Users, title: 'Collaborative Culture', desc: 'Work with the brightest minds in education and technology.' },
                        { icon: Zap, title: 'Rapid Growth', desc: 'Accelerate your career in a fast-paced startup environment.' },
                        { icon: Heart, title: 'Student First', desc: 'Everything we build is designed to make students\' lives easier.' },
                    ].map((v, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <v.icon className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content: Positions & Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    
                    {/* Left: Open Positions */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-8 bg-red-600 rounded-full" />
                            <h2 className="text-3xl font-bold text-white">Current Openings</h2>
                        </div>
                        <div className="space-y-4">
                            {positions.map((p, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/60 hover:bg-slate-800/40 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1.5 block">
                                                {p.category}
                                            </span>
                                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                                                {p.title}
                                            </h4>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5" /> {p.type}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5" /> {p.location}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setFormData({ ...formData, position: p.title });
                                                document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="p-3 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        <div className="mt-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Don't see a role that fits? Edumetra is always looking for exceptional talent. Submit a general application via the form and we'll reach out when a suitable position opens up.
                            </p>
                        </div>
                    </div>

                    {/* Right: Application Form */}
                    <div id="apply-form">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
                            <div className="absolute -top-6 right-8 w-20 h-20 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl shadow-xl flex items-center justify-center transform -rotate-6">
                                <Send className="w-10 h-10 text-white" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Apply Now</h2>
                            <p className="text-slate-400 text-sm mb-8">Start your journey with Edumetra today.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="eg. Rahul Sharma"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                        <input 
                                            required
                                            type="email" 
                                            placeholder="eg. rahul@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            placeholder="eg. +91 9876543210"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Position Interested In</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="eg. Academic Counselor"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Resume Link (Google Drive / Dropbox)</label>
                                    <div className="relative">
                                        <input 
                                            type="url" 
                                            placeholder="Paste your link here"
                                            value={formData.resume_url}
                                            onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                                        />
                                        <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    </div>
                                    <p className="text-[10px] text-slate-600 ml-1 italic">*Please ensure your link is accessible.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message / Cover Letter</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Tell us about yourself and why you'd like to join Edumetra..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button 
                                    disabled={submitting}
                                    type="submit"
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">{submitting ? 'Submitting...' : 'Submit Application'}</span>
                                    {!submitting && <Send className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                </button>
                            </form>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                            <div className="flex items-center gap-2 text-white font-bold text-xs">
                                <Shield className="w-5 h-5 text-emerald-500" /> ISO Certified 9001:2015
                            </div>
                            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
                                #BuildForImpact
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const Info = ({ className, ...props }) => (
    <svg 
        {...props}
        className={className}
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

export default CareersPage;
