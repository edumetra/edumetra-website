import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './features/auth/AuthProvider';
import PromoBanner from './shared/ui/PromoBanner';
import Header from './shared/components/layout/Header';
import Footer from './shared/components/layout/Footer';
import CounsellingModal from './shared/ui/CounsellingModal';
import SiteNotice from './shared/ui/SiteNotice';
import { CounsellingProvider } from './features/counselling/CounsellingContext';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdvertisePage from './pages/AdvertisePage';
import FindCollegesPage from './pages/FindCollegesPage';
import WriteReviewPage from './pages/WriteReviewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WebinarsAndSeminarsPage from './pages/WebinarsAndSeminarsPage';
import MBBSAbroadPage from './pages/MBBSAbroadPage';
import NewsAndBlogsPage from './pages/NewsAndBlogsPage';
import CoursePage from './pages/CoursePage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import EventDetailPage from './pages/EventDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/DashboardPage';
import { analytics } from './shared/utils/analytics';

// ScrollToTop component to handle route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    // Initialize analytics
    analytics.init('YOUR_TRACKING_ID'); // Replace with actual tracking ID
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <CounsellingProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col scrollbar-custom">
              <PromoBanner />
              <Header />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/advertise" element={<AdvertisePage />} />
                  <Route path="/review" element={<WriteReviewPage />} />
                  <Route path="/mbbs-abroad" element={<MBBSAbroadPage />} />
                  <Route path="/news-blogs" element={<NewsAndBlogsPage />} />
                  <Route path="/webinars-seminars" element={<WebinarsAndSeminarsPage />} />
                  <Route path="/webinars-seminars/:slug" element={<EventDetailPage />} />
                  <Route path="/find-colleges" element={<FindCollegesPage />} />
                  <Route path="/colleges/:slug" element={<CollegeDetailPage />} />
                  <Route path="/courses/:courseId" element={<CoursePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
              <Footer />
              <CounsellingModal />
              <SiteNotice />
            </div>
          </Router>
        </CounsellingProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
