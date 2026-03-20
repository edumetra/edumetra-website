import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const SITE_URL = process.env.SITE_URL || 'https://www.edumetraglobal.com';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const STATIC_ROUTES = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/features', priority: '0.8', changefreq: 'monthly' },
    { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/advertise', priority: '0.6', changefreq: 'monthly' },
    { url: '/review', priority: '0.8', changefreq: 'daily' },
    { url: '/mbbs-abroad', priority: '0.9', changefreq: 'weekly' },
    { url: '/news-blogs', priority: '0.9', changefreq: 'daily' },
    { url: '/webinars-seminars', priority: '0.8', changefreq: 'weekly' },
    { url: '/find-colleges', priority: '0.9', changefreq: 'daily' },
];

const COURSE_IDS = [
    'mbbs', 'bds', 'bams', 'bhms', 'pharma', 
    'nursing', 'pharma-diploma', 'physio', 'gnm', 'ayurveda'
];

function toXml(urls) {
    const entries = urls.map(({ url, lastmod, priority, changefreq }) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq || 'weekly'}</changefreq>
    <priority>${priority || '0.5'}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

async function generate() {
    console.log('Fetching colleges from Supabase...');
    const { data: colleges, error } = await supabase
        .from('colleges')
        .select('slug, created_at');

    if (error) {
        console.error('Supabase error:', error.message);
        process.exit(1);
    }

    const collegeUrls = (colleges || []).map(c => ({
        url: `/colleges/${c.slug}`,
        lastmod: c.created_at ? c.created_at.slice(0, 10) : undefined,
        priority: '0.8',
        changefreq: 'weekly',
    }));

    const courseUrls = COURSE_IDS.map(id => ({
        url: `/courses/${id}`,
        priority: '0.8',
        changefreq: 'monthly',
    }));

    const allUrls = [...STATIC_ROUTES, ...courseUrls, ...collegeUrls];
    const xml = toXml(allUrls);
    writeFileSync('public/sitemap.xml', xml, 'utf-8');
    console.log(`✅ Sitemap generated with ${allUrls.length} URLs → public/sitemap.xml`);
}

generate();
