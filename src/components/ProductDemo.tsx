import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { useDemo } from '../contexts/DemoContext';

const ProductDemo = () => {
  const { isDemoRequested, selectedDemo, requestDemo, closeDemo } = useDemo();
  interface FormData {
    name: string;
    email: string;
    phone: string;
    message: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleDemoClick = (demoName: string) => {
    requestDemo(demoName);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', { ...formData, demo: selectedDemo });
    // Reset form and close modal
    setFormData({ name: '', email: '', phone: '', message: '' });
    closeDemo();
    alert('Thank you for your interest! We will contact you soon.');
  };

  return (
    <section id="product-demo" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Experience EduSmart360 Across All Devices
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access your school management system from anywhere, on any device. 
            Our responsive design ensures a seamless experience for all users.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Desktop Demo */}
          <div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => handleDemoClick('Desktop Dashboard')}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6" />
                <span className="font-semibold">Web Dashboard</span>
              </div>
            </div>
            <div className="p-6">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Admin Dashboard</p>
                  <p className="text-gray-400 text-sm">Complete school overview</p>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Desktop Experience</h3>
              <p className="text-gray-600 text-sm">Full-featured administrative interface with comprehensive analytics and management tools.</p>
            </div>
          </div>

          {/* Tablet Demo */}
          <div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => handleDemoClick('Teacher Portal')}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
              <div className="flex items-center gap-3">
                <Tablet className="w-6 h-6" />
                <span className="font-semibold">Teacher Portal</span>
              </div>
            </div>
            <div className="p-6">
              <div className="h-48 bg-gradient-to-br from-green-50 to-gray-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Tablet className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Teacher Interface</p>
                  <p className="text-gray-400 text-sm">Classroom management made easy</p>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tablet Optimized</h3>
              <p className="text-gray-600 text-sm">Perfect for teachers to manage classes, assignments, and student interactions on the go.</p>
            </div>
          </div>

          {/* Mobile Demo */}
          <div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => handleDemoClick('Parent App')}
          >
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6" />
                <span className="font-semibold">Parent App</span>
              </div>
            </div>
            <div className="p-6">
              <div className="h-48 bg-gradient-to-br from-purple-50 to-gray-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Parent Dashboard</p>
                  <p className="text-gray-400 text-sm">Stay connected with your child</p>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-gray-600 text-sm">Parents can easily track attendance, homework, and communicate with teachers anywhere.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Request Modal */}
      {isDemoRequested && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md relative">
            <button
              onClick={closeDemo}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request {selectedDemo} Demo</h3>
              <p className="text-gray-600 mb-6">Fill out the form below and our team will get in touch with you shortly.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us more about your needs..."
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Request Demo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDemo;