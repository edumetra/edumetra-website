import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for dynamic meta tags
 * @param {Object} props
 * @param {string} props.title - Title of the page
 * @param {string} props.description - Meta description
 * @param {string} props.image - Social preview image URL
 * @param {string} props.url - Current canonical URL
 * @param {string} props.type - OG type (article, website, etc.)
 */
const SEO = ({ 
    title, 
    description = 'Stay informed about NEET entrance exam alerts, admission deadlines, college events and so much more — all in one place with Edumetra.',
    image = 'https://www.edumetraglobal.com/logo-final.jpg', 
    url = window.location.href,
    type = 'website'
}) => {
    const siteName = 'Edumetra';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    return (
        <Helmet>
            {/* Standard HTML tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            
            {/* WhatsApp specific (uses OG but some need specific attention) */}
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
        </Helmet>
    );
};

export default SEO;
