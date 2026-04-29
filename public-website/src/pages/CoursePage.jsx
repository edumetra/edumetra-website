import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, Briefcase, GraduationCap, Building2, TrendingUp } from 'lucide-react';
import Button from '../shared/ui/Button';
import { analytics } from '../shared/utils/analytics';

const courseData = {
    'mbbs': {
        title: 'MBBS (Bachelor of Medicine and Bachelor of Surgery)',
        duration: '5.5 Years (including 1 year internship)',
        eligibility: '10+2 with PCB, NEET qualification',
        description: 'MBBS is the premier undergraduate medical degree for students aspiring to become licensed doctors. It provides comprehensive theoretical knowledge and practical clinical skills essential for diagnosing and treating various diseases.',
        career: ['General Physician', 'Specialist Doctor', 'Medical Officer', 'Surgeon (after MS)'],
        why: 'Most respected profession, high earning potential, and the opportunity to save lives.'
    },
    'bds': {
        title: 'BDS (Bachelor of Dental Surgery)',
        duration: '5 Years (including 1 year internship)',
        eligibility: '10+2 with PCB, NEET qualification',
        description: 'BDS is the approved professional dental course in India. It prepares students for a career as a dental surgeon, focusing on the prevention, diagnosis, and treatment of conditions relating to the oral cavity.',
        career: ['Dentist', 'Dental Surgeon', 'Endodontist', 'Oral Pathologist'],
        why: 'Growing awareness of oral health, excellent scope for private practice, and lucrative career options.'
    },
    'bams': {
        title: 'BAMS (Bachelor of Ayurvedic Medicine and Surgery)',
        duration: '5.5 Years (including 1 year internship)',
        eligibility: '10+2 with PCB, NEET qualification',
        description: 'BAMS integrates modern medical science with traditional Ayurvedic methods. It trains students in the ancient Indian system of medicine, focusing on holistic healing and natural remedies.',
        career: ['Ayurvedic Doctor', 'Medical Officer', 'Health Consultant', 'Researcher'],
        why: 'Global resurgence of traditional medicine, government support for AYUSH, and focus on wellness rather than just disease treatment.'
    },
    'bhms': {
        title: 'BHMS (Bachelor of Homeopathic Medicine and Surgery)',
        duration: '5.5 Years (including 1 year internship)',
        eligibility: '10+2 with PCB, NEET qualification',
        description: 'BHMS covers the alternative medical system of homeopathy. It teaches students to treat patients using highly diluted substances that trigger the body\'s natural healing system.',
        career: ['Homeopathic Physician', 'Public Health Officer', 'Pharmacist', 'Consultant'],
        why: 'Growing popularity of alternative medicine, lack of side effects in treatments, and independent community practice.'
    },
    'pharma': {
        title: 'B.Pharma (Bachelor of Pharmacy)',
        duration: '4 Years',
        eligibility: '10+2 with PCM/PCB',
        description: 'B.Pharma involves the study of preparing and dispensing drugs and medicines. It is highly career-oriented, preparing students for roles in the pharmaceutical industry, research, and healthcare.',
        career: ['Pharmacist', 'Drug Inspector', 'Quality Control Officer', 'Clinical Researcher'],
        why: 'Booming pharmaceutical industry in India, diverse career options in manufacturing, sales, and healthcare sectors.'
    },
    'nursing': {
        title: 'B.Sc Nursing (Bachelor of Science in Nursing)',
        duration: '4 Years',
        eligibility: '10+2 with PCB (English mandatory)',
        description: 'B.Sc Nursing prepares students for professional nursing practice. It combines theoretical learning with extensive clinical training in hospitals and community health settings.',
        career: ['Staff Nurse', 'Nursing Supervisor', 'Public Health Nurse', 'Military Nurse'],
        why: 'High global demand for trained nurses, excellent job security, and a noble profession focused on patient care.'
    },
    'pharma-diploma': {
        title: 'D.Pharma (Diploma in Pharmacy)',
        duration: '2 Years',
        eligibility: '10+2 with PCM/PCB',
        description: 'A diploma-level course designed to familiarise students with the basic concepts of pharmaceutical science. It is the minimum qualification required to practice or work as a pharmacist in India.',
        career: ['Pharmacist', 'Medical Representative', 'Chemist Shop Owner'],
        why: 'Short duration course, fast entry into the job market, and essential for opening a retail pharmacy.'
    },
    'physio': {
        title: 'BPT (Bachelor of Physiotherapy)',
        duration: '4.5 Years (including 6 months internship)',
        eligibility: '10+2 with PCB',
        description: 'Physiotherapy uses physical agents like exercise, massage, and other modalities for providing treatment. It is a highly specialized health profession aiming to restore movement and function.',
        career: ['Physiotherapist', 'Sports Physio', 'Rehabilitation Specialist'],
        why: 'Increasing lifestyle diseases, sports injuries, and an aging population driving high demand for physiotherapists.'
    },
    'gnm': {
        title: 'GNM (General Nursing and Midwifery)',
        duration: '3.5 Years',
        eligibility: '10+2 in any stream (Science preferred)',
        description: 'GNM deals with the education of nurses in general health care, nursing, and midwifery. It is designed to prepare general nurses who can efficiently function as members of the health team.',
        career: ['Clinical Nurse', 'Community Health Worker', 'Midwife'],
        why: 'Accessible entry criteria, practical skill-focused training, and immediate employment opportunities.'
    },
    'ayurveda': {
        title: 'Ayurveda Courses (BAMS & MD)',
        duration: 'Varies',
        eligibility: '10+2 with PCB / BAMS for PG',
        description: 'Explore various undergraduate and postgraduate courses in Ayurveda. The ancient Indian medical system is gaining massive recognition globally for its holistic approach to health and wellness.',
        career: ['Ayurvedic Practitioner', 'Wellness Coach', 'Product Developer'],
        why: 'Strong government backing through the AYUSH ministry and a growing global wellness market.'
    }
};

const CoursePage = () => {
    const { courseId } = useParams();
    const course = courseData[courseId?.toLowerCase()];

    useEffect(() => {
        if (course) {
            analytics.trackPageView(`/courses/${courseId}`, course.title);
        }
    }, [course, courseId]);

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 bg-slate-950">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Course Not Found</h1>
                    <p className="text-slate-400 mb-8">The course you are looking for doesn't exist or has been moved.</p>
                    <Link to="/">
                        <Button variant="primary">Return Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{course.title} | Admission Guide - Edumetra</title>
                <meta name="description" content={`Complete details about ${course.title} including eligibility, duration, and career prospects.`} />
            </Helmet>

            <main className="pt-24 pb-20">
                {/* Hero section */}
                <section className="relative overflow-hidden pt-12 pb-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" />
                    <div className="container-custom relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-semibold mb-6"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Course Overview
                        </motion.div>
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {course.title.split('(')[0].trim()} <br />
                            <span className="text-2xl md:text-3xl text-primary-400 font-bold block mt-3">
                                {course.title.includes('(') ? '(' + course.title.split('(')[1] : ''}
                            </span>
                        </motion.h1>
                        <motion.p
                            className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {course.description}
                        </motion.p>
                    </div>
                </section>

                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                        {/* Highlights details */}
                        <motion.div
                            className="lg:col-span-2 space-y-8"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="card p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-primary-400" />
                                    Why Choose {course.title.split(' ')[0]}?
                                </h2>
                                <p className="text-slate-300 leading-relaxed text-lg">
                                    {course.why}
                                </p>
                            </div>

                            <div className="card p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                    Career Opportunities
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {course.career.map((career, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                            <Briefcase className="w-5 h-5 text-slate-400" />
                                            <span className="text-slate-200 font-medium">{career}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Facts Sidebar */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-slate-700">Quick Facts</h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 font-medium mb-1">Duration</p>
                                            <p className="text-slate-200 font-semibold">{course.duration}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <Award className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 font-medium mb-1">Eligibility</p>
                                            <p className="text-slate-200 font-semibold">{course.eligibility}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-primary-900/20 border border-primary-500/30 text-center">
                                <Building2 className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Ready to apply?</h3>
                                <p className="text-slate-300 text-sm mb-6">Find the best colleges offering this course and compare their fees.</p>
                                <Link to="/find-colleges" className="inline-block w-full">
                                    <Button variant="primary" className="w-full">Search Colleges</Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default CoursePage;
