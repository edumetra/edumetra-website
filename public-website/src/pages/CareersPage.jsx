import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Users, Zap, Search } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../shared/ui/Button';

const CareersPage = () => {
    const openings = [
        {
            title: 'Senior Education Counselor',
            department: 'Counselling',
            location: 'Newtown, Kolkata',
            type: 'Full-time',
            description: 'We are looking for experienced counselors to guide medical aspirants through NEET UG/PG admissions.'
        },
        {
            title: 'Content Strategist (Medical Education)',
            department: 'Marketing',
            location: 'Remote / Kolkata',
            type: 'Full-time',
            description: 'Help us build the most comprehensive database of medical colleges and admission insights.'
        },
        {
            title: 'Student Success Manager',
            department: 'Customer Success',
            location: 'Newtown, Kolkata',
            type: 'Full-time',
            description: 'Ensure every student on our platform gets the support they need to succeed.'
        }
    ];

    const benefits = [
        { icon: Zap, title: 'Fast Growth', desc: 'Work in a high-growth startup environment.' },
        { icon: Users, title: 'Great Culture', desc: 'Join a team that values innovation and impact.' },
        { icon: Clock, title: 'Flexibility', desc: 'Hybrid work options for eligible roles.' },
        { icon: MapPin, title: 'Prime Location', desc: 'Modern office in the heart of Newtown, Kolkata.' }
    ];

    return (
        <>
            <SEO title="Careers at Edumetra — Join Our Mission" description="Help us revolutionise medical education in India. Explore open positions and join the Edumetra team." />
            
            <main className="pt-20 bg-slate-950 min-h-screen">
                {/* Hero */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent pointer-events-none" />
                    <div className="container-custom relative">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                Join the <span className="gradient-text">Future</span> of Medical Admissions
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl">
                                We're building the tools that will help millions of students find their dream medical college. 
                                Come join our mission to democratize education guidance.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Openings */}
                <section className="py-20 bg-slate-900/30">
                    <div className="container-custom">
                        <div className="max-w-5xl mx-auto">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Briefcase className="text-red-500" />
                                    Open Positions
                                </h2>
                                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                                    <Search className="w-4 h-4 text-slate-500" />
                                    <input type="text" placeholder="Search roles..." className="bg-transparent border-none focus:ring-0 text-sm text-white" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                {openings.map((job, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="card hover:border-red-500/50 transition-colors group"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded border border-red-500/20">
                                                        {job.department}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                                                        <MapPin className="w-3 h-3" /> {job.location}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2">
                                                    {job.title}
                                                </h3>
                                                <p className="text-slate-400 text-sm line-clamp-2">
                                                    {job.description}
                                                </p>
                                            </div>
                                            <Button variant="outline" onClick={() => window.location.href = 'mailto:careers@edumetraglobal.com'}>
                                                Apply Now
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-16 text-center">
                                <p className="text-slate-500 mb-4">Don't see a role that fits?</p>
                                <a href="mailto:careers@edumetraglobal.com" className="text-red-400 font-bold hover:underline">
                                    Send us your resume anyway →
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Join Us */}
                <section className="py-20">
                    <div className="container-custom">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-12 text-center">Why Join Edumetra?</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {benefits.map((item, idx) => (
                                    <div key={idx} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <item.icon className="w-6 h-6 text-red-500" />
                                        </div>
                                        <h4 className="text-white font-bold mb-2">{item.title}</h4>
                                        <p className="text-slate-400 text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default CareersPage;
