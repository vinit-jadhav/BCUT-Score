import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/a.json';
import btc from '../assets/btc.json';
import rocket from '../assets/rocket.json';

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);

  // Configure intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.dataset.section));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Animation classes helper
  const getAnimationClass = (section) => {
    return visibleSections.has(section) ? 'animate-fade-in-up' : 'opacity-0';
  };

  return (
    <div className="dark:bg-gray-900 transition-colors duration-300">
      {/* Main Section */}
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 dark:text-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 p-6 max-w-7xl mx-auto">
          {/* Lottie Animation */}
          <div 
            ref={el => sectionRefs.current[0] = el}
            data-section="main-animation"
            className={`w-full max-w-md lg:max-w-xl transition-all duration-700 ${getAnimationClass('main-animation')}`}
          >
            <Lottie animationData={animationData} loop={true} autoplay={true} />
          </div>

          {/* Text Section */}
          <div 
            ref={el => sectionRefs.current[1] = el}
            data-section="main-text"
            className={`text-center md:text-left space-y-6 transition-all duration-700 ${getAnimationClass('main-text')}`}
          >
            <h1 className="text-3xl md:text-3xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Decentralize. <span>Empower</span>. Prosper.
            </h1>
            <p className="text-lg md:text-lg text-gray-300 leading-relaxed max-w-2xl">
              BCUT Score is your trusted DeFi platform, redefining finance through blockchain technology.
              Take control of your financial future today.
            </p>
            <button className="px-4 py-3 text-white font-semibold rounded-xl shadow-lg 
                  bg-gradient-to-r from-blue-600 to-purple-600 
                  hover:bg-gradient-to-br hover:from-blue-700 hover:to-purple-700 
                  transform transition-all duration-300 
                  hover:scale-105 hover:shadow-2xl 
                  active:scale-95 focus:ring-4 focus:ring-blue-300/50">
  Explore DeFi 
</button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div 
            ref={el => sectionRefs.current[2] = el}
            data-section="features-title"
            className={`text-center mb-16 transition-all duration-700 ${getAnimationClass('features-title')}`}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Welcome to BCUT Score
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Card */}
            <div 
              ref={el => sectionRefs.current[3] = el}
              data-section="features-left"
              className={`p-8 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 ${getAnimationClass('features-left')}`}
            >
              <h3 className="text-2xl font-semibold mb-6 text-blue-600 dark:text-blue-400">
                Why Choose BCUT Score?
              </h3>
              <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                {[
                  'Full Transparency: Public ledger accountability',
                  'Military-grade Security Protocols',
                  'Unleash Api for Score the Portfolio , DeFi and Token',
                  'Real-Time Score'
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 animate-fade-in">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                    <span className="text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Center Animation */}
            <div 
              ref={el => sectionRefs.current[4] = el}
              data-section="features-center"
              className={`flex items-center justify-center ${getAnimationClass('features-center')}`}
            >
              <div className="w-full max-w-sm transform hover:scale-105 transition-transform">
                <Lottie animationData={btc} loop={true} autoplay={true} />
              </div>
            </div>

            {/* Right Card */}
            <div 
              ref={el => sectionRefs.current[5] = el}
              data-section="features-right"
              className={`p-8 bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 ${getAnimationClass('features-right')}`}
            >
              <h3 className="text-2xl font-semibold mb-6 text-blue-600 dark:text-blue-400">
                Our Value Proposition
              </h3>
              <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                {[
                  'Automated Portfolio Management',
                  'Real-time Market Analytics',
                  'Token Prediction',
                  'ETH , POL , AVAX , LINEA Chain Score Available'
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 animate-fade-in">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                    <span className="text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div 
            ref={el => sectionRefs.current[6] = el}
            data-section="services-title"
            className={`text-center mb-16 ${getAnimationClass('services-title')}`}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Our  Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Portfolio Tracker',
                content: 'Real-time multi-chain portfolio monitoring with institutional-grade analytics',
                animation: rocket
              },
              {
                title: 'Token Score',
                content: 'AI-powered token valuation models with risk assessment algorithms',
                animation: btc
              },
              {
                title: 'Pool Score',
                content: 'Smart liquidity pool analysis with impermanent loss protection metrics',
                animation: animationData
              }
            ].map((service, index) => (
              <div 
                key={index}
                ref={el => sectionRefs.current[7 + index] = el}
                data-section={`service-${index}`}
                className={`p-8 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group ${getAnimationClass(`service-${index}`)}`}
              >
            
                <h3 className="text-2xl font-semibold mb-4 text-center text-blue-600 dark:text-blue-400">
                  {service.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                  {service.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Home;