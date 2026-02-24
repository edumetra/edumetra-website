import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import ContactForm from '../shared/ui/ContactForm';
import { analytics } from '../shared/utils/analytics';

const ContactPage = () => {
    useEffect(() => {
        analytics.trackPageView('/contact', 'Contact');
    }, []);

    const contactMethods = [
        {
            icon: Mail,
            title: 'Email Us',
            value: 'support@collegepredictor.com',
            description: 'Send us an email anytime',
            link: 'mailto:support@collegepredictor.com',
        },
        {
            icon: Phone,
            title: 'Call Us',
            value: '+91 123 456 7890',
            description: 'Mon-Fri, 9 AM - 6 PM IST',
            link: 'tel:+911234567890',
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            value: 'Mumbai, Maharashtra',
            description: 'India',
            link: '#',
        },
    ];

    const faqs = [
        {
            question: 'Is the first counseling session really free?',
            answer: 'Yes! We offer a completely free initial consultation where we assess your NEET score, preferences, and provide preliminary college recommendations.',
        },
        {
            question: 'How long does the counseling process take?',
            answer: 'Typically 2-4 weeks from initial consultation to admission confirmation, depending on the counseling rounds and your preferences.',
        },
        {
            question: 'What documents do I need for consultation?',
            answer: 'Just your NEET scorecard and basic details. We\'ll guide you on additional documents needed during the admission process.',
        },
        {
            question: 'Do you help with both government and private colleges?',
            answer: 'Absolutely! We provide counseling for all medical colleges - government, private, deemed universities, and abroad options.',
        },
        {
            question: 'Can parents join the counseling session?',
            answer: 'Yes, we encourage parents to join. Your involvement helps us understand family preferences, budget, and make the best decision together.',
        },
    ];

    return (
        <>
            <SEO page="contact" />

            <main className="pt-20">
                {/* Hero */}
                <section className="section pt-32 bg-slate-50">
                    <div className="container-custom">
                        <motion.div
                            className="text-center max-w-4xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full mb-6">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-semibold text-sm">Book Your Free Counseling Session</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                                Let's Find Your <span className="gradient-text">Dream College</span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl">
                                Get expert guidance from our counselors. We're here to answer all your questions about
                                medical college admissions, NEET counseling, and your future career.
                            </p>
                        </motion.div>

                        {/* Contact Methods */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            {contactMethods.map((method, index) => (
                                <motion.a
                                    key={index}
                                    href={method.link}
                                    className="card text-center group"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <method.icon className="w-8 h-8 text-primary-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {method.title}
                                    </h3>
                                    <p className="text-primary-400 font-medium mb-1">
                                        {method.value}
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        {method.description}
                                    </p>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form */}
                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            {/* Form */}
                            <motion.div
                                className="card"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                                    Send Us a Message
                                </h2>
                                <ContactForm />
                            </motion.div>

                            {/* FAQ & Info */}
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">
                                        Quick Answers
                                    </h3>
                                    <div className="space-y-4">
                                        {faqs.map((faq, index) => (
                                            <div key={index} className="card">
                                                <h4 className="text-lg font-semibold text-white mb-2 flex items-start gap-2">
                                                    <MessageCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                                                    {faq.question}
                                                </h4>
                                                <p className="text-slate-300 ml-7">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="text-xl font-bold mb-4">
                                        Response Time
                                    </h3>
                                    <p className="text-slate-300 mb-4">
                                        We aim to respond to all inquiries within 24 hours during business days.
                                        Premium users get priority support with faster response times.
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                        <strong className="text-white">Business Hours:</strong><br />
                                        Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                                        Saturday: 10:00 AM - 4:00 PM IST<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default ContactPage;
