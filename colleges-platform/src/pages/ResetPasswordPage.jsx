import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, Lock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResetPasswordPage() {
    const navigate = useNavigate();

    // 'waiting'  – checking for recovery session from URL hash
    // 'ready'    – recovery session active, show new password form
    // 'invalid'  – no recovery session after timeout
    // 'success'  – password updated successfully
    const [pageState, setPageState] = useState('waiting');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Supabase fires PASSWORD_RECOVERY when the user arrives via the magic link
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setPageState('ready');
            }
        });

        // Fallback: if after 4 seconds we still have no recovery session, show error
        const timeout = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setPageState('invalid');
            } else {
                // Edge case: session exists but event already fired before listener registered
                setPageState(prev => prev === 'waiting' ? 'ready' : prev);
            }
        }, 4000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            setError(updateError.message);
        } else {
            setPageState('success');
            // Sign the user out of the recovery session and redirect home after 2.5 s
            setTimeout(async () => {
                await supabase.auth.signOut();
                navigate('/');
            }, 2500);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">

                {/* ── WAITING ── */}
                {pageState === 'waiting' && (
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                            <div className="w-6 h-6 border-2 border-red-500/40 border-t-red-400 rounded-full animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Verifying reset link…</h1>
                        <p className="text-slate-500 text-sm">Please wait a moment.</p>
                    </div>
                )}

                {/* ── INVALID / EXPIRED ── */}
                {pageState === 'invalid' && (
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                            <AlertTriangle className="w-7 h-7 text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">Link expired or invalid</h1>
                        <p className="text-slate-400 text-sm mb-8">
                            This password reset link has expired or was already used. Request a new one from the Sign In page.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition-all text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                )}

                {/* ── SUCCESS ── */}
                {pageState === 'success' && (
                    <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="w-7 h-7 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">Password updated!</h1>
                        <p className="text-slate-400 text-sm mb-2">
                            Your password has been changed successfully.
                        </p>
                        <p className="text-slate-600 text-xs">Redirecting you to the home page…</p>
                    </div>
                )}

                {/* ── READY — Set New Password Form ── */}
                {pageState === 'ready' && (
                    <div className="bg-[#0f1629] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-8">
                        {/* Header */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-500/15 p-4 rounded-2xl border border-red-500/20">
                                <KeyRound className="w-9 h-9 text-red-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-center text-white mb-1.5">Set New Password</h1>
                        <p className="text-slate-400 text-center text-sm mb-6">
                            Choose a strong new password for your account.
                        </p>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* New password */}
                            <div>
                                <label htmlFor="new-password" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        autoFocus
                                        type="password"
                                        id="new-password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        placeholder="Min. 8 characters"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        placeholder="Re-enter your new password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all text-sm"
                                    />
                                </div>

                                {/* Live match indicator */}
                                {confirmPassword.length > 0 && (
                                    <p className={`text-xs mt-1.5 font-medium ${password === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] mt-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <KeyRound className="w-4 h-4" />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
