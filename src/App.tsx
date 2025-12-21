import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import MemorialPage from './pages/MemorialPage';
import GalleryPage from './pages/GalleryPage';
import HeritagePage from './pages/HeritagePage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import { PrivacyContent, TermsContent } from './components/LegalContent';
import { GalleryProvider } from './context/GalleryContext';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { ParticleIntro } from './components/ParticleIntro';

const App: React.FC = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && (
        <ParticleIntro onEnter={() => setIntroComplete(true)} />
      )}

      {introComplete && (
        <UIProvider>
          <AuthProvider>
            <GalleryProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="create" element={<CreatePage />} />
                    <Route path="memorial/:id" element={<MemorialPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="heritage" element={<HeritagePage />} />
                    <Route path="auth" element={<AuthPage />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="about" element={<AboutPage />}>
                       <Route path="privacy" element={<PrivacyContent />} />
                       <Route path="terms" element={<TermsContent />} />
                    </Route>
                  </Route>
                </Routes>
              </Router>
            </GalleryProvider>
          </AuthProvider>
        </UIProvider>
      )}
    </>
  );
};

export default App;
