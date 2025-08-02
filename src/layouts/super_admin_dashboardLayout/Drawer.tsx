import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, School, Users, Settings, LogOut } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ onClose, onLogout }) => {
  const menuItems = [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Add School', 
      path: '/dashboard' 
    },
    { 
      icon: <School className="w-5 h-5" />, 
      label: 'Schools', 
      path: '/dashboard/schools' 
    },
    { 
      icon: <Users className="w-5 h-5" />, 
      label: 'Users', 
      path: '/dashboard/users' 
    },
    { 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings', 
      path: '/dashboard/settings' 
    },
  ];

  return (
    <div 
      className={`h-full bg-white shadow-lg`}
      style={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">School Connect</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                  onClick={onClose}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
