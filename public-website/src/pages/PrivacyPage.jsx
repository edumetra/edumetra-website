import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Mail, Phone, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

const PrivacyPage = () => {
    const sections = [
        {
            id: 'info-collect',
            title: '1. Information We Collect',
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">We collect the following categories of data:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card-premium p-6">
                            <h4 className="text-primary-400 font-bold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> a) Personal Information
                            </h4>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                                <li>Full Name</li>
                                <li>Email Address</li>
                                <li>Phone Number</li>
                                <li>Residential Address</li>
                                <li>Passport Details</li>
                                <li>Academic Records (marksheets, certificates)</li>
                                <li>Parent/Guardian details (if applicable)</li>
                            </ul>
                        </div>
                        <div className="card-premium p-6">
                            <h4 className="text-primary-400 font-bold mb-3 flex items-center gap-2">
                                <Lock className="w-4 h-4" /> b) Sensitive Information
                            </h4>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                                <li>Identification documents</li>
                                <li>Financial details (shared for admission/visa purposes)</li>
                            </ul>
                        </div>
                        <div className="card-premium p-6">
                            <h4 className="text-primary-400 font-bold mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> c) Technical Data
                            </h4>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                                <li>IP address</li>
                                <li>Browser type and version</li>
                                <li>Device type</li>
                                <li>Location data</li>
                            </ul>
                        </div>
                        <div className="card-premium p-6">
                            <h4 className="text-primary-400 font-bold mb-3 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> d) Usage Data
                            </h4>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                                <li>Pages visited</li>
                                <li>Time spent on website</li>
                                <li>Click behavior</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'usage',
            title: '2. How We Use Your Information',
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300">We process your data for the following purposes:</p>
                    <ul className="grid md:grid-cols-2 gap-4">
                        {[
                            'To provide admission counseling services',
                            'To process applications to universities in India and abroad',
                            'To assist in visa documentation and admission procedures',
                            'To communicate updates, offers, and important notifications',
                            'To improve website performance and user experience',
                            'To comply with legal and regulatory obligations'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )
        },
        {
            id: 'legal-basis',
            title: '3. Legal Basis for Processing',
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300">We process your data based on:</p>
                    <ul className="space-y-3">
                        {[
                            'Your consent',
                            'Contractual necessity (service agreement)',
                            'Legal compliance requirements'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-slate-400">
                                <Shield className="w-4 h-4 text-primary-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )
        },
        {
            id: 'sharing',
            title: '4. Data Sharing & Disclosure',
            content: (
                <div className="space-y-4 text-slate-400">
                    <p>We may share your data with:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Universities and educational institutions (India & abroad)</li>
                        <li>Visa processing agencies</li>
                        <li>Government authorities (when required)</li>
                        <li>Third-party service providers (CRM, hosting, communication tools)</li>
                    </ul>
                    <p className="pt-4 border-t border-slate-800">
                        We ensure that such parties maintain confidentiality and data protection standards.
                    </p>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold text-center">
                        We DO NOT sell your personal data.
                    </div>
                </div>
            )
        },
        {
            id: 'international',
            title: '5. International Data Transfers',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    Since we assist with international admissions, your data may be transferred to countries outside India. 
                    We ensure reasonable safeguards are applied to protect your information during these transfers.
                </p>
            )
        },
        {
            id: 'retention',
            title: '6. Data Retention',
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300">We retain your data only as long as necessary:</p>
                    <ul className="list-disc list-inside text-slate-400 space-y-2 ml-4">
                        <li>During the admission process</li>
                        <li>As required by law or regulatory authorities</li>
                        <li>For resolving disputes and enforcing agreements</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'security',
            title: '7. Data Security',
            content: (
                <div className="space-y-4 text-slate-400">
                    <p>We implement industry-standard security measures:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Secure servers</li>
                        <li>Data encryption (where applicable)</li>
                        <li>Restricted access controls</li>
                    </ul>
                    <p className="pt-4 italic text-sm">
                        However, no system is completely secure, and we cannot guarantee absolute security.
                    </p>
                </div>
            )
        },
        {
            id: 'cookies',
            title: '8. Cookies Policy',
            content: (
                <div className="space-y-4 text-slate-400">
                    <p>We use cookies to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Enhance user experience</li>
                        <li>Track website analytics</li>
                        <li>Improve service performance</li>
                    </ul>
                    <p>Users can disable cookies through browser settings.</p>
                </div>
            )
        },
        {
            id: 'rights',
            title: '9. Your Rights',
            content: (
                <div className="space-y-4 text-slate-400">
                    <p>You have the right to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Access your personal data</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion (subject to legal requirements)</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                    <p className="pt-4">
                        To exercise rights, contact us at <a href="mailto:hello@edumetraglobal.com" className="text-primary-400 hover:underline">hello@edumetraglobal.com</a>.
                    </p>
                </div>
            )
        },
        {
            id: 'third-party',
            title: '10. Third-Party Links',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    Our website may contain links to third-party websites. We are not responsible for their privacy practices. 
                    We encourage you to read the privacy policies of any website you visit.
                </p>
            )
        },
        {
            id: 'children',
            title: '11. Children’s Privacy',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    Our services are intended for students above the age of 16. If we collect data of minors, it is with 
                    explicit parental/guardian consent.
                </p>
            )
        },
        {
            id: 'updates',
            title: '12. Policy Updates',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    We may update this Privacy Policy periodically. Changes will be posted on this page with an updated 
                    effective date. We encourage users to check this page regularly.
                </p>
            )
        },
        {
            id: 'contact',
            title: '13. Contact Information',
            content: (
                <div className="card-premium p-8 grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white mb-1">Email Us</div>
                            <a href="mailto:hello@edumetraglobal.com" className="text-slate-400 hover:text-primary-400 text-sm">hello@edumetraglobal.com</a>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white mb-1">Call Us</div>
                            <a href="tel:03345336366" className="text-slate-400 hover:text-primary-400 text-sm">033-45336366</a>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white mb-1">Visit Us</div>
                            <div className="text-slate-400 text-sm">5WS8C, West Tower, Mani CasaDona, AA-2F, Newtown, Kolkata - 700160</div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <>
            <SEO page="privacy" />
            
            <main className="pt-20 bg-slate-950 min-h-screen">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-slate-900/50 border-b border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none" />
                    <div className="container-custom relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                                Privacy <span className="gradient-text">Policy</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                                At Edumetra Global, we value your privacy and are committed to protecting your personal data.
                            </p>
                            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-slate-400 text-sm">
                                <FileText className="w-4 h-4" />
                                Effective Date: April 28, 2026
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20">
                    <div className="container-custom">
                        <div className="max-w-4xl mx-auto space-y-16">
                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 mb-8 text-center">
                                <p className="text-primary-400 font-bold">
                                    Edumetra Global is running under Virtue Edtech Private Limited
                                </p>
                            </div>

                            <p className="text-slate-300 text-lg leading-relaxed">
                                Virtue Edtech Private Limited ("Company", "we", "our", "us") operates the website edumetraglobal.com and provides 
                                education consulting services under the brand name Edumetra Global. This Privacy Policy 
                                explains how we collect, use, disclose, and safeguard your information.
                            </p>

                            <div className="space-y-12">
                                {sections.map((section, idx) => (
                                    <motion.div
                                        key={section.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="scroll-mt-32"
                                        id={section.id}
                                    >
                                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                            <div className="w-1.5 h-8 bg-primary-600 rounded-full" />
                                            {section.title}
                                        </h3>
                                        <div className="pl-4 md:pl-8">
                                            {section.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="pt-12 border-t border-slate-800 text-center text-slate-500 text-sm"
                            >
                                <p>© {new Date().getFullYear()} Virtue Edtech Private Limited. All rights reserved.</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default PrivacyPage;
