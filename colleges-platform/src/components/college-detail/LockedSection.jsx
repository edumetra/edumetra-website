import { Lock, Crown, ArrowRight, Star } from 'lucide-react';
import { useSignup } from '../../contexts/SignupContext';

export function LockedSection({ title, requiredTier = 'signed_up', children }) {
    const { setShowSignup } = useSignup();

    // Customize messaging based on the typical next step
    const isSignupRequired = requiredTier === 'signed_up';
    const ctaText = isSignupRequired ? 'Create Free Account' : 'Upgrade to Pro';
    const ctaIcon = isSignupRequired ? <ArrowRight className="w-4 h-4" /> : <Crown className="w-4 h-4 text-amber-500" />;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            {/* The blurred content underneath */}
            <div className="blur-md opacity-30 select-none pointer-events-none p-6 pb-20 transition-all duration-500 max-h-[400px] overflow-hidden">
                {children}
            </div>

            {/* The Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center transform transition-all hover:scale-105 duration-300">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-6 shadow-inner border border-slate-700">
                        {isSignupRequired ? (
                            <Lock className="w-8 h-8 text-slate-400" />
                        ) : (
                            <Star className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                        )}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">
                        {title}
                    </h3>

                    <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                        {isSignupRequired
                            ? `Unlock detailed ${title.toLowerCase()} and comprehensive insights by joining our community for free.`
                            : `Get premium access to ${title.toLowerCase()}, advanced comparisons, and AI-powered recommendations.`}
                    </p>

                    <button
                        onClick={() => setShowSignup(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 bg-white text-slate-900 hover:bg-slate-100"
                    >
                        {ctaText}
                        {ctaIcon}
                    </button>

                    {isSignupRequired && (
                        <p className="text-xs text-slate-500 mt-4 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Secure & free forever
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
