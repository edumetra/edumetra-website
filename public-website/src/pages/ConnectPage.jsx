import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../services/supabaseClient';
import { CheckCircle2, Shield, Zap, User, Mail, Phone, ArrowRight, Lock, Star, Quote, Globe, Building, Stethoscope, Award, Navigation } from 'lucide-react';
import { pushLeadToTeleCRM } from '../services/telecrm';

const ConnectPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const isSubmitting = React.useRef(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('marketing_leads')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            source: 'Ads Landing Page'
          }
        ]);

      if (submitError) throw submitError;

      // Track lead in TeleCRM
      await pushLeadToTeleCRM(
        { 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone 
        }, 
        ['Connect Landing Page']
      );

      // Track lead in Facebook and Google
      if (typeof window !== 'undefined') {
        if (window.fbq) {
          window.fbq('track', 'Lead');
        }
        if (window.gtag) {
          window.gtag('event', 'generate_lead', {
            event_category: 'Lead',
            event_label: 'Connect Landing Page',
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Something went wrong. Please try again.');
      isSubmitting.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Exclusive Offer | Connect With Us</title>
        <meta name="description" content="Connect with us for exclusive access and premium benefits." />
      </Helmet>

      {/* Header with Logo and Tabs */}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-8 z-50 flex items-center justify-between animate-fade-in bg-slate-950/80 backdrop-blur-md border-b border-slate-800 lg:border-none lg:bg-transparent lg:backdrop-blur-none">
        <Link to="/">
          <img src="/logo-final.jpg" alt="Edumetra Logo" className="h-8 sm:h-10 w-auto object-contain rounded hover:opacity-80 transition-opacity" />
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/find-colleges" className="hover:text-white transition-colors">Find Colleges</Link>
          <Link to="/universities" className="hover:text-white transition-colors">Universities</Link>
          <Link to="/exams" className="hover:text-white transition-colors">Exams</Link>
          <Link to="/mbbs-abroad" className="hover:text-white transition-colors">MBBS Abroad</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col items-center">
        
        {/* Mobile Headline (Only visible on mobile, placed above the form) */}
        <div className="lg:hidden w-full text-center mb-8 animate-fade-in mt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            Limited Time Opportunity
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
            Unlock Your <span className="gradient-text">Premium</span> Future.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed px-2">
            Join thousands of successful students who have transformed their careers.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Side: Value Proposition (On mobile, this goes BELOW the form) */}
          <div className="flex flex-col space-y-8 order-2 lg:order-1">
            <div className="hidden lg:block">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-6 animate-fade-in">
                <Zap className="w-4 h-4" />
                Limited Time Opportunity
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Unlock Your <span className="gradient-text">Premium</span> Future Today.
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-lg">
                Join thousands of successful students who have already transformed their careers. Get exclusive guidance, premium resources, and direct support.
              </p>
            </div>

          <div className="space-y-5">
            {[
              "Personalized 1-on-1 expert counselling",
              "Access to premium cutoff data and insights",
              "Priority support and application assistance"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-300 animate-slide-in-left" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <CheckCircle2 className="w-4 h-4 text-red-400" />
                </div>
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center gap-4 text-slate-500 text-sm border-t border-slate-800">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
            <p>Trusted by <strong className="text-slate-300 font-bold">10,000+</strong> students worldwide</p>
          </div>

          {/* Testimonials */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-in-left" style={{ animationDelay: '400ms' }}>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative">
              <Quote className="w-8 h-8 text-slate-800 absolute top-2 right-2 opacity-50" />
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />)}
              </div>
              <p className="text-sm text-slate-300 italic mb-3">"Thanks to their expert counselling, I secured a seat in my dream medical college!"</p>
              <div className="text-xs font-semibold text-slate-400">- Riya S., Student</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative">
              <Quote className="w-8 h-8 text-slate-800 absolute top-2 right-2 opacity-50" />
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />)}
              </div>
              <p className="text-sm text-slate-300 italic mb-3">"The premium data and insights were completely game-changing for my admission process."</p>
              <div className="text-xs font-semibold text-slate-400">- Vikram M., Aspirant</div>
            </div>
          </div>
        </div>

          {/* Right Side: Form Card (On mobile, this goes FIRST) */}
          <div className="w-full max-w-md mx-auto lg:mx-0 animate-slide-in-right order-1 lg:order-2">
            <div className="card card-premium shadow-2xl relative overflow-hidden">
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-80" />
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Claim Your Spot</h2>
              <p className="text-slate-400 text-sm">Fill your details to get instant access</p>
            </div>

            {success ? (
              <div className="text-center py-8 animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/30">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">You're All Set!</h3>
                <p className="text-slate-400 mb-6">
                  Your details have been securely received. We are redirecting you now...
                </p>
                <div className="spinner border-green-500 mx-auto"></div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      autoCapitalize="words"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 sm:py-3.5 border border-slate-700 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner text-base"
                      placeholder="Rahul Sharma"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 sm:py-3.5 border border-slate-700 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner text-base"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="numeric"
                      pattern="[0-9+ -]*"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 sm:py-3.5 border border-slate-700 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner text-base"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full group py-4 mt-2 text-lg font-bold shadow-lg shadow-red-500/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="spinner w-5 h-5 border-white"></div> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Connect Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-4">
                  <Lock className="w-3.5 h-3.5" />
                  Your information is 100% secure and encrypted
                </p>
              </form>
            )}
          </div>
          </div>
        </div>

        {/* SEO Content Section - Premium Redesign */}
        <div className="w-full mt-24 lg:mt-32 space-y-12 animate-fade-in relative z-10 text-left">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
              NEET UG Counselling 2026: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Complete Guidance</span>
            </h2>
            <p className="text-lg text-slate-400">
              For <strong className="text-white">MBBS Admission</strong>, <strong className="text-white">MBBS Abroad</strong>, <strong className="text-white">Top Medical Colleges</strong>, <strong className="text-white">BDS & AYUSH Admissions</strong>
            </p>
          </div>

          {/* Intro Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl shadow-slate-900/50">
            <p className="text-slate-300 leading-relaxed mb-4 text-lg">
              If you have qualified <strong className="text-white">NEET UG 2026</strong>, choosing the right college and counselling strategy is just as important as your exam score. Every year, thousands of students miss good admission opportunities because of incorrect choice filling, lack of information, or delayed counselling registration.
            </p>
            <p className="text-slate-400 leading-relaxed">
              At <strong className="text-white">Edumetra Global</strong>, we provide expert <strong className="text-white">NEET UG Counselling</strong> and personalized <strong className="text-white">Counselling Guidance</strong> to help students secure admission in the best medical colleges in India and abroad.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-red-500/50 transition-colors group">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition-colors">
                <Navigation className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Counselling Made Simple</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> MCC (All India Quota) Counselling</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> State Counselling Registration</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> College Prediction based on NEET Rank</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> Choice Filling & Locking Strategy</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> Seat Allotment Guidance</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Building className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">MBBS Admission in India</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> Government Medical Colleges</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> Private Medical Colleges</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> Deemed Universities</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> State Quota & All India Quota Seats</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3"><strong className="text-white">MBBS Abroad</strong></h3>
              <p className="text-slate-400 text-sm mb-4">Internationally recognized universities with affordable fees and strong clinical exposure.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300 border border-slate-700 font-medium"><strong className="text-slate-200">MBBS in Nepal</strong></span>
                <span className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300 border border-slate-700 font-medium"><strong className="text-slate-200">MBBS in Russia</strong></span>
                <span className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300 border border-slate-700">Uzbekistan</span>
                <span className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300 border border-slate-700">Kazakhstan</span>
              </div>
            </div>

          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            
            <div className="space-y-6">
              <div className="flex gap-4 bg-slate-900/30 p-5 rounded-xl border border-slate-800/50">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Stethoscope className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">BDS, BAMS, BHMS & BUMS</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Interested in dentistry or AYUSH courses? We provide complete guidance for <strong className="text-slate-300">BDS Admission</strong> and <strong className="text-slate-300">BAMS Admission</strong>, <strong className="text-slate-300">BHMS Admission</strong> & <strong className="text-slate-300">BUMS Admission</strong> in top government and private colleges across India based on your NEET score.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 bg-slate-900/30 p-5 rounded-xl border border-slate-800/50">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Top Medical Colleges</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Selecting from the <strong className="text-slate-300">Top Medical Colleges</strong> requires evaluating previous cut-offs, fees, hospital exposure, and infrastructure. We help you compare and make informed decisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
              <h3 className="text-xl font-bold text-white mb-4">Why Choose Edumetra Global?</h3>
              <ul className="space-y-3">
                {[
                  "Expert NEET UG Counselling Team",
                  "Personalized Counselling Guidance",
                  "College Prediction Based on Your NEET Score",
                  "Guidance for MBBS, BDS & AYUSH Admissions",
                  "Support for MBBS Abroad (Nepal, Russia & more)",
                  "End-to-End Admission Support"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
          </div>

          {/* Call to action text */}
          <div className="mt-12 text-center bg-slate-900/30 border border-slate-800/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Medical Journey with Confidence</h3>
            <p className="text-slate-400 max-w-4xl mx-auto leading-relaxed mb-6">
              Your NEET rank is only the beginning. The right guidance can help you secure admission to one of the <strong className="text-slate-300">Top Medical Colleges</strong> in India or pursue <strong className="text-slate-300">MBBS Abroad</strong> at a reputed international university. Whether your goal is <strong className="text-slate-300">MBBS Admission</strong>, <strong className="text-slate-300">BDS Admission</strong>, <strong className="text-slate-300">BAMS/BHMS/BUMS Admission</strong>, <strong className="text-slate-300">MBBS in Nepal</strong>, or <strong className="text-slate-300">MBBS in Russia</strong>, Edumetra Global is committed to helping you make informed decisions.
            </p>
            <p className="font-bold text-white text-lg mb-8">
              Book your FREE counselling session today and take the first step!
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn btn-primary group py-3 px-8 text-base font-bold shadow-lg shadow-red-500/20 inline-flex items-center justify-center gap-2"
            >
              Fill the Form Now
              <ArrowRight className="w-5 h-5 group-hover:-rotate-90 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
