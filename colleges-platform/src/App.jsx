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
import './index.css';

function App() {
  return (
    <SignupProvider>
      <CompareProvider>
        <PremiumProvider>
          <Router>
            <Routes>
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
              </Route>
            </Routes>
          </Router>
        </PremiumProvider>
      </CompareProvider>
    </SignupProvider>
  );
}

export default App;
