import { Lock, Crown, ArrowRight, Star } from 'lucide-react';
import { useSignup } from '../../contexts/SignupContext';

export function LockedSection({ title, requiredTier = 'signed_up', children }) {
    const { setShowSignup } = useSignup();

    const isSignupRequired = requiredTier === 'signed_up';
    const ctaText = isSignupRequired ? 'Create Free Account' : 'Upgrade to Pro';

    return (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800">
            {/* Blurred background content */}
            <div className="blur-sm opacity-20 select-none pointer-events-none p-6 max-h-[280px] overflow-hidden">
                {children}
            </div>

            {/* Lock banner — compact horizontal layout */}
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950/95">
                <div className="w-full mx-4 sm:mx-8 bg-slate-900 border border-slate-700/60 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-xl">
                    {/* Icon + text */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                            {isSignupRequired
                                ? <Lock className="w-5 h-5 text-slate-400" />
                                : <Star className="w-5 h-5 text-amber-400" />
                            }
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{title} is locked</p>
                            <p className="text-slate-400 text-xs mt-0.5 leading-snug">
                                {isSignupRequired
                                    ? 'Create a free account to unlock this section'
                                    : 'Upgrade to Pro to access this section'}
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => setShowSignup(true)}
                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-white text-slate-900 hover:bg-slate-100 active:scale-95 shadow"
                    >
                        {ctaText}
                        {isSignupRequired
                            ? <ArrowRight className="w-4 h-4" />
                            : <Crown className="w-4 h-4 text-amber-500" />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
