import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Star, Send, CheckCircle, Upload, Award } from 'lucide-react';

const WriteReviewPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'student',
        college: '',
        course: '',
        rating: 5,
        title: '',
        review: '',
        wouldRecommend: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Review submitted:', formData);
        setIsSubmitting(false);
        setIsSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                role: 'student',
                college: '',
                course: '',
                rating: 5,
                title: '',
                review: '',
                wouldRecommend: true
            });
        }, 3000);
    };

    const benefits = [
        {
            icon: Award,
            title: 'Help Others',
            description: 'Your review helps future students make informed decisions'
        },
        {
            icon: CheckCircle,
            title: 'Get Verified',
            description: 'All reviews are verified and published with your consent'
        },
        {
            icon: Star,
            title: 'Build Trust',
            description: 'Contribute to our community of successful students'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Write a Review - CollegePredictor | Share Your Experience</title>
                <meta name="description" content="Share your experience with CollegePredictor counseling services. Help other students and parents make informed decisions about their medical education journey." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="container-custom relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
                            <Star className="w-5 h-5 text-red-400 fill-red-400" />
                            <span className="text-red-300 text-sm font-semibold">Share Your Experience</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Write a <span className="gradient-text">Review</span>
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
                            Your feedback helps us improve and guides future students in making the right choice
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section-padding bg-slate-50">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-8"
                            >
                                {isSubmitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-red-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                            Thank You for Your Review!
                                        </h3>
                                        <p className="text-slate-600 mb-6">
                                            Your review has been submitted successfully and will be published after verification.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                            Share Your Experience
                                        </h2>

                                        {/* Personal Information */}
                                        <div className="space-y-4 mb-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Your Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                        placeholder="your.email@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                        placeholder="+91 98765 43210"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        You are a *
                                                    </label>
                                                    <select
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="parent">Parent</option>
                                                        <option value="alumni">Alumni</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        College/University
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="college"
                                                        value={formData.college}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                        placeholder="e.g., AIIMS Delhi"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Course
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="course"
                                                        value={formData.course}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                        placeholder="e.g., MBBS"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                Overall Rating *
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => handleRatingClick(star)}
                                                        onMouseEnter={() => setHoveredRating(star)}
                                                        onMouseLeave={() => setHoveredRating(0)}
                                                        className="transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`w-10 h-10 ${star <= (hoveredRating || formData.rating)
                                                                ? 'text-red-400 fill-red-400'
                                                                : 'text-slate-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                                <span className="ml-3 text-lg font-semibold text-slate-900">
                                                    {formData.rating} / 5
                                                </span>
                                            </div>
                                        </div>

                                        {/* Review Title */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Review Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Summarize your experience in one line"
                                            />
                                        </div>

                                        {/* Review Text */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Your Review *
                                            </label>
                                            <textarea
                                                name="review"
                                                value={formData.review}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                                placeholder="Share your detailed experience with our counseling service..."
                                            />
                                            <p className="text-sm text-slate-500 mt-2">
                                                Minimum 50 characters ({formData.review.length}/50)
                                            </p>
                                        </div>

                                        {/* Would Recommend */}
                                        <div className="mb-6">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="wouldRecommend"
                                                    checked={formData.wouldRecommend}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                                />
                                                <span className="text-slate-700">
                                                    I would recommend CollegePredictor to others
                                                </span>
                                            </label>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || formData.review.length < 50}
                                            className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Submit Review
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Why Write a Review */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card p-6"
                            >
                                <h3 className="text-xl font-bold text-slate-900 mb-6">
                                    Why Write a Review?
                                </h3>
                                <div className="space-y-4">
                                    {benefits.map((benefit, index) => {
                                        const Icon = benefit.icon;
                                        return (
                                            <div key={index} className="flex gap-3">
                                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 mb-1">
                                                        {benefit.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-600">
                                                        {benefit.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Guidelines */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-red-100 border border-red-300 rounded-xl p-6"
                            >
                                <h3 className="text-lg font-bold text-slate-900 mb-4">
                                    Review Guidelines
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-700">
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        Be honest and constructive
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        Share specific details about your experience
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        Keep it respectful and professional
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        Avoid personal or sensitive information
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Privacy Notice */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-red-50 border border-red-200 rounded-xl p-6"
                            >
                                <h3 className="text-lg font-bold text-slate-900 mb-3">
                                    Privacy Notice
                                </h3>
                                <p className="text-sm text-slate-700">
                                    Your email and phone will not be published publicly.
                                    We'll only use them for verification purposes. Your review
                                    will be published with your name and designation only.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default WriteReviewPage;
