import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small schools and institutions',
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: [
        'Up to 100 students',
        'Basic attendance tracking',
        'Homework management',
        'Parent communication',
        'Basic reports',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      description: 'Ideal for growing educational institutions',
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: [
        'Up to 500 students',
        'Advanced attendance tracking',
        'Exam management',
        'Fee tracking & payments',
        'Advanced reports & analytics',
        'SMS notifications',
        'Priority phone support',
        'Multi-branch support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'For large institutions with complex needs',
      monthlyPrice: 199,
      yearlyPrice: 159,
      features: [
        'Unlimited students',
        'All Professional features',
        'Custom integrations',
        'Advanced security features',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom training sessions',
        'White-label options',
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your institution. All plans include a 7-day free trial 
            with no setup fees or long-term commitments.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${!isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                isYearly ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                  isYearly ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`font-medium ${isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
              Yearly
              <span className="text-sm text-green-600 ml-2">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                plan.popular ? 'border-2 border-blue-600 transform scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  <Star className="w-4 h-4 inline mr-1" />
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-600 ml-2">per month</span>
                  {isYearly && (
                    <div className="text-sm text-green-600 mt-1">
                      Billed annually (${plan.yearlyPrice * 12}/year)
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Start 7-Day Free Trial
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include a 7-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;