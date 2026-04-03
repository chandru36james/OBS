import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomeScreen from './pages/HomeScreen';
import AboutScreen from './pages/AboutScreen';
import ServicesScreen from './pages/ServicesScreen';
import GalleryScreen from './pages/GalleryScreen';
import JournalScreen from './pages/JournalScreen';
import ProjectDetailScreen from './pages/ProjectDetailScreen';
import ContactScreen from './pages/ContactScreen';
import CustomCursor from './components/CustomCursor';
import { AuthProvider } from './lib/AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { PagesManager } from './pages/admin/PagesManager';
import { PostsManager } from './pages/admin/PostsManager';
import { SiteEditor } from './pages/admin/SiteEditor';
import { Settings } from './pages/admin/Settings';
import { BrochureManager } from './pages/admin/BrochureManager';
import { LeadsManager } from './pages/admin/LeadsManager';
import { Toaster } from 'sonner';

import { DynamicPage } from './pages/DynamicPage';
import { DynamicPost } from './pages/DynamicPost';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="site-editor" element={<SiteEditor />} />
            <Route path="pages" element={<PagesManager />} />
            <Route path="posts" element={<PostsManager />} />
            <Route path="brochures" element={<BrochureManager />} />
            <Route path="leads" element={<LeadsManager />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Public Routes */}
          <Route path="*" element={
            <>
              <CustomCursor />
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/about" element={<AboutScreen />} />
                  <Route path="/services" element={<ServicesScreen />} />
                  <Route path="/gallery" element={<GalleryScreen />} />
                  <Route path="/journal" element={<JournalScreen />} />
                  <Route path="/project-detail/:id" element={<ProjectDetailScreen />} />
                  <Route path="/contact" element={<ContactScreen />} />
                  <Route path="/p/:slug" element={<DynamicPage />} />
                  <Route path="/journal/:slug" element={<DynamicPost />} />
                </Routes>
              </MainLayout>
            </>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
