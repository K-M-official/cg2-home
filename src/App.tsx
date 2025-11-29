import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import MemorialPage from './pages/MemorialPage';
import GalleryPage from './pages/GalleryPage';
import HeritagePage from './pages/HeritagePage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="memorial/:id" element={<MemorialPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="heritage" element={<HeritagePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
