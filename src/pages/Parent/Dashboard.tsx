import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Calendar, Clock, 
  Bell, FileText, CreditCard, MessageSquare,
  User, Users, Menu, X, LogOut, ChevronDown, CheckCircle2, BarChart2
} from 'lucide-react';

// Types
type Child = {
  id: string;
  name: string;
  grade: string;
  avatar: string;
};

type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  percentage: number;
};

interface ParentDashboardProps {
  onLogout: () => void;
}

const ParentDashboard = ({ onLogout }: ParentDashboardProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState('child1');
  
  // Sample data
  const children: Child[] = [
    { id: 'child1', name: 'Emma Wilson', grade: 'Grade 5A', avatar: '👧' },
    { id: 'child2', name: 'Noah Wilson', grade: 'Grade 3B', avatar: '👦' },
  ];

  const attendanceSummary: AttendanceSummary = {
    present: 45,
    absent: 3,
    late: 2,
    percentage: 90
  };

  const upcomingExams = [
    { id: '1', subject: 'Mathematics', date: '2023-11-15' },
    { id: '2', subject: 'Science', date: '2023-11-17' },
  ];

  const recentHomeworks = [
    { id: '1', subject: 'Mathematics', title: 'Algebra Exercises', dueDate: '2023-11-10', status: 'submitted' },
    { id: '2', subject: 'Science', title: 'Solar System Project', dueDate: '2023-11-12', status: 'pending' },
  ];

  const currentChild = children.find(child => child.id === selectedChild) || children[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-bold text-lg">Parent Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-0 z-40 w-64 bg-white border-r`}>
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">EduSmart360</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <nav className="p-4 space-y-1">
            <a href="#" className="flex items-center p-2 text-blue-600 bg-blue-50 rounded-lg">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </a>
            <a href="#attendance" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <CheckCircle2 className="mr-3 h-5 w-5" />
              Attendance
            </a>
            <a href="#homework" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <BookOpen className="mr-3 h-5 w-5" />
              Homework
            </a>
            <a href="#exams" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <FileText className="mr-3 h-5 w-5" />
              Exams
            </a>
            <a href="#reports" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <BarChart2 className="mr-3 h-5 w-5" />
              Report Cards
            </a>
            <a href="#fees" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <CreditCard className="mr-3 h-5 w-5" />
              Fee Payments
            </a>
            <a href="#messages" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <MessageSquare className="mr-3 h-5 w-5" />
              Messages
            </a>
          </nav>
          
          <div className="absolute bottom-0 w-full p-4 border-t">
            <button 
              onClick={onLogout}
              className="flex items-center w-full p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Desktop header */}
          <header className="hidden lg:flex justify-between items-center p-6 bg-white border-b">
            <h1 className="text-2xl font-bold">Parent Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-xl">{currentChild.avatar}</span>
                  <div className="text-left">
                    <div className="font-medium">{currentChild.name}</div>
                    <div className="text-xs text-gray-500">{currentChild.grade}</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </header>

          {/* Dashboard content */}
          <main className="p-6">
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Welcome back, Sarah!</h2>
              <p className="text-gray-600">Here's what's happening with {currentChild.name.split(' ')[0]}'s education.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Attendance */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">ATTENDANCE</h3>
                  <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{attendanceSummary.percentage}%</p>
                  <p className="text-sm text-gray-500">{attendanceSummary.present} of {attendanceSummary.present + attendanceSummary.absent} days</p>
                </div>
              </div>

              {/* Homework */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">HOMEWORK</h3>
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentHomeworks.length} Assignments</p>
                  <p className="text-sm text-gray-500">
                    {recentHomeworks.filter(h => h.status === 'pending').length} pending
                  </p>
                </div>
              </div>

              {/* Exams */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">UPCOMING EXAMS</h3>
                  <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingExams.length} Exams</p>
                  <p className="text-sm text-gray-500">
                    Next: {upcomingExams[0]?.subject || 'None'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <button className="text-sm text-blue-600 hover:underline">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentHomeworks.slice(0, 3).map(hw => (
                  <div key={hw.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">{hw.subject}: {hw.title}</h4>
                      <p className="text-sm text-gray-500">Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                        hw.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {hw.status === 'submitted' ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
