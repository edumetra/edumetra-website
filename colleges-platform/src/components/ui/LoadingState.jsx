import { motion } from 'framer-motion';

export function LoadingState({ message = "Loading..." }) {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-2 border-slate-800 border-t-red-500 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            />
            <p className="text-slate-400 font-medium text-sm animate-pulse">{message}</p>
        </div>
    );
}
