import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Integrated Groq AI Workflows
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import { SignupProvider } from './contexts/SignupContext';
import { CompareProvider } from './contexts/CompareContext';
import { PremiumProvider } from './contexts/PremiumContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CollegeListPage from './pages/CollegeListPage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import ProfilePage from './pages/ProfilePage';
import WriteReviewPage from './pages/WriteReviewPage';
import ComparePage from './pages/ComparePage';
import RankingsPage from './pages/RankingsPage';
import EligibilityCheckerPage from './pages/EligibilityCheckerPage';
import RankPredictorPage from './pages/RankPredictorPage';
import NEETPrepPage from './pages/NEETPrepPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ExamDetailPage from './pages/ExamDetailPage';
import PricingPage from './pages/PricingPage';
import NewsUpdatesPage from './pages/NewsUpdatesPage';
import CareersPage from './pages/CareersPage';
import SiteNotice from './components/ui/SiteNotice';
import { CommandPalette } from './components/ui/CommandPalette';
import { ChatbotProvider, ChatbotWidget } from './components/chatbot';
import ComingSoonPage from './pages/ComingSoonPage';
import AuthGuard from './components/auth/AuthGuard';
import './index.css';

function App() {
  return (
    <SignupProvider>
      <CompareProvider>
        <PremiumProvider>
        <ChatbotProvider>
          <Router>
            <ScrollToTop />
            <CommandPalette />
            <Toaster 
                position="bottom-center" 
                toastOptions={{ 
                    className: 'bg-slate-900 border border-slate-700 text-white shadow-2xl rounded-xl text-sm font-medium tracking-wide', 
                    duration: 3000,
                    success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
                }} 
            />
            <SiteNotice />
            <ChatbotWidget />
            <Routes>
              {/* All routes rendered inside Navigation + Footer via Outlet */}
              <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="colleges" element={<CollegeListPage />} />
                <Route path="colleges/:slug" element={<CollegeDetailPage />} />
                <Route path="profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                <Route path="review" element={<WriteReviewPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="rankings" element={<RankingsPage />} />
                <Route path="eligibility" element={<AuthGuard><EligibilityCheckerPage /></AuthGuard>} />
                <Route path="rank-predictor" element={<AuthGuard><RankPredictorPage /></AuthGuard>} />
                <Route path="neet-prep" element={<AuthGuard><NEETPrepPage /></AuthGuard>} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="articles/:slug" element={<ArticleDetailPage />} />
                <Route path="exams/:slug" element={<ExamDetailPage />} />
                <Route path="news-updates" element={<NewsUpdatesPage />} />
                <Route path="careers" element={<CareersPage />} />
                <Route path="pricing" element={<PricingPage />} />
                {/* Named 404 (navigate('/404') from CollegeDetailPage) + catch-all */}
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Standalone — no nav/footer wrapper */}
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
          </Router>
        </ChatbotProvider>
        </PremiumProvider>
      </CompareProvider>
    </SignupProvider>
  );
}

export default App;
