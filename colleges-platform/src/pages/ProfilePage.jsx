
import { useSignup } from '../contexts/SignupContext';
import { User, Mail, LogOut, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const { user, logout } = useSignup();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                    <p className="text-slate-400 mb-6">You must be logged in to view this page.</p>
                    <Link to="/" className="text-blue-500 hover:text-blue-400">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pt-32 px-4 pb-20">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-800">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-900/20">
                            {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1">
                                {user.user_metadata?.full_name || 'User'}
                            </h1>
                            <p className="text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                                <Mail className="w-4 h-4" /> {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" /> Account Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                                    <p className="text-slate-200">{user.user_metadata?.full_name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                                    <p className="text-slate-200">{user.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-1">User ID</label>
                                    <p className="text-slate-400 text-xs font-mono">{user.id}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl font-medium transition-colors"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
