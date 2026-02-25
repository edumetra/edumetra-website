import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Eye, Heart, TrendingUp, Building, Globe, CheckCircle, GraduationCap, Users } from 'lucide-react';

const AboutUsSection = () => {
    const differentiators = [
        {
            icon: TrendingUp,
            title: "1. Strategic NEET-Based Counseling",
            description: "We conduct detailed analysis of NEET score, category eligibility, state domicile, and budget to create a realistic admission plan.",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: Building,
            title: "2. Indian Medical College Admissions",
            description: "Step-by-step guidance through MCC and state counseling, fee structures, cut-off trends, and seat allotment to maximize opportunities.",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            icon: Globe,
            title: "3. Trusted MBBS Abroad Partnerships",
            description: "Tie-ups with globally recognized, English-medium medical universities offering affordable fees and safe environments.",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            icon: CheckCircle,
            title: "4. Complete End-to-End Support",
            description: "From personalized counseling to document push, loan guidance, visa assistance, and pre-departure briefing.",
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ];

    const values = [
        {
            icon: Shield,
            title: "Integrity",
            description: "Honest advice. If a college is not suitable, we say it clearly."
        },
        {
            icon: Eye,
            title: "Transparency",
            description: "Clear fee structures, clear processes, and no hidden surprises."
        },
        {
            icon: Users,
            title: "Student-Centric",
            description: "Every student's journey is unique. Our guidance reflects that individuality."
        },
        {
            icon: Heart,
            title: "Responsibility",
            description: "We treat parents' emotional and financial investments with serious respect."
        }
    ];

    const trustPoints = [
        "Data-driven NEET analysis",
        "Strategic counseling approach",
        "Trusted Indian and international college network",
        "Transparent admission processes",
        "Professional yet approachable team",
        "Long-term student support"
    ];

    return (
        <section className="py-20 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-primary-50/50 to-transparent rounded-bl-full pointer-events-none -z-10" />
            <div className="absolute top-1/2 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-blue-50/50 to-transparent rounded-tr-full pointer-events-none -z-10" />

            <div className="container-custom">
                {/* Intro Section */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Guiding Future Doctors with <span className="text-primary-600">Integrity & Expertise</span>
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            At Edumetra, we understand that choosing a medical career is not just a decision — it is a lifelong commitment, a dream built over years of hard work, and for parents, a matter of pride, responsibility, and financial planning.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Medical admissions in India have become highly competitive and complex. We step in to provide structured, transparent, and expert guidance to help students secure admission into the most suitable government or private medical colleges in India, as well as carefully selected and trusted medical universities abroad.
                        </p>
                    </motion.div>
                </div>

                {/* Who We Are */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="md:w-1/2"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full mb-6">
                                <GraduationCap className="w-5 h-5" />
                                <span className="font-semibold">Who We Are</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-6">More Than Just Counselors</h3>
                            <p className="text-slate-600 mb-4 text-lg">
                                Edumetra is a specialized medical admission consultancy dedicated exclusively to guiding students toward MBBS and other medical programs. We are career strategists, education advisors, and long-term partners in your journey to becoming a doctor.
                            </p>
                            <p className="text-slate-600 text-lg">
                                We combine data-driven counseling with personalized attention so that every student receives advice that matches their academic profile, career goals, and financial comfort.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="md:w-1/2 bg-slate-50 p-8 rounded-xl border border-slate-100"
                        >
                            <h4 className="font-bold text-slate-900 mb-4 text-lg">Our Expertise Covers:</h4>
                            <ul className="space-y-3">
                                {[
                                    "NEET score analysis and trends",
                                    "All India and State counseling systems",
                                    "Government vs. Private college selection",
                                    "Budget planning for parents",
                                    "International medical admission standards"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>

                {/* What Makes Us Different */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">What Makes Us Different</h3>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            We don't offer generic suggestions. We provide a customized, strategic roadmap for every student.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {differentiators.map((diff, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                            >
                                <div className={`w-14 h-14 ${diff.bg} ${diff.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <diff.icon className="w-7 h-7" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{diff.title}</h4>
                                <p className="text-slate-600">{diff.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mission, Vision, Values */}
                <div className="grid lg:grid-cols-2 gap-12 mb-20 items-stretch">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-8 h-full"
                    >
                        <div className="bg-primary-900 text-white p-10 rounded-2xl shadow-xl flex-1 flex flex-col justify-center">
                            <Target className="w-12 h-12 text-primary-400 mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                            <p className="text-primary-100 text-lg leading-relaxed">
                                To provide ethical, transparent, and strategic medical admission guidance so that students achieve their dreams without confusion, exploitation, or misinformation. We aim to bridge the gap between ambition and opportunity.
                            </p>
                        </div>
                        <div className="bg-white border-2 border-primary-100 p-10 rounded-2xl shadow-md flex-1 flex flex-col justify-center">
                            <Eye className="w-12 h-12 text-primary-600 mb-6" />
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                To become one of India's most trusted and respected medical education consultancies. We envision building a community of successful doctors who began their journey with the right guidance.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                            <Heart className="w-8 h-8 text-red-500" />
                            Our Values
                        </h3>
                        <div className="space-y-8">
                            {values.map((val, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <val.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{val.title}</h4>
                                        <p className="text-slate-600">{val.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Trust & Messages */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-16 overflow-hidden relative">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />

                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-3xl font-bold mb-8">Why Parents & Students Trust Edumetra</h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {trustPoints.map((point, idx) => (
                                    <li key={idx} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                        <Shield className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                        <span className="text-slate-200 text-sm font-medium">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20"
                            >
                                <h4 className="text-xl font-bold text-primary-400 mb-3">A Message to Students</h4>
                                <p className="text-slate-300">
                                    "Your NEET score does not define your future — the right guidance does. With clarity, planning, and the right strategy, your dream of becoming a doctor is achievable."
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20"
                            >
                                <h4 className="text-xl font-bold text-primary-400 mb-3">A Message to Parents</h4>
                                <p className="text-slate-300">
                                    "We understand your concerns. At Edumetra, we treat your child's career as our responsibility and guide you with honesty and accountability."
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-16 max-w-3xl mx-auto"
                >
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Your Dream Medical Career Begins Here</h3>
                    <p className="text-lg text-slate-600 mb-8">
                        We help you take the first confident step toward a respected and successful medical profession. Let us guide you with clarity, expertise, and trust.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutUsSection;
