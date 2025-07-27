import React from 'react';
import { Target, Users, Award, Heart } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Constantly evolving our platform with cutting-edge educational technology.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'Building stronger connections between schools, students, and families.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality educational management solutions.',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Support',
      description: 'Providing exceptional customer service and ongoing support to our partners.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              About EduSmart360
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We are a team of passionate ed-tech developers committed to transforming school management. 
              Our mission is to bridge the gap between technology and education, making administrative 
              tasks simpler and more efficient for educational institutions worldwide.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Founded in 2020, EduSmart360 has grown from a small startup to a trusted partner for 
              over 500 educational institutions. Our comprehensive platform combines years of 
              educational expertise with modern technology to deliver solutions that truly make a difference.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">5+</div>
                <div className="text-gray-600 text-sm">Years Experience</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">500+</div>
                <div className="text-gray-600 text-sm">Schools Served</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">50K+</div>
                <div className="text-gray-600 text-sm">Happy Users</div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className="text-blue-600 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Leadership Team</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                alt="CEO"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                loading="lazy"
              />
              <h4 className="font-semibold text-gray-900">David Kim</h4>
              <p className="text-blue-600 text-sm">CEO & Founder</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                alt="CTO"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                loading="lazy"
              />
              <h4 className="font-semibold text-gray-900">Maria Garcia</h4>
              <p className="text-blue-600 text-sm">CTO</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                alt="Head of Education"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                loading="lazy"
              />
              <h4 className="font-semibold text-gray-900">Robert Chen</h4>
              <p className="text-blue-600 text-sm">Head of Education</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;