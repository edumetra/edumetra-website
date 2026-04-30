import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

import { pushLeadToTeleCRM } from '../services/telecrm';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email.trim() && !mobile.trim()) return;
        
        setSubscribing(true);
        
        // 1. Sync with TeleCRM
        await pushLeadToTeleCRM(
            { 
                email: email.trim(), 
                phone: mobile.trim(),
                status: 'Colleges Portal Newsletter'
            }, 
            ['Newsletter', 'CollegesPortal']
        );

        // 2. Local database backup
        const { error } = await supabase
            .from('newsletter_subscriptions')
            .upsert({ email, phone: mobile }, { onConflict: 'email' });

        if (error) {
            toast.error(error.message || "Failed to subscribe locally. Try again.");
        } else {
            toast.success("Successfully subscribed to Edumetra's newsletter!");
            setEmail('');
            setMobile('');
        }
        setSubscribing(false);
    };

    const topCourses = [
        { name: 'MBBS', path: '/colleges' },
        { name: 'BDS', path: '/colleges' },
        { name: 'BAMS', path: '/colleges' },
        { name: 'BHMS', path: '/colleges' },
        { name: 'B.Pharma', path: '/colleges' },
        { name: 'Nursing', path: '/colleges' },
        { name: 'Physiotherapy', path: '/colleges' },
        { name: 'Ayurveda', path: '/colleges' },
    ];

    const topUniversities = [
        { name: 'Medical and Health Sciences', path: '/find-colleges' },
        { name: 'Pharmaceutical Sciences', path: '/find-colleges' },
        { name: 'Ayurveda and Alternative Medicine', path: '/find-colleges' },
        { name: 'Nursing and Healthcare', path: '/find-colleges' },
        { name: 'Allied Health Sciences', path: '/find-colleges' },
        { name: 'Dental Sciences', path: '/find-colleges' },
    ];

    const topExams = [
        { name: 'NEET', path: '/find-colleges' },
        { name: 'AIIMS', path: '/find-colleges' },
        { name: 'JIPMER', path: '/find-colleges' },
        { name: 'NEET PG', path: '/find-colleges' },
        { name: 'FMGE', path: '/find-colleges' },
        { name: 'INI CET', path: '/find-colleges' },
        { name: 'GPAT', path: '/find-colleges' },
    ];

    const otherLinks = [
        { name: 'About Us', path: 'https://www.edumetraglobal.com/about' },
        { name: 'Contact Us', path: 'https://www.edumetraglobal.com/contact' },
        { name: 'Advertise With Us', path: 'https://www.edumetraglobal.com/advertise' },
        { name: 'Careers', path: 'https://www.edumetraglobal.com/careers' },
        { name: 'Privacy Policy', path: 'https://www.edumetraglobal.com/privacy' },
        { name: 'Terms & Conditions', path: 'https://www.edumetraglobal.com/terms' },
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
                                disabled={subscribing}
                                className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors whitespace-nowrap flex justify-center items-center gap-2"
                            >
                                {subscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
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
                        <Link to="/" className="flex items-center mb-4">
                            <div className="h-12 w-auto px-5 bg-white flex items-center justify-center shadow-lg overflow-hidden rounded-xl">
                                <img src="/logo-final.jpg" alt="Edumetra Logo" className="h-10 w-auto object-contain" />
                            </div>
                        </Link>

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
                                <span className="text-slate-400">5WS8C, West Tower, Mani CasaDona, AA-2F, Newtown, Kolkata - 700160</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <a href="tel:03345336366" className="text-red-400 hover:text-red-300">
                                    033-45336366
                                </a>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                { name: '#Best_Colleges', path: 'https://colleges.edumetraglobal.com/colleges' },
                                { name: '#Best_Universities', path: 'https://colleges.edumetraglobal.com/colleges' },
                                { name: '#Best_Courses', path: 'https://www.edumetraglobal.com/' },
                                { name: '#Best_Exams', path: 'https://colleges.edumetraglobal.com/colleges' }
                            ].map((tag, index) => (
                                <a
                                    key={index}
                                    href={tag.path}
                                    onClick={() => pushLeadToTeleCRM({}, ['Portal Footer Tag: ' + tag.name])}
                                    className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                >
                                    {tag.name}
                                </a>
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
                                    <Link
                                        to={course.path}
                                        className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        {course.name}
                                    </Link>
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
                                    <Link
                                        to={university.path}
                                        className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        {university.name}
                                    </Link>
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
                                    <Link
                                        to={exam.path}
                                        className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        {exam.name}
                                    </Link>
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
                                        onClick={() => {
                                            if (link.path.includes('edumetraglobal.com')) {
                                                pushLeadToTeleCRM({}, ['Portal Footer: Visited Main Site - ' + link.name]);
                                            }
                                        }}
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
