import { Component, ErrorInfo, ReactNode, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Drawer from './layouts/super_admin_dashboardLayout/Drawer';
import AddSchoolForm from './SuperAdminPages/SuperAdminDashboard/AddSchoolForm';
import SchoolList from './SuperAdminPages/SuperAdminDashboard/SchoolList/SchoolList';
import StudentList from './SuperAdminPages/SuperAdminDashboard/Students/StudentList';
import AddStudentForm from './SuperAdminPages/SuperAdminDashboard/Students/AddStudentForm';
import TeacherList from './SuperAdminPages/SuperAdminDashboard/Teachers/TeacherList';
import AddTeacherForm from './SuperAdminPages/SuperAdminDashboard/Teachers/AddTeacherForm';
import AddClass from './SuperAdminPages/SuperAdminDashboard/ClassManage/AddClass';
import ClassSchedule from './SuperAdminPages/SuperAdminDashboard/ClassManage/ClassSchedule';
import ClassList from './SuperAdminPages/SuperAdminDashboard/ClassManage/ClassList';

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

// Public Layout Component
const PublicLayout = ({ onLoginClick, isAuthenticated }: { onLoginClick: () => void, isAuthenticated: boolean }) => (
  <div className="min-h-screen bg-white font-inter">
    <Header 
      onLoginClick={onLoginClick}
      isAuthenticated={isAuthenticated}
      onLogout={() => {}}
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
  </div>
);

// Dashboard Layout Component
const DashboardLayout = ({ onLogout }: { onLogout: () => void }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const location = useLocation();

  // If not on a dashboard route, redirect to dashboard
  if (!location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Overlay when drawer is open on mobile */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 ${isDrawerOpen ? 'w-64' : 'w-0'} transition-all duration-300`}>
        <Drawer 
          isOpen={true}
          onClose={() => setIsDrawerOpen(false)}
          onLogout={onLogout}
        />
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isDrawerOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isDrawerOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, Admin</span>
              <button 
                onClick={onLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Routes>
            <Route index element={<div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p>Welcome to the admin dashboard. Use the sidebar to navigate.</p>
            </div>} />
            <Route path="schools">
              <Route index element={<SchoolList />} />
              <Route path="add" element={<AddSchoolForm />} />
            </Route>
            <Route path="students">
              <Route index element={<StudentList />} />
              <Route path="add" element={<AddStudentForm />} />
            </Route>
            <Route path="teachers">
              <Route index element={<TeacherList />} />
              <Route path="add" element={<AddTeacherForm />} />
            </Route>
            <Route path="classes">
              <Route index element={<ClassList />} />
              <Route path="add" element={<AddClass/>} />
             <Route path="schedule" element={<ClassSchedule />} />
            </Route>
            <Route path="users" element={<div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold mb-4">Users Management</h1>
              <p>Manage all users in the system.</p>
            </div>} />
            <Route path="settings" element={<div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold mb-4">Settings</h1>
              <p>Configure system settings.</p>
            </div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already logged in from localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const handleLoginSuccess = (role: UserRole) => {
    console.log('Login successful, role:', role);
    // Save authentication state to localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      <DemoProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <>
                  <PublicLayout 
                    onLoginClick={() => setIsLoginModalOpen(true)} 
                    isAuthenticated={isAuthenticated} 
                  />
                  <LoginModal 
                    isOpen={isLoginModalOpen} 
                    onClose={() => setIsLoginModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                  />
                </>
              )
            } />
            
            <Route 
              path="/dashboard/*" 
              element={
                isAuthenticated ? (
                  <DashboardLayout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" state={{ from: '/dashboard' }} replace />
                )
              } 
            />
            
            <Route path="*" element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            } />
          </Routes>
        </Router>
      </DemoProvider>
    </ErrorBoundary>
  );
}

export default App;