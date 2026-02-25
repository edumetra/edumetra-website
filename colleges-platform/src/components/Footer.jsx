import React, { useState } from 'react';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');

    const publicUrl = "http://localhost:5173";

    const handleSubscribe = (e) => {
        e.preventDefault();
        console.log('Subscribe:', { email, mobile });
        // TODO: Implement newsletter subscription
        setEmail('');
        setMobile('');
    };

    const topCourses = [
        { name: 'MBBS', path: `${publicUrl}/courses/mbbs` },
        { name: 'BDS', path: `${publicUrl}/courses/bds` },
        { name: 'BAMS', path: `${publicUrl}/courses/bams` },
        { name: 'BHMS', path: `${publicUrl}/courses/bhms` },
        { name: 'B.Pharma', path: `${publicUrl}/courses/pharma` },
        { name: 'Nursing', path: `${publicUrl}/courses/nursing` },
        { name: 'Physiotherapy', path: `${publicUrl}/courses/physio` },
        { name: 'Ayurveda', path: `${publicUrl}/courses/ayurveda` },
    ];

    const topUniversities = [
        { name: 'Medical and Health Sciences', path: `${publicUrl}/universities/medical` },
        { name: 'Pharmaceutical Sciences', path: `${publicUrl}/universities/pharma` },
        { name: 'Ayurveda and Alternative Medicine', path: `${publicUrl}/universities/ayurveda` },
        { name: 'Nursing and Healthcare', path: `${publicUrl}/universities/nursing` },
        { name: 'Allied Health Sciences', path: `${publicUrl}/universities/allied` },
        { name: 'Dental Sciences', path: `${publicUrl}/universities/dental` },
    ];

    const topExams = [
        { name: 'NEET', path: `${publicUrl}/exams/neet` },
        { name: 'AIIMS', path: `${publicUrl}/exams/aiims` },
        { name: 'JIPMER', path: `${publicUrl}/exams/jipmer` },
        { name: 'NEET PG', path: `${publicUrl}/exams/neet-pg` },
        { name: 'FMGE', path: `${publicUrl}/exams/fmge` },
        { name: 'INI CET', path: `${publicUrl}/exams/ini-cet` },
        { name: 'GPAT', path: `${publicUrl}/exams/gpat` },
    ];

    const otherLinks = [
        { name: 'About Us', path: `${publicUrl}/about` },
        { name: 'Contact Us', path: `${publicUrl}/contact` },
        { name: 'Advertise With Us', path: `${publicUrl}/advertise` },
        { name: 'Careers', path: `${publicUrl}/careers` },
        { name: 'Privacy Policy', path: `${publicUrl}/privacy` },
        { name: 'Terms & Conditions', path: `${publicUrl}/terms` },
    ];

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
        { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
        { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
        { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com' },
        { name: 'YouTube', icon: Youtube, url: 'https://youtube.com' },
    ];

    return (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
            {/* Newsletter Section */}
            <div className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl font-bold mb-2 text-white">Subscribe to our Newsletter</h3>
                        <p className="text-slate-400 mb-6">
                            Get the latest insights, news & updates from Edumetra
                        </p>
                        <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-200"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Enter your mobile number"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-200"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <a href={publicUrl} className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                <span className="text-red-500">Edumetra</span>
                            </span>
                        </a>

                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            An ISO Certified 9001:2015 Company
                        </p>

                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            Edumetra helps you find and apply to top medical colleges across India with detailed info on courses, exams & more.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-400">New Delhi, India (110001)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <a href="tel:+919876543210" className="text-red-400 hover:text-red-300">
                                    +91-98765 43210
                                </a>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['#Best_Colleges', '#Best_Universities', '#Best_Courses', '#Best_Exams'].map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span className="text-emerald-500 font-medium">All Services Normal</span>
                        </div>
                    </div>

                    {/* Top Courses */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">Top Courses</h4>
                        <ul className="space-y-2">
                            {topCourses.map((course, index) => (
                                <li key={index}>
                                    <a
                                        href={course.path}
                                        className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        {course.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top Universities */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">Top Universities</h4>
                        <ul className="space-y-2">
                            {topUniversities.map((university, index) => (
                                <li key={index}>
                                    <a
                                        href={university.path}
                                        className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        {university.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top Exams */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">Top Exams</h4>
                        <ul className="space-y-2">
                            {topExams.map((exam, index) => (
                                <li key={index}>
                                    <a
                                        href={exam.path}
                                        className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        {exam.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Other Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">Other Links</h4>
                        <ul className="space-y-2">
                            {otherLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.path}
                                        className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                                        className="w-10 h-10 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded flex items-center justify-center transition-colors"
                                        aria-label={social.name}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>

                        {/* Copyright */}
                        <p className="text-sm text-slate-500 text-center">
                            Copyright © {new Date().getFullYear()} Edumetra. All Rights Reserved.
                        </p>

                        {/* Back to Top */}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded flex items-center justify-center transition-colors border border-slate-700"
                            aria-label="Back to top"
                        >
                            ↑
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
