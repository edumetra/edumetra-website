import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ShortlistPage from './pages/ShortlistPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import './index.css';

function App() {
  return (
    <SignupProvider>
      <CompareProvider>
        <PremiumProvider>
          <Router>
            <Routes>
              {/* All routes rendered inside Navigation + Footer via Outlet */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="colleges" element={<CollegeListPage />} />
                <Route path="colleges/:collegeId" element={<CollegeDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="review" element={<WriteReviewPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="rankings" element={<RankingsPage />} />
                <Route path="eligibility" element={<EligibilityCheckerPage />} />
                <Route path="shortlist" element={<ShortlistPage />} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="articles/:slug" element={<ArticleDetailPage />} />
                {/* Named 404 (navigate('/404') from CollegeDetailPage) + catch-all */}
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Standalone — no nav/footer wrapper */}
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
          </Router>
        </PremiumProvider>
      </CompareProvider>
    </SignupProvider>
  );
}

export default App;
