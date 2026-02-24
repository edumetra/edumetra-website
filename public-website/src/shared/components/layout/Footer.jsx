import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        console.log('Subscribe:', { email, mobile });
        // TODO: Implement newsletter subscription
        setEmail('');
        setMobile('');
    };

    const topCourses = [
        { name: 'MBBS', path: '/courses/mbbs' },
        { name: 'BDS', path: '/courses/bds' },
        { name: 'BAMS', path: '/courses/bams' },
        { name: 'BHMS', path: '/courses/bhms' },
        { name: 'B.Pharma', path: '/courses/pharma' },
        { name: 'Nursing', path: '/courses/nursing' },
        { name: 'Physiotherapy', path: '/courses/physio' },
        { name: 'Ayurveda', path: '/courses/ayurveda' },
    ];

    const topUniversities = [
        { name: 'Medical and Health Sciences', path: '/universities/medical' },
        { name: 'Pharmaceutical Sciences', path: '/universities/pharma' },
        { name: 'Ayurveda and Alternative Medicine', path: '/universities/ayurveda' },
        { name: 'Nursing and Healthcare', path: '/universities/nursing' },
        { name: 'Allied Health Sciences', path: '/universities/allied' },
        { name: 'Dental Sciences', path: '/universities/dental' },
    ];

    const topExams = [
        { name: 'NEET', path: '/exams/neet' },
        { name: 'AIIMS', path: '/exams/aiims' },
        { name: 'JIPMER', path: '/exams/jipmer' },
        { name: 'NEET PG', path: '/exams/neet-pg' },
        { name: 'FMGE', path: '/exams/fmge' },
        { name: 'INI CET', path: '/exams/ini-cet' },
        { name: 'GPAT', path: '/exams/gpat' },
    ];

    const otherLinks = [
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Advertise With Us', path: '/advertise' },
        { name: 'Careers', path: '/careers' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms & Conditions', path: '/terms' },
    ];

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
        { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
        { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
        { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com' },
        { name: 'YouTube', icon: Youtube, url: 'https://youtube.com' },
    ];

    return (
        <footer className="bg-slate-50 text-slate-900 border-t border-slate-200">
            {/* Newsletter Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="container-custom py-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl font-bold mb-2">Subscribe to our Newsletter</h3>
                        <p className="text-slate-600 mb-6">
                            Get the latest insights, news & updates from CollegePredictor
                        </p>
                        <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Enter your mobile number"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                <span className="text-slate-900">College</span>
                                <span className="text-primary-600">Predictor</span>
                            </span>
                        </Link>

                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            An ISO Certified 9001:2015 Company
                        </p>

                        <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                            CollegePredictor helps you find and apply to top medical colleges across India with detailed info on courses, exams & more.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-600">New Delhi, India (110001)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                <a href="tel:+919876543210" className="text-primary-600 hover:text-primary-700">
                                    +91-98765 43210
                                </a>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['#Best_Colleges', '#Best_Universities', '#Best_Courses', '#Best_Exams'].map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded border border-primary-200"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-red-700 font-medium">All Services Normal</span>
                        </div>
                    </div>

                    {/* Top Courses */}
                    <div>
                        <h4 className="text-lg font-bold text-primary-600 mb-4">Top Courses</h4>
                        <ul className="space-y-2">
                            {topCourses.map((course, index) => (
                                <li key={index}>
                                    <Link
                                        to={course.path}
                                        className="text-sm text-slate-700 hover:text-primary-600 transition-colors"
                                    >
                                        {course.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top Universities */}
                    <div>
                        <h4 className="text-lg font-bold text-primary-600 mb-4">Top Universities</h4>
                        <ul className="space-y-2">
                            {topUniversities.map((university, index) => (
                                <li key={index}>
                                    <Link
                                        to={university.path}
                                        className="text-sm text-slate-700 hover:text-primary-600 transition-colors"
                                    >
                                        {university.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top Exams */}
                    <div>
                        <h4 className="text-lg font-bold text-primary-600 mb-4">Top Exams</h4>
                        <ul className="space-y-2">
                            {topExams.map((exam, index) => (
                                <li key={index}>
                                    <Link
                                        to={exam.path}
                                        className="text-sm text-slate-700 hover:text-primary-600 transition-colors"
                                    >
                                        {exam.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Other Links */}
                    <div>
                        <h4 className="text-lg font-bold text-primary-600 mb-4">Other Links</h4>
                        <ul className="space-y-2">
                            {otherLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-slate-700 hover:text-primary-600 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-200 bg-slate-100">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social, index) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded flex items-center justify-center transition-colors"
                                        aria-label={social.name}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>

                        {/* Copyright */}
                        <p className="text-sm text-slate-600 text-center">
                            Copyright © {new Date().getFullYear()} CollegePredictor. All Rights Reserved.
                        </p>

                        {/* Back to Top */}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="w-10 h-10 bg-slate-700 hover:bg-slate-800 text-white rounded flex items-center justify-center transition-colors"
                            aria-label="Back to top"
                        >
                            ↑
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
