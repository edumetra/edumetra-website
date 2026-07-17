import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../services/supabaseClient';
import { CheckCircle2, Shield, Zap, User, Mail, Phone, ArrowRight, Lock } from 'lucide-react';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      pushLeadToTeleCRM(
        { 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone 
        }, 
        ['Connect Landing Page']
      );

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Exclusive Offer | Connect With Us</title>
        <meta name="description" content="Connect with us for exclusive access and premium benefits." />
      </Helmet>

      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10 items-center">
        
        {/* Left Side: Value Proposition */}
        <div className="flex flex-col space-y-8">
          <div>
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
        </div>

        {/* Right Side: Form Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 animate-slide-in-right">
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
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-700 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner"
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
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-700 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner"
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
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-700 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner"
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
                  className="btn btn-primary w-full group py-3.5 mt-2 text-lg"
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
    </div>
  );
};

export default ConnectPage;
