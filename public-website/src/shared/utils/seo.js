// SEO utility functions for dynamic meta tags

export const seoConfig = {
    defaultTitle: 'Medical College Portal - NEET Cutoffs, Rankings & Admission Predictions',
    defaultDescription: 'Comprehensive medical college information portal for India. Access NEET cutoffs, NIRF rankings, college profiles, and AI-powered admission predictions to make informed decisions.',
    defaultKeywords: 'medical colleges India, NEET cutoff, NEET college predictor, medical admission, NIRF ranking, medical college seats, MBBS admission, NEET counseling',
    siteUrl: 'https://medcollegeportal.com', // Replace with actual domain
    ogImage: '/og-image.jpg', // Add OG image
    twitterHandle: '@medcollegeportal', // Replace with actual handle
};

export const generatePageMeta = (page) => {
    const metaConfigs = {
        home: {
            title: seoConfig.defaultTitle,
            description: seoConfig.defaultDescription,
            keywords: seoConfig.defaultKeywords,
        },
        features: {
            title: 'Features - College Database, Rankings & Predictions | Medical College Portal',
            description: 'Explore medical colleges with comprehensive data: NIRF/QS rankings, previous & predicted NEET cutoffs, seat insights, and AI-powered admission predictions.',
            keywords: 'medical college database, NIRF rankings, NEET cutoffs, college predictions, seat availability, admission analysis',
        },
        pricing: {
            title: 'Pricing - Free & Premium Plans | Medical College Portal',
            description: 'Start free with limited college exploration. Upgrade to Premium for complete cutoff history, AI predictions, and automated guidance.',
            keywords: 'medical college subscription, premium features, NEET guidance pricing, college predictor plans',
        },
        about: {
            title: 'About Us - Empowering Medical Aspirants | Medical College Portal',
            description: 'Learn how our platform helps medical students make informed decisions with comprehensive college data, rankings, and AI-powered admission predictions.',
            keywords: 'about medical college portal, NEET guidance, medical admission help, college selection',
        },
        contact: {
            title: 'Contact Us - Support & Inquiries | Medical College Portal',
            description: 'Get help with college data, cutoffs, subscriptions, or general inquiries. Our support team is here to assist medical aspirants.',
            keywords: 'contact medical college portal, support, help, customer service, NEET queries',
        },
    };

    return metaConfigs[page] || metaConfigs.home;
};

export const generateStructuredData = (type, data) => {
    const baseData = {
        '@context': 'https://schema.org',
    };

    switch (type) {
        case 'website':
            return {
                ...baseData,
                '@type': 'WebSite',
                name: seoConfig.defaultTitle,
                description: seoConfig.defaultDescription,
                url: seoConfig.siteUrl,
            };

        case 'organization':
            return {
                ...baseData,
                '@type': 'Organization',
                name: 'Medical College Portal',
                url: seoConfig.siteUrl,
                logo: `${seoConfig.siteUrl}/logo.png`,
                sameAs: [
                    'https://twitter.com/medcollegeportal',
                    'https://facebook.com/medcollegeportal',
                    'https://instagram.com/medcollegeportal',
                ],
            };

        case 'product':
            return {
                ...baseData,
                '@type': 'Product',
                name: 'Medical College Portal Premium',
                description: 'Premium medical college admission service with AI-powered predictions and comprehensive NEET cutoff data',
                offers: {
                    '@type': 'Offer',
                    price: data?.price || '299',
                    priceCurrency: 'INR',
                    availability: 'https://schema.org/InStock',
                },
            };

        case 'faq':
            return {
                ...baseData,
                '@type': 'FAQPage',
                mainEntity: data?.questions?.map((q) => ({
                    '@type': 'Question',
                    name: q.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: q.answer,
                    },
                })) || [],
            };

        default:
            return baseData;
    }
};
