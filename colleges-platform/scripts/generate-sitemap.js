/**
 * Sitemap generator — run with: npm run sitemap
 * Outputs: public/sitemap.xml
 *
 * Requires env vars:
 *   VITE_SUPABASE_URL  (or set SUPABASE_URL directly)
 *   VITE_SUPABASE_ANON_KEY
 */

import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const SITE_URL = process.env.SITE_URL || 'https://colleges.edumetra.in';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const STATIC_ROUTES = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/colleges', priority: '0.9', changefreq: 'daily' },
    { url: '/rankings', priority: '0.8', changefreq: 'weekly' },
    { url: '/shortlist', priority: '0.7', changefreq: 'monthly' },
    { url: '/eligibility', priority: '0.7', changefreq: 'monthly' },
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
    console.log('Fetching public colleges...');
    const { data, error } = await supabase
        .from('colleges')
        .select('id, updated_at')
        .eq('visibility', 'public');

    if (error) {
        console.error('Supabase error:', error.message);
        process.exit(1);
    }

    const collegeUrls = (data || []).map(c => ({
        url: `/colleges/${c.id}`,
        lastmod: c.updated_at ? c.updated_at.slice(0, 10) : undefined,
        priority: '0.8',
        changefreq: 'weekly',
    }));

    const allUrls = [...STATIC_ROUTES, ...collegeUrls];
    const xml = toXml(allUrls);
    writeFileSync('public/sitemap.xml', xml, 'utf-8');
    console.log(`✅ Sitemap generated with ${allUrls.length} URLs → public/sitemap.xml`);
}

generate();
