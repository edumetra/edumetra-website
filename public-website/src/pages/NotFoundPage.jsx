import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowRight, Search, BookOpen, GraduationCap, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  const quickLinks = [
    { label: 'Find Colleges', to: '/find-colleges', icon: Search, desc: 'Search for your dream college' },
    { label: 'Explore Courses', to: '/', icon: BookOpen, desc: 'Browse our extensive course catalog' },
    { label: 'Go Home', to: '/', icon: Home, desc: 'Back to the Edumetra homepage' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-white to-gray-50">
      <Helmet>
        <title>404 - Page Not Found | Edumetra</title>
        <meta name="description" content="The page you are looking for does not exist. Explore our colleges and courses on Edumetra." />
      </Helmet>

      <div className="max-w-4xl w-full">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <div className="relative">
              <span className="text-[12rem] md:text-[15rem] font-black text-gray-100 leading-none select-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100"
                >
                  <GraduationCap className="w-16 h-16 text-blue-600" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mt-8 mb-4"
          >
            Oops! Page Not Found
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-lg max-w-lg mx-auto"
          >
            It looks like the path you're trying to reach doesn't exist. Let's get you back on track to finding your future.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {quickLinks.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              className="group p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <link.icon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {link.label}
              </h3>
              <p className="text-sm text-gray-500">
                {link.desc}
              </p>
              <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                Visit <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <p className="text-gray-400 text-sm">
            Need help? <Link to="/contact" className="text-blue-600 hover:underline font-medium">Contact Support</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
