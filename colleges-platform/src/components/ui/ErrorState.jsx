import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function ErrorState({ title = "Something went wrong", message = "We couldn't load the requested data.", onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-900/10"
            >
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    {message}
                </p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="w-full inline-flex justify-center items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                )}
            </motion.div>
        </div>
    );
}
