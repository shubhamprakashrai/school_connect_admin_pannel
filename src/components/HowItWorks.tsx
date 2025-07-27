import React from 'react';
import { ArrowRight, Calendar, Settings, Rocket } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: <Calendar className="w-8 h-8" />,
      title: 'Request a Demo',
      description: 'Schedule a personalized demonstration of EduSmart360 tailored to your school\'s specific needs and requirements.',
    },
    {
      number: '02',
      icon: <Settings className="w-8 h-8" />,
      title: 'Get Personalized Setup',
      description: 'Our team will customize your school panel with your branding, user roles, and specific configurations.',
    },
    {
      number: '03',
      icon: <Rocket className="w-8 h-8" />,
      title: 'Start Managing with Ease',
      description: 'Begin streamlining your school operations immediately with comprehensive training and ongoing support.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Get Started in Three Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your school management experience with our streamlined onboarding process. 
            We'll have you up and running in no time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center group">
                {/* Step Number */}
                <div className="text-blue-600 text-6xl font-bold opacity-20 absolute top-4 right-4">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="text-blue-600 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-blue-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your School?</h3>
            <p className="text-blue-100 mb-6">
              Join hundreds of educational institutions already using EduSmart360 to streamline their operations.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 font-semibold">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;