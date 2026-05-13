import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Menu, X, LogOut, User, ChevronDown, Search,
    Home, Trophy, BookOpen, IndianRupee, PenSquare, Wrench, ChevronRight, ExternalLink
} from 'lucide-react';
import { pushLeadToTeleCRM } from '../services/telecrm';
import { useSignup } from '../contexts/SignupContext';

const Navigation = () => {
    const { isSignedUp, user, logout, openSignIn, openSignUp } = useSignup();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef(null);
    const searchRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Close menus on outside click
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

    const getUserInitial = () => {
        if (!user) return 'U';
        return (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase();
    };

    const getUserDisplayName = () => {
        if (!user) return '';
        return user.user_metadata?.full_name || user.email || 'My Account';
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Home', to: '/', internal: true, icon: Home },
        { label: 'Find Colleges', to: '/colleges', internal: true, icon: GraduationCap },
        { label: 'Rankings', to: '/rankings', internal: true, icon: Trophy },
        { label: 'Articles', to: '/articles', internal: true, icon: BookOpen },
        { label: 'Pricing', to: '/pricing', internal: true, icon: IndianRupee },
        {
            label: 'Tools',
            icon: Wrench,
            dropdown: [
                { label: '🎯 Eligibility Checker', to: '/eligibility', desc: 'Find colleges you can get into' },
                { label: '🧠 NEET AI Advisor', to: '/neet-prep', desc: 'Personalised NEET study plan' },
            ]
        },
        { label: 'Write a Review', to: '/review', internal: true, icon: PenSquare },
        { label: 'Main Website', to: 'https://www.edumetraglobal.com', internal: false, icon: ExternalLink },
    ];

    // Bottom tab bar — 4 most-used pages
    const bottomTabs = [
        { label: 'Home', to: '/', icon: Home },
        { label: 'Colleges', to: '/colleges', icon: GraduationCap },
        { label: 'Rankings', to: '/rankings', icon: Trophy },
        { label: isSignedUp ? 'Profile' : 'Sign In', to: isSignedUp ? '/profile' : null, icon: User, action: isSignedUp ? null : openSignIn },
    ];

    return (
        <>
            {/* Search overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-28 px-4"
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            ref={searchRef}
                            initial={{ opacity: 0, y: -20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="w-full max-w-2xl bg-[#0f1629] border border-white/12 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
                                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search colleges, cities, courses..."
                                    className="flex-1 bg-transparent text-white text-lg placeholder:text-slate-500 focus:outline-none"
                                />
                                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">
                                    Search
                                </button>
                            </form>
                            <div className="px-4 pb-4 text-xs text-slate-600">
                                Press Enter to search or Esc to close
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-50 bg-[#070c1a]/98 backdrop-blur-xl border-b border-white/6 shadow-xl shadow-black/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
                            <div className="h-12 w-auto px-5 bg-white flex items-center justify-center shadow-lg overflow-hidden rounded-xl group-hover:scale-105 transition-transform duration-300">
                                <img src="/logo-final.jpg" alt="Edumetra Logo" className="h-10 w-auto object-contain" />
                            </div>
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 uppercase tracking-wider">
                                Colleges
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map(({ label, to, internal, dropdown }) => {
                                if (dropdown) {
                                    return (
                                        <div key={label} className="relative group">
                                            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200">
                                                {label}
                                                <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
                                            </button>
                                            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <div className="bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl py-2 min-w-[220px]">
                                                    {dropdown.map(item => (
                                                        <Link
                                                            key={item.to}
                                                            to={item.to}
                                                            className="flex flex-col px-4 py-3 hover:bg-white/6 transition-colors rounded-xl mx-1"
                                                        >
                                                            <span className="text-sm font-semibold text-white">{item.label}</span>
                                                            {item.desc && <span className="text-xs text-slate-500 mt-0.5">{item.desc}</span>}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                const active = isActive(to);
                                return internal ? (
                                    <Link
                                        key={label}
                                        to={to}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${active
                                            ? 'text-white bg-white/8'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                ) : (
                                    <a
                                        key={label}
                                        href={to}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            pushLeadToTeleCRM({}, ['Header: Visited Main Site']);
                                        }}
                                        className="px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 whitespace-nowrap"
                                    >
                                        {label}
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-all duration-200"
                                title="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            {isSignedUp ? (
                                <div
                                    className="relative"
                                    ref={userMenuRef}
                                    onMouseEnter={() => setUserMenuOpen(true)}
                                    onMouseLeave={() => setUserMenuOpen(false)}
                                >
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-white/8 transition-all duration-200 group"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {getUserInitial()}
                                        </div>
                                        <span className="hidden md:block text-sm text-slate-300 font-medium group-hover:text-white transition-colors max-w-[100px] truncate">
                                            {getUserDisplayName()}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl py-2"
                                            >
                                                <div className="px-4 py-3 border-b border-white/8">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Signed in</p>
                                                    <p className="text-sm text-white font-medium truncate">{getUserDisplayName()}</p>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/6 hover:text-white transition-colors"
                                                >
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    My Profile
                                                </Link>
                                                <button
                                                    onClick={() => { logout(); setUserMenuOpen(false); }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
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
                                    <button
                                        onClick={() => openSignIn()}
                                        className="hidden md:block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 whitespace-nowrap"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => openSignUp()}
                                        className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg shadow-lg shadow-red-900/30 hover:scale-105 transition-all duration-200 whitespace-nowrap"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-all duration-200"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="lg:hidden border-t border-white/6 overflow-hidden bg-[#070c1a]"
                        >
                            <div className="px-4 py-4 space-y-0.5">
                                {navItems.map(({ label, to, icon: Icon, dropdown, internal }) => {
                                    if (dropdown) {
                                        return (
                                            <div key={label}>
                                                <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</p>
                                                {dropdown.map(item => (
                                                    <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-all">
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        );
                                    }
                                    const active = isActive(to);
                                    return internal ? (
                                        <Link key={label} to={to} onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                                ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                                                : 'text-slate-400 hover:text-white hover:bg-white/6'
                                            }`}>
                                            {Icon && <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-red-400' : 'text-slate-500'}`} />}
                                            {label}
                                            {active && <ChevronRight className="w-4 h-4 ml-auto text-red-500" />}
                                        </Link>
                                    ) : (
                                        <a key={label} href={to} 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => { setMobileMenuOpen(false); pushLeadToTeleCRM({}, ['Header: Visited Main Site']); }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/6 transition-all">
                                            {Icon && <Icon className="w-4 h-4 shrink-0 text-slate-500" />}
                                            {label}
                                        </a>
                                    );
                                })}

                                {!isSignedUp ? (
                                    <div className="flex flex-col gap-2 pt-4 border-t border-white/6 mt-2">
                                        <button
                                            onClick={() => { openSignIn(); setMobileMenuOpen(false); }}
                                            className="w-full py-3 text-center text-sm font-medium text-slate-300 hover:text-white hover:bg-white/6 rounded-xl transition-all"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => { openSignUp(); setMobileMenuOpen(false); }}
                                            className="w-full py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl transition-all"
                                        >
                                            Sign Up Free
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-white/6 mt-2 space-y-0.5">
                                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-all">
                                            <User className="w-4 h-4 text-slate-500" /> My Profile
                                        </Link>
                                        <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left">
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* ── Persistent Bottom Tab Bar (mobile only) ── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070c1a]/95 backdrop-blur-xl border-t border-white/8">
                <div className="flex items-stretch h-16">
                    {bottomTabs.map(({ label, to, icon: Icon, action }) => {
                        const active = to && isActive(to);
                        const Wrapper = to ? Link : 'button';
                        return (
                            <Wrapper
                                key={label}
                                to={to || undefined}
                                onClick={action || undefined}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors relative ${active ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {active && <motion.div layoutId="bottomTabIndicator" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-500 rounded-full" />}
                                <Icon className="w-5 h-5" />
                                {label}
                            </Wrapper>
                        );
                    })}
                </div>
            </nav>

            {/* Spacer so content doesn't hide behind the tab bar */}
            <div className="lg:hidden h-16" />
        </>
    );
};

export default Navigation;
