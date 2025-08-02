import { Component, ErrorInfo, ReactNode, useState } from 'react';
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

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">We're working on fixing this issue. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Types
type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'superadmin';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleLoginSuccess = (role: UserRole) => {
    console.log('Login successful, role:', role);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      <DemoProvider>
        <div className="min-h-screen bg-white font-inter">
          <Header 
            onLoginClick={() => setIsLoginModalOpen(true)}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
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
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </DemoProvider>
    </ErrorBoundary>
  );
}

export default App;