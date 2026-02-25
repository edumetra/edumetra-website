import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://colleges.edumetra.in';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.png`;

export default function SEOHead({
    title,
    description,
    image,
    url,
    jsonLd,
    noIndex = false,
}) {
    const fullTitle = title ? `${title} | Edumetra Colleges` : 'Edumetra Colleges — Find Your Perfect College in India';
    const metaDescription = description || 'Search 10,000+ colleges across India. Compare fees, placements, rankings and read verified student reviews.';
    const metaImage = image || DEFAULT_IMAGE;
    const metaUrl = url ? `${BASE_URL}${url}` : BASE_URL;

    return (
        <Helmet>
            {/* Primary */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {noIndex && <meta name="robots" content="noindex,nofollow" />}
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Edumetra Colleges" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {/* JSON-LD */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
}
