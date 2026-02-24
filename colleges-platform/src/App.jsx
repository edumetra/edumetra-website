import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignupProvider } from './contexts/SignupContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CollegeListPage from './pages/CollegeListPage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

function App() {
  return (
    <SignupProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="colleges" element={<CollegeListPage />} />
            <Route path="colleges/:collegeId" element={<CollegeDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </SignupProvider>
  );
}

export default App;
