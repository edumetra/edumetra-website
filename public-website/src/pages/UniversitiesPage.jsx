import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, GraduationCap, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../shared/ui/Button';
import { analytics } from '../shared/utils/analytics';
import { Link } from 'react-router-dom';

const UniversitiesPage = () => {
    useEffect(() => {
        analytics.trackPageView('/universities', 'Universities');
    }, []);

    const universities = [
        { name: 'Medical and Health Sciences', description: 'Top medical universities across India for MBBS and PG courses.' },
        { name: 'Pharmaceutical Sciences', description: 'Premier institutions for Pharmacy and drug research.' },
        { name: 'Ayurveda and Alternative Medicine', description: 'Leading AYUSH universities specializing in traditional medicine.' },
        { name: 'Nursing and Healthcare', description: 'Top nursing colleges with modern clinical training facilities.' },
        { name: 'Allied Health Sciences', description: 'Institutions for Physiotherapy, Lab Tech, and other health sciences.' },
        { name: 'Dental Sciences', description: 'Best dental universities for BDS and MDS programs.' },
    ];

    return (
        <>
            <SEO page="universities" title="Top Medical Universities in India | Edumetra" />

            <main className="pt-20">
                <section className="section pt-32 bg-slate-50">
                    <div className="container-custom">
                        <motion.div
                            className="text-center max-w-4xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                                Top <span className="gradient-text">Medical Universities</span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl">
                                Explore and compare the best medical universities in India. Find information on rankings, 
                                courses, and admission procedures for your dream career.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            {universities.map((uni, index) => (
                                <motion.div
                                    key={index}
                                    className="card p-8 group hover:scale-105 transition-transform cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                                        <Building2 className="w-7 h-7 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{uni.name}</h3>
                                    <p className="text-slate-500 mb-6">{uni.description}</p>
                                    <Link to="/find-colleges">
                                        <Button variant="outline" className="w-full">Explore Colleges</Button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
                            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                                Use our advanced search tool to filter universities by state, fees, rankings, and more.
                            </p>
                            <Link to="/find-colleges">
                                <Button variant="primary" size="lg">Use Advanced Search</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default UniversitiesPage;
