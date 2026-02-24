import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    GraduationCap,
    Briefcase,
    Heart,
    Pill,
    Stethoscope,
    Microscope,
    ChevronRight
} from 'lucide-react';

const StudyPlansSection = () => {
    const categories = [
        {
            name: 'Medicine',
            icon: Stethoscope,
            color: 'from-red-500 to-red-600',
            courses: [
                { name: 'MBBS', path: '/courses/mbbs' },
                { name: 'BDS', path: '/courses/bds' },
            ],
        },
        {
            name: 'Ayurveda',
            icon: Heart,
            color: 'from-red-700 to-red-800',
            courses: [
                { name: 'BAMS', path: '/courses/bams' },
                { name: 'BHMS', path: '/courses/bhms' },
            ],
        },
        {
            name: 'Pharmacy',
            icon: Pill,
            color: 'from-gray-800 to-gray-900',
            courses: [
                { name: 'B.Pharma', path: '/courses/pharma' },
                { name: 'D.Pharma', path: '/courses/pharma-diploma' },
            ],
        },
        {
            name: 'Nursing',
            icon: Microscope,
            color: 'from-gray-600 to-gray-700',
            courses: [
                { name: 'B.Sc Nursing', path: '/courses/nursing' },
                { name: 'GNM', path: '/courses/gnm' },
            ],
        },
    ];

    return (
        <section className="section bg-slate-900/30">
            <div className="container-custom">
                {/* Section Header */}
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Browse Top <span className="gradient-text">Study Plans</span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Explore medical education programs across different specializations
                    </p>
                </motion.div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            className="group"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Main Category Card */}
                            <div className="card overflow-hidden h-full">
                                {/* Icon Header */}
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <category.icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Category Name */}
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {category.name}
                                </h3>

                                {/* Course Links */}
                                <div className="space-y-2">
                                    {category.courses.map((course, courseIndex) => (
                                        <Link
                                            key={courseIndex}
                                            to={course.path}
                                            className="flex items-center justify-between px-4 py-3 rounded-lg bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/20 hover:border-primary-500/40 text-slate-200 hover:text-white transition-all group/link"
                                        >
                                            <span className="font-medium">{course.name}</span>
                                            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All CTA */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                    >
                        View All Courses
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default StudyPlansSection;
