import React, { useState } from 'react';
import { Rocket, Mail, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { pushLeadToTeleCRM } from '../services/telecrm';

const ComingSoonPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleNotify = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        await pushLeadToTeleCRM({ email }, ['Coming Soon: Notify Me']);
        setIsSubmitted(true);
        setEmail('');
    };

    return (
        <div className="min-h-screen bg-[#070c1a] flex items-center justify-center relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 max-w-3xl w-full text-center">
                {/* Logo Area */}
                <div className="mb-12 inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logo-final.jpg" alt="Logo" className="w-8 h-auto object-contain" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">Edumetra <span className="text-red-500">Colleges</span></span>
                </div>

                {/* Main Content */}
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                    Something <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-400 bg-clip-text text-transparent">Extraordinary</span> <br />
                    Is Coming Soon
                </h1>
                
                <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
                    We're building India's most advanced college discovery and admission platform. 
                    Get ready for a revolutionary way to find and compare your dream colleges.
                </p>

                {/* Status Cards */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <div className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm min-w-[140px] hover:bg-white/10 transition-colors">
                        <div className="text-3xl font-black text-white mb-1">98%</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Platform Ready</div>
                    </div>
                    <div className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm min-w-[140px] hover:bg-white/10 transition-colors">
                        <Rocket className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Pre-Launch</div>
                    </div>
                </div>

                {/* Notification Form */}
                <div className="max-w-md mx-auto mb-16">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        {isSubmitted ? (
                            <div className="relative p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl text-white font-bold">
                                ✓ We'll notify you as soon as we go live!
                            </div>
                        ) : (
                            <form 
                                className="relative flex p-1.5 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl"
                                onSubmit={handleNotify}
                            >
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email for early access"
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-3 placeholder:text-slate-600 text-sm"
                                />
                                <button type="submit" className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all flex items-center gap-2">
                                    Notify Me
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                    <p className="mt-4 text-xs text-slate-600 font-medium italic">
                        * Be the first to know when we go live and get exclusive early-bird benefits.
                    </p>
                </div>

                {/* Footer Link */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Servers Online
                        </div>
                    </div>
                    
                    <a 
                        href="https://edumetraglobal.com" 
                        onClick={() => pushLeadToTeleCRM({}, ['Coming Soon: Visit Main Site'])}
                        className="group flex items-center gap-3 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all text-sm font-bold"
                    >
                        <Sparkles className="w-4 h-4 text-red-500" />
                        Visit Main Website
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonPage;
