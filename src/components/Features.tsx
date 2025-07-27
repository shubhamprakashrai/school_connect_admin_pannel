import React from 'react';
import { 
  Users, 
  Clock, 
  BookOpen, 
  CreditCard, 
  Bell, 
  BarChart3, 
  Calendar,
  Shield
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Role-Based Access',
      description: 'Separate dashboards for Admin, Teacher, Student, and Parent with customized permissions and features.',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Real-Time Attendance',
      description: 'Track student attendance instantly with automated notifications to parents and detailed reports.',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Homework & Exam Management',
      description: 'Assign homework, create exams, and manage submissions with automatic grading capabilities.',
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Fee & Payment Tracking',
      description: 'Streamline fee collection with online payments, automated reminders, and detailed financial reports.',
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'In-App Notifications',
      description: 'Keep everyone informed with instant notifications, announcements, and messaging system.',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Reports & Analytics',
      description: 'Generate comprehensive report cards, performance analytics, and institutional insights.',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Event & Holiday Calendar',
      description: 'Manage school events, holidays, and important dates with synchronized calendar system.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Data Security',
      description: 'Enterprise-grade security with encrypted data storage and GDPR compliance.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Manage Your School
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From attendance tracking to parent communication, EduSmart360 provides all the tools 
            modern educational institutions need in one comprehensive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
            >
              <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;