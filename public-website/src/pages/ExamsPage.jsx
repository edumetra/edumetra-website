import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, GraduationCap, Award, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../shared/ui/Button';
import { analytics } from '../shared/utils/analytics';
import { Link } from 'react-router-dom';

const ExamsPage = () => {
    useEffect(() => {
        analytics.trackPageView('/exams', 'Exams');
    }, []);

    const exams = [
        { name: 'NEET UG', description: 'National Eligibility cum Entrance Test for undergraduate medical courses.' },
        { name: 'AIIMS', description: 'Entrance examination for All India Institute of Medical Sciences.' },
        { name: 'JIPMER', description: 'Medical entrance exam for Jawaharlal Institute of Postgraduate Medical Education & Research.' },
        { name: 'NEET PG', description: 'Entrance exam for MD/MS and PG Diploma courses across India.' },
        { name: 'FMGE', description: 'Foreign Medical Graduate Examination for students with medical degrees from abroad.' },
        { name: 'INI CET', description: 'Combined entrance test for admission to PG courses at AIIMS, JIPMER, PGIMER, and NIMHANS.' },
        { name: 'GPAT', description: 'Graduate Pharmacy Aptitude Test for admission to M.Pharma programs.' },
    ];

    return (
        <>
            <SEO page="exams" title="Top Medical Entrance Exams in India | Edumetra" />

            <main className="pt-20">
                <section className="section pt-32 bg-slate-50">
                    <div className="container-custom">
                        <motion.div
                            className="text-center max-w-4xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                                Medical <span className="gradient-text">Entrance Exams</span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl">
                                Stay updated with the latest information on medical entrance examinations in India. 
                                Find dates, eligibility, syllabus, and preparation guides.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            {exams.map((exam, index) => (
                                <motion.div
                                    key={index}
                                    className="card p-8 group hover:scale-105 transition-transform cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                                        <Award className="w-7 h-7 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{exam.name}</h3>
                                    <p className="text-slate-500 mb-6">{exam.description}</p>
                                    <div className="flex gap-2">
                                        <Link to="/find-colleges" className="flex-1">
                                            <Button variant="outline" className="w-full">Top Colleges</Button>
                                        </Link>
                                        <Link to="/contact" className="flex-1">
                                            <Button variant="primary" className="w-full">Get Guide</Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                            <h2 className="text-3xl font-bold mb-4">Need help with exam preparation?</h2>
                            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                                Our expert counselors provide personalized guidance for NEET and other medical entrance exams.
                            </p>
                            <Link to="/contact">
                                <Button variant="primary" size="lg">Book Free Consultation</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default ExamsPage;
