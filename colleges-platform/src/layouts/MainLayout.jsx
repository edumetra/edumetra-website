import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SignupModal from '../components/SignupModal';
import CompareBar from '../components/CompareBar';
import { useSignup } from '../contexts/SignupContext';

export default function MainLayout() {
    const { showModal, closeModal } = useSignup();
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
            <Navigation />
            <main className="flex-1 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="h-full w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
            <CompareBar />
            <SignupModal isOpen={showModal} onClose={closeModal} />
        </div>
    );
}
