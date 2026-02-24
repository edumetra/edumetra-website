import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    Building2,
    CheckCircle2,
    BarChart3,
    Link as LinkIcon,
    Bell,
    Megaphone,
    Layout,
    Target,
    RefreshCw
} from 'lucide-react';

const AdvertisePage = () => {
    const instituteFeatures = [
        {
            icon: Building2,
            title: 'Dedicated Microsite',
            description: 'Creation of a separate microsite for the institute with complete branding'
        },
        {
            icon: Layout,
            title: 'Responsive Presentation',
            description: 'Responsive presentation of images and other creative content'
        },
        {
            icon: BarChart3,
            title: 'Guaranteed Results',
            description: 'Guaranteed rise in user interaction and click through rate'
        },
        {
            icon: LinkIcon,
            title: 'Traffic Migration',
            description: 'Option to migrate traffic through referral link'
        },
        {
            icon: Bell,
            title: 'Instant Notifications',
            description: 'Add your own API to get instant notification of candidates seeking information'
        }
    ];

    const advertiserFeatures = [
        {
            icon: Megaphone,
            title: 'Strategic Placement',
            description: 'Ample space for third party banners with strategic positioning'
        },
        {
            icon: Target,
            title: 'Smart Targeting',
            description: 'Algorithm to adjust the placement of banners only on relevant pages'
        },
        {
            icon: RefreshCw,
            title: 'Ad Rotation Policy',
            description: 'Ensure sustainable advert reach and frequency of visitors seeing the ad'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Advertise With Us - CollegePredictor | Partner With India's Leading Education Portal</title>
                <meta name="description" content="Partner with CollegePredictor - India's most innovative education portal. Reach students, parents, and educators with comprehensive advertising solutions." />
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
                            <Megaphone className="w-5 h-5 text-red-400" />
                            <span className="text-red-300 text-sm font-semibold">Partnership Opportunities</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Advertise <span className="gradient-text">With Us</span>
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
                            We are India's most innovative and interactive education portal with an ergonomically
                            designed interface which ensures maximum conversion. CollegePredictor caters to the needs
                            of students, parents, and educators seeking information on higher education.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="section-padding bg-slate-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            What We Offer
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Comprehensive solutions tailored for educational institutions and advertisers
                        </p>
                    </div>

                    {/* Educational Institutes */}
                    <div className="mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                                        Educational Institutes
                                    </h3>
                                    <p className="text-slate-600">
                                        Comprehensive solutions for educational institutions
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {instituteFeatures.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="card p-6 hover:shadow-xl transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-6 h-6 text-primary-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                                                        {feature.title}
                                                    </h4>
                                                    <p className="text-slate-600">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Advertisers */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                                    <Megaphone className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                                        Advertisers
                                    </h3>
                                    <p className="text-slate-600">
                                        Strategic advertising solutions for maximum impact
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {advertiserFeatures.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="card p-6 hover:shadow-xl transition-all text-center"
                                        >
                                            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <Icon className="w-7 h-7 text-red-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2">
                                                {feature.title}
                                            </h4>
                                            <p className="text-slate-600 text-sm">
                                                {feature.description}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

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
                            Ready to Partner With Us?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join India's leading education portal and reach thousands of students,
                            parents, and educators every day.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="px-8 py-4 bg-white hover:bg-slate-100 text-primary-600 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                Get in Touch
                            </a>
                            <a
                                href="mailto:partnerships@collegepredictor.com"
                                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                Email Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default AdvertisePage;
