import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Award, Sparkles } from 'lucide-react';

const SuccessStoriesSection = () => {
    const testimonials = [
        {
            name: 'Priya Sharma',
            role: 'MBBS Student, AIIMS Delhi',
            image: '👩‍⚕️',
            quote: 'CollegePredictor helped me navigate the entire admission process. Their counselors were patient, knowledgeable, and genuinely cared about my success. I got into my dream college!',
            rating: 5,
            year: '2023',
            achievement: 'NEET AIR 145'
        },
        {
            name: 'Rajesh Kumar',
            role: 'Parent',
            image: '👨‍💼',
            quote: 'As a parent, I was overwhelmed by the admission process. The team at CollegePredictor made everything simple and transparent. They kept us informed at every step and delivered exactly what they promised.',
            rating: 5,
            year: '2024',
            achievement: 'Son admitted to JIPMER'
        },
        {
            name: 'Anjali Patel',
            role: 'BDS Student, Manipal',
            image: '👩‍🎓',
            quote: 'I was confused about whether to pursue MBBS or BDS. The counseling sessions helped me make an informed decision based on my interests and career goals. Very happy with my choice!',
            rating: 5,
            year: '2023',
            achievement: 'Secured seat in first round'
        },
        {
            name: 'Dr. Meenakshi (Parent)',
            role: 'Parent & Doctor',
            image: '👩‍⚕️',
            quote: 'Even as a doctor myself, I needed expert guidance for my daughter\'s admission. CollegePredictor\'s data-driven approach and personalized attention made all the difference.',
            rating: 5,
            year: '2024',
            achievement: 'Daughter in GMC Nagpur'
        }
    ];

    const stats = [
        { value: '10,000+', label: 'Success Stories', icon: Sparkles },
        { value: '95%', label: 'Admit Rate', icon: Award },
        { value: '4.9/5', label: 'Average Rating', icon: Star },
    ];

    return (
        <section className="section-padding bg-slate-50">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full mb-6"
                    >
                        <Star className="w-5 h-5 fill-red-500" />
                        <span className="font-semibold text-sm">Success Stories</span>
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                        Trusted by Students<br className="hidden sm:block" />
                        {' '}<span className="gradient-text">& Parents</span> Nationwide
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                        Real stories from students who achieved their medical education dreams with our guidance
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card text-center p-6"
                            >
                                <Icon className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-600">{stat.label}</div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-8 relative hover:shadow-xl transition-all"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 text-primary-200">
                                <Quote className="w-12 h-12" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-red-400 text-red-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-slate-700 mb-6 text-lg leading-relaxed relative z-10">
                                "{testimonial.quote}"
                            </p>

                            {/* Achievement Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
                                <Award className="w-4 h-4" />
                                {testimonial.achievement}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl">
                                    {testimonial.image}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                                    <div className="text-xs text-slate-500">Class of {testimonial.year}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <p className="text-lg text-slate-600 mb-6">
                        Join thousands of successful students who achieved their dreams with our guidance
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                        >
                            Book Free Counselling
                        </a>
                        <a
                            href="/signup"
                            className="px-8 py-4 bg-white hover:bg-slate-50 text-primary-600 font-bold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-primary-600"
                        >
                            Get Started Free
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SuccessStoriesSection;
