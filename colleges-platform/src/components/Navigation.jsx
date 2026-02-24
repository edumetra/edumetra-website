/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, GraduationCap, Menu, X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignup } from '../contexts/SignupContext';

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isSignedUp } = useSignup();

    // Handle scroll effect for transparency -> glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Colleges', path: '/colleges' },
        { name: 'Compare', path: '/compare' }, // Placeholder
        { name: 'Reviews', path: '/reviews' }, // Placeholder
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
                ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 shadow-lg'
                : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="p-2 bg-blue-600 rounded-xl group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                College Explorer
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-blue-400 relative py-1 ${location.pathname === link.path ? 'text-white' : 'text-slate-400'
                                    }`}
                            >
                                {link.name}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="desktopNavIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section: Search & Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Interactive Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 block w-64 pl-10 p-2.5 transition-all focus:w-72 focus:bg-slate-900 placeholder-slate-500"
                                placeholder="Search colleges, courses..."
                            />
                        </div>

                        {isSignedUp ? (
                            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 transition-colors">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    S
                                </div>
                                <span className="text-sm font-medium">Profile</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                                    Log In
                                </button>
                                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-950 border-b border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {/* Mobile Search */}
                            <div className="relative mb-6 mt-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
                                    placeholder="Search colleges..."
                                />
                            </div>

                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === link.path
                                        ? 'bg-blue-600/10 text-blue-400'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="border-t border-slate-800 my-4 pt-4">
                                {isSignedUp ? (
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                                            S
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-medium">My Account</div>
                                            <div className="text-xs text-slate-500">View Profile</div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="space-y-3">
                                        <button className="w-full text-center py-3 rounded-lg border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors">
                                            Log In
                                        </button>
                                        <button className="w-full text-center py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                                            Sign Up Free
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
