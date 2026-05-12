import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import SEO from '../components/SEO';
import { pushLeadToTeleCRM } from '../services/telecrm';
import { motion } from 'framer-motion';
const SignupPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';
    const { signUp, signInWithGoogle, user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate(returnUrl, { replace: true });
    }, [user, navigate, returnUrl]);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const validateForm = () => {
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpVerified) {
            setError('Please verify your phone number with OTP first');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        const { error } = await signUp(formData.email, formData.password, {
            full_name: formData.name,
            phone: formData.phone,
        });

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            // Push to TeleCRM (fire-and-forget)
            pushLeadToTeleCRM(
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    status: 'Fresh',
                },
                ['Signup', 'New User', 'OTP Verified']
            );
            setSuccess('Account created successfully! Please check your email to verify your account.');
            setTimeout(() => {
                navigate(`/login${returnUrl !== '/dashboard' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
            }, 3000);
        }
    };

    return (
        <>
            <SEO page="signup" />
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-md w-full space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Create Account
                            </h2>
                            <p className="text-slate-400">
                                Start your journey with Edumetra or <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold underline-offset-4 hover:underline">sign in</Link>
                            </p>
                        </div>
                        <Link 
                            to="/login" 
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-600/10 hover:bg-primary-600/20 text-primary-400 border border-primary-500/20 rounded-lg text-sm font-bold transition-all"
                        >
                            Sign In <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="card space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                                        +91
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        disabled={otpVerified}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                                        placeholder="Enter 10-digit number"
                                        pattern="[0-9]{10}"
                                    />
                                </div>
                                {!otpVerified && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (formData.phone.length !== 10) {
                                                setError('Please enter a valid 10-digit phone number');
                                                return;
                                            }
                                            setSendingOtp(true);
                                            setError('');
                                            try {
                                                const res = await fetch('/api/otp/send', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ phone: formData.phone }),
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    setOtpSent(true);
                                                    setSuccess('OTP sent successfully!');
                                                    setTimeout(() => setSuccess(''), 3000);
                                                } else {
                                                    setError(data.error || 'Failed to send OTP');
                                                }
                                            } catch (err) {
                                                setError('Failed to send OTP. Please try again.');
                                            } finally {
                                                setSendingOtp(false);
                                            }
                                        }}
                                        disabled={sendingOtp}
                                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-medium hover:bg-slate-700 transition-all disabled:opacity-50 min-w-[100px]"
                                    >
                                        {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                                    </button>
                                )}
                                {otpVerified && (
                                    <div className="flex items-center gap-1 text-green-500 text-sm font-medium px-2">
                                        <CheckCircle className="w-4 h-4" /> Verified
                                    </div>
                                )}
                            </div>
                        </div>

                        {otpSent && !otpVerified && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2"
                            >
                                <label htmlFor="otp" className="block text-sm font-medium text-slate-300">
                                    Verify OTP
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="6-digit OTP"
                                        maxLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (otp.length !== 6) {
                                                setError('Please enter 6-digit OTP');
                                                return;
                                            }
                                            setVerifyingOtp(true);
                                            setError('');
                                            try {
                                                const res = await fetch('/api/otp/verify', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ phone: formData.phone, otp }),
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    setOtpVerified(true);
                                                    setSuccess('Phone number verified!');
                                                    setTimeout(() => setSuccess(''), 3000);
                                                } else {
                                                    setError(data.error || 'Invalid OTP');
                                                }
                                            } catch (err) {
                                                setError('Verification failed. Please try again.');
                                            } finally {
                                                setVerifyingOtp(false);
                                            }
                                        }}
                                        disabled={verifyingOtp}
                                        className="px-4 py-2 bg-primary-600 rounded-lg text-white text-sm font-medium hover:bg-primary-700 transition-all disabled:opacity-50"
                                    >
                                        {verifyingOtp ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-slate-400">
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary-400 hover:text-primary-300">
                                    Terms & Conditions
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !otpVerified}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!otpVerified ? 'Verify Phone to Continue' : loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </>
    );
};

export default SignupPage;
