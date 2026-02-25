import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import NewHeroSection from '../components/sections/NewHeroSection';
import StudyPlansSection from '../components/sections/StudyPlansSection';
import TrustSection from '../components/sections/TrustSection';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import GuaranteesSection from '../components/sections/GuaranteesSection';
import SuccessStoriesSection from '../components/sections/SuccessStoriesSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import CTASection from '../components/sections/CTASection';
import AboutUsSection from '../components/sections/AboutUsSection';
import { generateStructuredData } from '../shared/utils/seo';
import { analytics } from '../shared/utils/analytics';

const HomePage = () => {
    useEffect(() => {
        analytics.trackPageView('/', 'Home');
    }, []);

    const structuredData = [
        generateStructuredData('website'),
        generateStructuredData('organization'),
    ];

    return (
        <>
            <SEO page="home" structuredData={structuredData} />

            <main>
                <NewHeroSection />
                <AboutUsSection />
                <StudyPlansSection />
                <TrustSection />
                <FeaturesGrid />
                <SuccessStoriesSection />
                <GuaranteesSection />
                <TestimonialsSection />
                <CTASection />
            </main>
        </>
    );
};

export default HomePage;
