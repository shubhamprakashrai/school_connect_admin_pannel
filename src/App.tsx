import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

// Props for MainApp component
interface MainAppProps {
  onLoginSuccess: () => void;
  isAuthenticated: boolean;
}

// Main App Layout
const MainApp: React.FC<MainAppProps> = ({ onLoginSuccess, isAuthenticated }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-white font-inter">
      <Header 
        onLoginClick={() => setIsLoginModalOpen(true)}
        isAuthenticated={isAuthenticated}
      />
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
          onLoginSuccess();
        }}
      />
    </div>
  );
};

// Wrapper component to handle authentication state and navigation
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Function to handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
  };

  return (
    <>
      <Routes>
        {/* Main App Routes */}
        <Route path="/" element={
          <MainApp 
            onLoginSuccess={handleLoginSuccess}
            isAuthenticated={isAuthenticated}
          />
        } />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Navigate to="/" state={{ from: '/admin/dashboard' }} replace />
            )
          } 
        />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <DemoProvider>
      <Router>
        <AppContent />
      </Router>
    </DemoProvider>
  );
}

export default App;