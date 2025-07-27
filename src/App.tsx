import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DemoProvider } from './contexts/DemoContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductDemo from './components/ProductDemo';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Admin/Dashboard';

// Main App Layout
const MainApp = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-white font-inter">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} isLoginModalOpen={isLoginModalOpen} onCloseLoginModal={() => setIsLoginModalOpen(false)} />
      <main>
        <Hero />
        <Features />
        <ProductDemo />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <About />
        <Contact />
        <FAQ />
      </main>
      <Footer />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          // Redirect to admin dashboard on successful login
          window.location.href = '/admin/dashboard';
        }}
      />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <DemoProvider>
      <Router>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<MainApp />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/" state={{ from: '/admin' }} replace />
              )
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DemoProvider>
  );
}

export default App;