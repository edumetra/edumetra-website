import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';
import { useCounselling } from '../../../features/counselling/CounsellingContext';
import { useLocation } from 'react-router-dom';

const StickyMobileCTA = () => {
    const { openModal } = useCounselling();
    const location = useLocation();

    // Hide on specific pages if needed
    const hideOnPages = ['/login', '/signup', '/dashboard'];
    if (hideOnPages.includes(location.pathname)) return null;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] p-4 pointer-events-none">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="pointer-events-auto"
            >
                <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex gap-2">
                    <button
                        onClick={openModal}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 active:scale-95 transition-transform"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Free Counselling
                    </button>
                    <a
                        href="tel:03345336366"
                        className="w-14 h-14 flex items-center justify-center bg-slate-800 text-white rounded-xl border border-white/5 active:scale-95 transition-transform"
                    >
                        <Phone className="w-5 h-5" />
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default StickyMobileCTA;
