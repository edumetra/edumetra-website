import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Star, CheckCircle } from 'lucide-react';

const GuaranteesSection = () => {
    const guarantees = [
        {
            icon: Shield,
            title: '100% Money-Back Guarantee',
            description: 'If you\'re not satisfied with our counseling service within the first consultation, we\'ll refund your full amount.',
            color: 'from-red-500 to-red-600'
        },
        {
            icon: Award,
            title: 'Admission Guarantee',
            description: 'We guarantee college admission or provide free re-counseling for the next academic year.',
            color: 'from-gray-800 to-gray-900'
        },
        {
            icon: CheckCircle,
            title: 'No Hidden Charges',
            description: 'Complete transparency in pricing. What you see is what you pay - no surprise fees.',
            color: 'from-red-700 to-red-800'
        },
        {
            icon: Star,
            title: 'Verified Reviews Only',
            description: 'All our testimonials and reviews are from verified students and parents who used our service.',
            color: 'from-red-400 to-red-500'
        }
    ];

    return (
        <section className="section-padding bg-gradient-to-br from-slate-50 to-primary-50">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full mb-4">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-semibold">Our Guarantees</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Your Success is Our Priority
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        We stand behind our service with strong guarantees and transparent policies
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {guarantees.map((guarantee, index) => {
                        const Icon = guarantee.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-200"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${guarantee.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">
                                    {guarantee.title}
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {guarantee.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Privacy & Security Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 max-w-4xl mx-auto"
                >
                    <div className="bg-white border-2 border-primary-200 rounded-xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Your Data is Safe With Us
                                </h3>
                                <p className="text-slate-600 mb-3">
                                    We use industry-standard 256-bit SSL encryption to protect your personal information.
                                    Your data is never shared with third parties without your explicit consent.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                        SSL Secured
                                    </span>
                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                        GDPR Compliant
                                    </span>
                                    <span className="px-3 py-1 bg-gray-800 text-gray-100 text-xs font-semibold rounded-full">
                                        ISO 27001 Certified
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default GuaranteesSection;
