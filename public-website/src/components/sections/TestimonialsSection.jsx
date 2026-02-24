import React from 'react';
import TestimonialCard from '../../shared/ui/TestimonialCard';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: 'Rahul Sharma',
            role: 'Engineering Student, IIT Delhi',
            rating: 5,
            quote: 'CollegePredictor helped me understand my chances realistically. The predictions were spot-on and I got into my dream college!',
        },
        {
            name: 'Priya Patel',
            role: 'Medical Student, AIIMS Mumbai',
            rating: 5,
            quote: 'The automated alerts were a game-changer. I got notified when cutoffs dropped and applied immediately. Worth every rupee!',
        },
        {
            name: 'Arjun Mehta',
            role: 'B.Tech CSE, NIT Trichy',
            rating: 5,
            quote: 'As a first-generation college student, I had no guidance. This tool gave me clarity and confidence in my college choices.',
        },
        {
            name: 'Sneha Reddy',
            role: 'Commerce Student, Delhi University',
            rating: 5,
            quote: 'The premium analytics helped me choose the right branch and college combination. Highly recommended for all students!',
        },
        {
            name: 'Vikram Singh',
            role: 'Engineering Student, BITS Pilani',
            rating: 5,
            quote: 'Best investment I made during my admission process. The predictions are backed by real data, not just guesswork.',
        },
        {
            name: 'Anjali Nair',
            role: 'Architecture Student, SPA Delhi',
            rating: 5,
            quote: 'User-friendly interface and accurate predictions. Saved me hours of research and gave me peace of mind.',
        },
    ];

    return (
        <section className="section">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Loved by <span className="gradient-text">50,000+ Students</span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        See what students say about their experience with CollegePredictor.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            name={testimonial.name}
                            role={testimonial.role}
                            rating={testimonial.rating}
                            quote={testimonial.quote}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
