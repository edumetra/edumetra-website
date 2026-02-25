import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SignupModal from '../components/SignupModal';
import CompareBar from '../components/CompareBar';
import { useSignup } from '../contexts/SignupContext';

export default function MainLayout() {
    const { showModal, closeModal } = useSignup();

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <CompareBar />
            <SignupModal isOpen={showModal} onClose={closeModal} />
        </div>
    );
}
