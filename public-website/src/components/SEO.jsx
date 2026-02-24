import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { seoConfig, generatePageMeta } from '../shared/utils/seo';

const SEO = ({ page, title, description, keywords, structuredData }) => {
    const location = useLocation();
    const pageMeta = generatePageMeta(page);

    const pageTitle = title || pageMeta.title;
    const pageDescription = description || pageMeta.description;
    const pageKeywords = keywords || pageMeta.keywords;
    const canonicalUrl = `${seoConfig.siteUrl}${location.pathname} `;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <meta name="keywords" content={pageKeywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={`${seoConfig.siteUrl}${seoConfig.ogImage} `} />
            <meta property="og:site_name" content="Medical College Portal" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={seoConfig.twitterHandle} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={`${seoConfig.siteUrl}${seoConfig.ogImage} `} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
