import React, { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import RequestDemoModal from './RequestDemoModal';

const Hero = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            All-in-One School Management System for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Modern Institutions
            </span>
          </h1>

          {/* Subheadline */}
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 font-light leading-relaxed">
            Simplify student, teacher, and parent communication and administration in one platform.
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-lg flex items-center gap-2 group shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Request a Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              // onClick={() => setIsDemoModalOpen(true)}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 font-semibold text-lg flex items-center gap-2 group"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
            
            <RequestDemoModal 
              isOpen={isDemoModalOpen} 
              onClose={() => setIsDemoModalOpen(false)} 
            />
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-gray-500 mb-4">Trusted by 500+ Educational Institutions</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-gray-400 font-semibold">Green Valley School</div>
              <div className="text-gray-400 font-semibold">Sunrise Academy</div>
              <div className="text-gray-400 font-semibold">Future Leaders Institute</div>
              <div className="text-gray-400 font-semibold">Modern Education Hub</div>
            </div>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="mt-16 relative">
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl p-8 shadow-2xl max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 md:h-96 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">E360</span>
                  </div>
                  <p className="text-gray-600 text-lg">Dashboard Preview</p>
                  <p className="text-gray-400 text-sm mt-2">Comprehensive school management interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;