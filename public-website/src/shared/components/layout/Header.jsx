import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GraduationCap, Star, Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../../features/auth/AuthProvider';

const Header = () => {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);

    const mainNavLinks = [
        { name: 'Home', path: '/' },
        { name: 'Find Colleges', path: '/find-colleges' },
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'MBBS Abroad', path: '/mbbs-abroad' },
        { name: 'Webinars', path: '/webinars-seminars' },
        { name: 'News & Blogs', path: '/news-blogs' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const courseCategories = [
        { name: 'MBBS', path: '/courses/mbbs' },
        { name: 'BDS', path: '/courses/bds' },
        { name: 'BAMS', path: '/courses/bams' },
        { name: 'BHMS', path: '/courses/bhms' },
        { name: 'B.Pharma', path: '/courses/pharma' },
        { name: 'Nursing', path: '/courses/nursing' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
        // TODO: Implement search functionality
    };

    const handleSignOut = async () => {
        await signOut();
        setUserMenuOpen(false);
    };

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-900/98 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/20">
            <div className="container-custom">
                {/* Main Header Bar */}
                <div className="flex items-center justify-between gap-4 py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50 group-hover:shadow-red-600/50 transition-all duration-300 group-hover:scale-110">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl md:text-2xl font-bold hidden sm:block">
                            <span className="gradient-text">Edumetra</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {mainNavLinks.slice(0, 5).map((link, index) => (
                            link.name === 'Find Colleges' ? (
                                <a
                                    key={index}
                                    href={import.meta.env.VITE_COLLEGES_URL || 'https://colleges.edumetra.in'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`relative px-1 py-2 text-sm font-medium transition-all duration-300 rounded-lg group whitespace-nowrap text-slate-300 hover:text-white`}
                                >
                                    {link.name}
                                    <span className="absolute inset-0 rounded-lg bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-300" />
                                </a>
                            ) : (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className={`relative px-1 py-2 text-sm font-medium transition-all duration-300 rounded-lg group whitespace-nowrap ${isActivePath(link.path)
                                        ? 'text-red-400'
                                        : 'text-slate-300 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                    {isActivePath(link.path) && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-400"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className="absolute inset-0 rounded-lg bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-300" />
                                </Link>
                            )
                        ))}

                        {/* Courses Dropdown */}
                        <div className="relative group">
                            <button
                                className="flex items-center gap-1 px-1 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all duration-300 rounded-lg whitespace-nowrap"
                                onMouseEnter={() => setCoursesDropdownOpen(true)}
                                onMouseLeave={() => setCoursesDropdownOpen(false)}
                            >
                                Courses
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${coursesDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {coursesDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
                                        onMouseEnter={() => setCoursesDropdownOpen(true)}
                                        onMouseLeave={() => setCoursesDropdownOpen(false)}
                                    >
                                        {courseCategories.map((course, index) => (
                                            <Link
                                                key={index}
                                                to={course.path}
                                                className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-red-600/20 hover:text-white transition-all duration-200 hover:translate-x-1"
                                            >
                                                {course.name}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>

                    {/* Search Bar - Desktop */}
                    <form
                        onSubmit={handleSearch}
                        className={`hidden md:flex flex-1 transition-all duration-300 ${searchFocused || searchQuery ? 'max-w-md' : 'max-w-xs'
                            }`}
                    >
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-400 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                placeholder="Search colleges..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-slate-800 transition-all duration-300"
                            />
                        </div>
                    </form>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/review"
                            className="hidden xl:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 text-sm shadow-lg shadow-red-900/30 hover:shadow-red-600/40 hover:scale-105 whitespace-nowrap"
                        >
                            <Star className="w-4 h-4" />
                            Write Review
                        </Link>

                        {/* User Menu or Auth Buttons */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-semibold text-sm">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl py-2 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-750">
                                                <p className="text-sm text-white font-semibold truncate">{user.email}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {user.user_metadata?.full_name || 'User'}
                                                </p>
                                            </div>
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-red-600/20 hover:text-white transition-all duration-200"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-red-600/20 hover:text-white transition-all duration-200 text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden md:block px-4 py-2 text-white hover:text-red-400 font-semibold transition-all duration-300 text-sm whitespace-nowrap"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="hidden md:block px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 text-sm shadow-lg shadow-red-900/30 hover:shadow-red-600/40 hover:scale-105 whitespace-nowrap"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 hover:scale-105"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-slate-300" />
                            ) : (
                                <Menu className="w-5 h-5 text-slate-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="md:hidden pb-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-400 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search colleges..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-slate-800 transition-all duration-300"
                        />
                    </div>
                </form>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="lg:hidden border-t border-slate-800/50 py-4 overflow-hidden"
                        >
                            <nav className="flex flex-col gap-1">
                                {/* Main Navigation Links */}
                                <div className="mb-2">
                                    <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Pages</p>
                                    {mainNavLinks.map((link, index) => (
                                        link.name === 'Find Colleges' ? (
                                            <a
                                                key={index}
                                                href={import.meta.env.VITE_COLLEGES_URL || 'https://colleges.edumetra.in'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link
                                                key={index}
                                                to={link.path}
                                                className={`block px-4 py-2.5 rounded-lg transition-all duration-200 ${isActivePath(link.path)
                                                    ? 'bg-red-600/20 text-red-400 font-semibold'
                                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {link.name}
                                            </Link>
                                        )
                                    ))}
                                </div>

                                {/* Course Categories */}
                                <div className="mb-2">
                                    <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses</p>
                                    {courseCategories.map((course, index) => (
                                        <Link
                                            key={index}
                                            to={course.path}
                                            className="block px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {course.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 mt-4 px-2">
                                    <Link
                                        to="/review"
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-900/30"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Star className="w-4 h-4" />
                                        Write a Review
                                    </Link>
                                    {!user && (
                                        <>
                                            <Link
                                                to="/login"
                                                className="px-4 py-3 text-center text-white hover:bg-slate-800 font-semibold rounded-lg transition-all"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                to="/signup"
                                                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg text-center transition-all"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Sign Up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;
