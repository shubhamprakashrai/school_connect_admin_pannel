import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How secure is student data in EduSmart360?',
      answer: 'We take data security extremely seriously. EduSmart360 uses enterprise-grade encryption, secure data centers, and complies with GDPR and other privacy regulations. All data is encrypted both in transit and at rest, and we conduct regular security audits to ensure your information remains protected.',
    },
    {
      question: 'Can we add multiple school branches to our account?',
      answer: 'Yes! Our Professional and Enterprise plans support multi-branch management. You can manage multiple campuses or branches from a single dashboard while maintaining separate data and user access for each location. This feature is perfect for school groups and educational chains.',
    },
    {
      question: 'Is parent access limited to mobile devices only?',
      answer: 'Not at all! While we have a dedicated mobile app for parents, they can also access their dashboard through any web browser on desktop, tablet, or mobile devices. Our responsive design ensures a seamless experience across all platforms.',
    },
    {
      question: 'Can teachers assign homework from their mobile devices?',
      answer: 'Absolutely! Teachers can assign homework, upload materials, grade assignments, and communicate with students and parents directly from their mobile devices. Our mobile-first design ensures all core features are available on smartphones and tablets.',
    },
    {
      question: 'What kind of support do you provide during implementation?',
      answer: 'We provide comprehensive onboarding support including data migration assistance, staff training sessions, and dedicated customer success managers for Enterprise clients. Our support team is available via email, phone, and chat to help you every step of the way.',
    },
    {
      question: 'Can we integrate EduSmart360 with our existing systems?',
      answer: 'Yes, we offer API integrations and can work with your existing systems. Our Enterprise plan includes custom integrations, and we can connect with popular educational tools, payment gateways, and student information systems you may already be using.',
    },
    {
      question: 'What happens if we need to cancel our subscription?',
      answer: 'You can cancel your subscription at any time with no penalties. We provide data export tools so you can download all your information before cancellation. We also offer a 30-day grace period to help with the transition if needed.',
    },
    {
      question: 'Is there a mobile app for students?',
      answer: 'Yes! We have dedicated mobile apps for students, teachers, and parents available on both iOS and Android. Students can view assignments, check grades, communicate with teachers, and access learning materials directly from their smartphones.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about EduSmart360. Can't find what you're looking for? 
            Contact our support team for personalized assistance.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <Minus className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  )}
                </button>
                
                {openIndex === index && (
                  <div className="px-8 pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you understand how EduSmart360 can work for your institution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold">
                Contact Support
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 font-semibold">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;