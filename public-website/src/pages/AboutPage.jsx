import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    Award,
    Users,
    Target,
    Heart,
    CheckCircle2,
    GraduationCap,
    TrendingUp,
    Shield
} from 'lucide-react';
import FAQSection from '../shared/ui/FAQSection';

const AboutPage = () => {
    const values = [
        {
            icon: Award,
            title: 'Excellence',
            description: 'We strive for excellence in every aspect of our counseling service, ensuring the best outcomes for students.'
        },
        {
            icon: Heart,
            title: 'Empathy',
            description: 'We understand the stress and anxiety that comes with college admissions and provide compassionate support.'
        },
        {
            icon: Shield,
            title: 'Trust',
            description: 'Building lasting relationships based on transparency, integrity, and honest guidance.'
        },
        {
            icon: Target,
            title: 'Results',
            description: 'Our success is measured by student success - 95% of our students secure admissions in their preferred colleges.'
        }
    ];

    const milestones = [
        { year: '2009', title: 'Founded', description: 'Started with a mission to democratize medical education guidance' },
        { year: '201 5', title: '5,000 Students', description: 'Crossed 5,000 successful college placements' },
        { year: '2020', title: 'Digital Transformation', description: 'Launched comprehensive online counseling platform' },
        { year: '2024', title: '10,000+ Students', description: 'Helped over 10,000 students achieve their medical education dreams' },
    ];

    const team = [
        {
            role: 'Expert Counselors',
            count: '50+',
            description: 'Experienced professionals with deep knowledge of medical admissions'
        },
        {
            role: 'Admission Specialists',
            count: '30+',
            description: 'Dedicated team handling applications and documentation'
        },
        {
            role: 'Student Mentors',
            count: '100+',
            description: 'Current medical students and alumni providing peer guidance'
        }
    ];

    return (
        <>
            <Helmet>
                <title>About Us - Edumetra | Your Trusted Medical Admission Partner</title>
                <meta name="description" content="Learn about Edumetra's mission to help students achieve their medical education dreams. 15+ years of experience, 10,000+ students counseled, 95% success rate." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="container-custom relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            About <span className="gradient-text">Edumetra</span>
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Empowering students and parents with expert guidance for over 15 years
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section-padding bg-slate-50">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-6">
                                <GraduationCap className="w-5 h-5" />
                                <span className="font-semibold text-sm">Our Mission</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                                Making Medical Education Accessible to Every Deserving Student
                            </h2>
                            <p className="text-lg text-slate-700 leading-relaxed mb-4">
                                We believe that every student who dreams of becoming a doctor deserves expert guidance
                                to navigate the complex admission process. Our mission is to provide personalized,
                                transparent, and result-oriented counseling that removes barriers and opens doors.
                            </p>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                For parents, we offer peace of mind through transparent communication, regular updates,
                                and a proven track record of success.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 gap-6"
                        >
                            <div className="card text-center p-8">
                                <div className="text-4xl font-bold gradient-text mb-2">15+</div>
                                <div className="text-slate-600">Years Experience</div>
                            </div>
                            <div className="card text-center p-8">
                                <div className="text-4xl font-bold gradient-text mb-2">10,000+</div>
                                <div className="text-slate-600">Students Helped</div>
                            </div>
                            <div className="card text-center p-8">
                                <div className="text-4xl font-bold gradient-text mb-2">500+</div>
                                <div className="text-slate-600">Partner Colleges</div>
                            </div>
                            <div className="card text-center p-8">
                                <div className="text-4xl font-bold gradient-text mb-2">95%</div>
                                <div className="text-slate-600">Success Rate</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Our Values */}
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                The principles that guide every decision we make and every student we serve
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="card text-center p-8 hover:shadow-xl transition-all"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Icon className="w-8 h-8 text-primary-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                                        <p className="text-slate-600">{value.description}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Approach */}
            <section className="section-padding bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            Our Approach
                        </h2>
                        <p className="text-lg text-slate-600">
                            We combine years of expertise with a personalized touch to ensure every student receives
                            the guidance they deserve
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Personalized Attention',
                                description: 'Every student is unique. We create customized college lists based on NEET scores, preferences, budget, and career goals.',
                                icon: Users
                            },
                            {
                                title: 'Data-Driven Insights',
                                description: 'Our predictions are based on years of admission data, trends, and analysis to give you accurate college recommendations.',
                                icon: TrendingUp
                            },
                            {
                                title: 'End-to-End Support',
                                description: 'From choosing colleges to completing documentation and securing admission - we\'re with you every step of the way.',
                                icon: CheckCircle2
                            }
                        ].map((approach, index) => {
                            const Icon = approach.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">{approach.title}</h3>
                                    <p className="text-slate-600">{approach.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Journey/Timeline */}
            <section className="section-padding bg-slate-50">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            Our Journey
                        </h2>
                        <p className="text-lg text-slate-600">
                            15 years of dedication to helping students achieve their medical education dreams
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-8 mb-12 last:mb-0"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {milestone.year}
                                    </div>
                                </div>
                                <div className="flex-grow pt-2">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
                                    <p className="text-lg text-slate-600">{milestone.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="section-padding bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            Our Team
                        </h2>
                        <p className="text-lg text-slate-600">
                            A dedicated team of professionals committed to your success
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card p-8 text-center hover:shadow-xl transition-all"
                            >
                                <div className="text-5xl font-bold gradient-text mb-4">{member.count}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{member.role}</h3>
                                <p className="text-slate-600">{member.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <FAQSection
                faqs={[
                    {
                        question: 'How long have you been providing counseling services?',
                        answer: 'We have been guiding students and parents through the medical admission process for over 15 years. Since 2009, we have helped more than 10,000 students achieve their dream of becoming doctors.'
                    },
                    {
                        question: 'What makes your counseling different from others?',
                        answer: 'Our counseling is personalized, data-driven, and transparent. We use 10+ years of admission data and AI-powered predictions with 95% accuracy. Unlike generic advice, we create customized college lists based on your NEET score, preferences, budget, and career goals. Plus, we provide end-to-end support from college selection to final admission.'
                    },
                    {
                        question: 'Do you provide services across India?',
                        answer: 'Yes! We serve students across India through both online and offline counseling. Our digital platform is accessible nationwide, and we have counseling centers in major cities. We also help with both All India Quota and State Quota admissions for all states.'
                    },
                    {
                        question: 'What is your success rate?',
                        answer: '95% of our students secure admissions in their preferred colleges. This high success rate comes from our accurate predictions, personalized guidance, timely alerts during counseling, and comprehensive documentation support.'
                    },
                    {
                        question: 'How can I book a counseling session?',
                        answer: 'You can book a free counseling session by filling out the form on our Contact page, calling our helpline, or registering through our website. We also offer a 7-day free trial of our Premium plan which includes personalized counseling support.'
                    },
                    {
                        question: 'Do you help with MBBS abroad admissions too?',
                        answer: 'Absolutely! We have dedicated counselors for MBBS abroad admissions. We guide students for 200+ NMC-approved universities across 12+ countries including Russia, China, Philippines, Kazakhstan, and more. Our services include country selection, university admission, visa processing, and travel arrangements.'
                    }
                ]}
                title="Frequently Asked Questions"
                subtitle="Everything you need to know about our counseling services"
            />

            {/* CTA Section */}
            <section className="section-padding bg-gradient-to-br from-primary-600 to-accent-600">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to Start Your Medical Education Journey?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join thousands of successful students who trusted us with their future
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="px-8 py-4 bg-white hover:bg-slate-100 text-primary-600 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                Book Free Counselling
                            </a>
                            <a
                                href="/signup"
                                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                Get Started Free
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default AboutPage;
