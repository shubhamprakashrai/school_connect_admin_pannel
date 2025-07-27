import { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DemoProvider } from './contexts/DemoContext';

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
import AdminDashboard from './pages/Admin/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import StudentDashboard from './pages/Student/Dashboard';
import ParentDashboard from './pages/Parent/Dashboard';
import SuperAdminLogin from './pages/SuperAdmin/Login';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';

// Types
type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'superadmin';

// Props for MainApp component
interface MainAppProps {
  onLoginSuccess: (role: UserRole) => void;
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
        onLoginSuccess={(role) => {
          setIsLoginModalOpen(false);
          onLoginSuccess(role);
        }}
      />
    </div>
  );
};

// Wrapper component to handle authentication state and navigation
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  // Debug effect to log auth state changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, userRole });
  }, [isAuthenticated, userRole]);

  // Function to handle successful login
  const handleLoginSuccess = (role: UserRole) => {
    console.log('Login successful, role:', role);
    setIsAuthenticated(true);
    setUserRole(role);
    
    // Navigate to the appropriate dashboard based on role
    switch(role) {
      case 'superadmin':
        navigate('/super-admin/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'teacher':
        navigate('/teacher/dashboard');
        break;
      case 'parent':
        navigate('/parent/dashboard');
        break;
      default:
        navigate('/student/dashboard');
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
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
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAuthenticated && userRole === 'admin' ? (
              <>
                {console.log('Rendering AdminDashboard')}
                <AdminDashboard onLogout={handleLogout} />
              </>
            ) : (
              <Navigate to="/" state={{ from: '/admin/dashboard' }} replace />
            )
          } 
        />
        
        {/* Teacher Routes */}
        <Route 
          path="/teacher/dashboard" 
          element={
            isAuthenticated && userRole === 'teacher' ? (
              <>
                {console.log('Rendering TeacherDashboard')}
                <TeacherDashboard onLogout={handleLogout} />
              </>
            ) : (
              <Navigate to="/" state={{ from: '/teacher/dashboard' }} replace />
            )
          } 
        />
        
        {/* Student Routes */}
        <Route 
          path="/student/dashboard" 
          element={
            isAuthenticated && userRole === 'student' ? (
              <>
                {console.log('Rendering StudentDashboard')}
                <StudentDashboard onLogout={handleLogout} />
              </>
            ) : (
              <Navigate to="/" state={{ from: '/student/dashboard' }} replace />
            )
          } 
        />
        
        {/* Parent Routes */}
        <Route 
          path="/parent/dashboard" 
          element={
            isAuthenticated && userRole === 'parent' ? (
              <>
                {console.log('Rendering ParentDashboard')}
                <ParentDashboard onLogout={handleLogout} />
              </>
            ) : (
              <Navigate to="/" state={{ from: '/parent/dashboard' }} replace />
            )
          } 
        />
        
        {/* Super Admin Routes */}
        <Route 
          path="/super-admin" 
          element={
            isAuthenticated && userRole === 'superadmin' ? (
              <Navigate to="/super-admin/dashboard" replace />
            ) : (
              <SuperAdminLogin onLoginSuccess={() => handleLoginSuccess('superadmin')} />
            )
          } 
        />
        <Route 
          path="/super-admin/dashboard" 
          element={
            isAuthenticated && userRole === 'superadmin' ? (
              <SuperAdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/super-admin" state={{ from: '/super-admin/dashboard' }} replace />
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
    <ErrorBoundary>
      <Router>
        <DemoProvider>
          <AppContent />
        </DemoProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;