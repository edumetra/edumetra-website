import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertCircle, Info, Mail, Phone, MapPin, Scale } from 'lucide-react';
import SEO from '../components/SEO';

const TermsPage = () => {
    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    By accessing our website or using our services, you agree to be legally bound by these terms. 
                    If you do not agree to these terms, please do not use our website or services.
                </p>
            )
        },
        {
            id: 'nature',
            title: '2. Nature of Services',
            content: (
                <div className="space-y-4">
                    <p className="text-slate-300">Edumetra Global provides:</p>
                    <ul className="space-y-3">
                        {[
                            'Admission counseling for MBBS and other courses',
                            'Guidance for universities in India and abroad',
                            'Assistance with documentation and application process'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-slate-400">
                                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="pt-4 text-primary-400 font-semibold italic">
                        We act only as a consultant and facilitator.
                    </p>
                </div>
            )
        },
        {
            id: 'no-guarantee',
            title: '3. No Guarantee of Admission or Visa',
            content: (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            'Admission decisions are solely made by universities',
                            'Visa approval is at the discretion of embassies/authorities',
                            'We do not guarantee admission, scholarships, or visa approval'
                        ].map((item, idx) => (
                            <div key={idx} className="card-premium p-4 flex items-start gap-3 border-red-500/20 bg-red-500/5">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <span className="text-slate-300 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'obligations',
            title: '4. User Obligations',
            content: (
                <div className="space-y-4 text-slate-400">
                    <p>You agree to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Provide accurate and truthful information</li>
                        <li>Submit genuine documents</li>
                        <li>Not engage in fraudulent activities</li>
                        <li>Cooperate during admission process</li>
                    </ul>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm italic">
                        Failure to comply may result in termination of services.
                    </div>
                </div>
            )
        },
        {
            id: 'payment',
            title: '5. Fees & Payment Terms',
            content: (
                <div className="space-y-4 text-slate-400">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Service fees must be paid as agreed</li>
                        <li>Fees may include consulting, documentation, and processing charges</li>
                        <li>Payments once made are generally non-refundable unless specified in writing</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'refund',
            title: '6. Refund Policy',
            content: (
                <div className="space-y-4 text-slate-400">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Refunds (if any) will be processed as per written agreement</li>
                        <li>No refund for rejection due to incorrect information provided by the student</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'ip',
            title: '7. Intellectual Property Rights',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    All website content (text, logo, design) is owned by Edumetra Global. 
                    Unauthorized use, reproduction, or distribution is prohibited and may lead to legal action.
                </p>
            )
        },
        {
            id: 'liability',
            title: '8. Limitation of Liability',
            content: (
                <div className="space-y-4 text-slate-400">
                    <p>Edumetra Global shall not be held liable for:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Admission rejection</li>
                        <li>Visa rejection or delay</li>
                        <li>Actions of universities or third parties</li>
                        <li>Financial losses arising from decisions made by the user</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'third-party',
            title: '9. Third-Party Services',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    We may refer or connect you with third-party services. We are not responsible for their actions or outcomes. 
                    Users are advised to perform their own due diligence before engaging with any third party.
                </p>
            )
        },
        {
            id: 'termination',
            title: '10. Termination of Services',
            content: (
                <div className="space-y-4 text-slate-400">
                    <p>We reserve the right to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Suspend or terminate services for violation of terms</li>
                        <li>Refuse service at our discretion</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'indemnification',
            title: '11. Indemnification',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    You agree to indemnify and hold Edumetra Global harmless from any claims, damages, or losses arising 
                    from misuse of services or violation of these terms.
                </p>
            )
        },
        {
            id: 'governing-law',
            title: '12. Governing Law & Jurisdiction',
            content: (
                <div className="space-y-4 text-slate-400">
                    <div className="flex items-center gap-3">
                        <Scale className="w-5 h-5 text-primary-500" />
                        <span>These terms are governed by the laws of India</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary-500" />
                        <span>Jurisdiction shall be Kolkata, West Bengal</span>
                    </div>
                </div>
            )
        },
        {
            id: 'changes',
            title: '13. Changes to Terms',
            content: (
                <p className="text-slate-400 leading-relaxed">
                    We may revise these terms at any time. Continued use of services implies acceptance of updated terms. 
                    We encourage you to review these terms periodically.
                </p>
            )
        },
        {
            id: 'contact',
            title: '14. Contact Information',
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
            <SEO page="terms" />
            
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
                                Terms & <span className="gradient-text">Conditions</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                                Please read these terms and conditions carefully before using our services.
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
                            <p className="text-slate-300 text-lg leading-relaxed text-center">
                                These Terms & Conditions govern your use of edumetraglobal.com and services provided by Edumetra Global.
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
                                <p>© {new Date().getFullYear()} Edumetra Global. All rights reserved.</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default TermsPage;
