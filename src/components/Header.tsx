import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import RequestDemoModal from './RequestDemoModal';

interface HeaderProps {
  onLoginClick: () => void;
  isAuthenticated: boolean;
}

// Animation variants for mobile menu
const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2 
    }
  }
};

const navItemVariants: Variants = {
  hover: { 
    y: -2,
    transition: { type: 'spring', stiffness: 300 }
  },
  initial: { y: 0 }
};

const Header: React.FC<HeaderProps> = ({ onLoginClick, isAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  const navItems = [
    { 
      name: 'Product', 
      href: '#product',
      submenu: [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Integrations', href: '#integrations' },
      ]
    },
    { 
      name: 'Solutions', 
      href: '#solutions',
      submenu: [
        { name: 'For Schools', href: '#schools' },
        { name: 'For Teachers', href: '#teachers' },
        { name: 'For Parents', href: '#parents' },
      ]
    },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Resources', href: '#resources' },
  ];

  const toggleSubmenu = (name: string) => {
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-sm'
    }`}>
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              EduSmart360
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <motion.div
                  className="flex items-center px-4 py-3 cursor-pointer"
                  variants={navItemVariants}
                  whileHover="hover"
                  onClick={() => item.submenu && toggleSubmenu(item.name)}
                >
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium flex items-center"
                  >
                    {item.name}
                    {item.submenu && (
                      <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                        activeSubmenu === item.name ? 'rotate-180' : ''
                      }`} />
                    )}
                  </a>
                </motion.div>
                
                {item.submenu && (
                  <motion.div 
                    className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-2xl p-2 z-50"
                    initial="hidden"
                    animate={activeSubmenu === item.name ? 'visible' : 'hidden'}
                    variants={{
                      hidden: { opacity: 0, y: 10, pointerEvents: 'none' },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        pointerEvents: 'auto',
                        transition: { type: 'spring', damping: 25, stiffness: 300 }
                      }
                    }}
                  >
                    {item.submenu.map((subItem) => (
                      <a
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
                      >
                        {subItem.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
            
            <div className="ml-4 flex items-center space-x-3">
              {isAuthenticated ? (
                <a 
                  href="/admin/dashboard"
                  className="px-5 py-2.5 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Dashboard
                </a>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="px-5 py-2.5 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Log in
                </button>
              )}
              <motion.button 
                onClick={() => setShowModal(true)}
                className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden group"
                whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}
              >
                <span className="relative z-10 font-semibold">Request Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="lg:hidden mt-4 pb-6 border-t border-gray-100 bg-white/95 backdrop-blur-md"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
            >
              <div className="flex flex-col space-y-1 pt-4">
                {navItems.map((item) => (
                  <div key={item.name} className="border-b border-gray-100 last:border-0">
                    <div 
                      className="flex items-center justify-between px-6 py-4 text-gray-700 font-medium cursor-pointer"
                      onClick={() => item.submenu && toggleSubmenu(item.name)}
                    >
                      <a 
                        href={item.href} 
                        className="flex-1"
                        onClick={() => !item.submenu && setIsMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                      {item.submenu && (
                        <motion.span
                          animate={{ rotate: activeSubmenu === item.name ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.span>
                      )}
                    </div>
                    
                    {item.submenu && activeSubmenu === item.name && (
                      <motion.div 
                        className="pl-6 pr-2 pb-2 space-y-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-2 px-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
                
                <div className="px-6 pt-4 space-y-3">
                  {isAuthenticated ? (
                    <a 
                      href="/admin/dashboard"
                      className="block w-full text-center px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                  ) : (
                    <button 
                      className="w-full text-center px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLoginClick();
                      }}
                    >
                      Log in
                    </button>
                  )}
                  <motion.button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                    whileTap={{ scale: 0.98 }}
                  >
                    Request Demo
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <RequestDemoModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </header>
  );
};

export default Header;