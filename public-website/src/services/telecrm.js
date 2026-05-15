/**
 * TeleCRM Async API Integration
 *
 * Central service for pushing lead data to TeleCRM.
 * All calls are fire-and-forget — they never block the UI or surface errors to users.
 *
 * Usage:
 *   import { pushLeadToTeleCRM } from '../services/telecrm';
 *   pushLeadToTeleCRM({ name: 'Jane', phone: '9999999999', email: 'jane@example.com' }, ['Signup']);
 *
 * Docs: https://next-api.telecrm.in
 */

const ENTERPRISE_ID = import.meta.env.VITE_TELECRM_ENTERPRISE_ID;
const TOKEN = import.meta.env.VITE_TELECRM_TOKEN;

/**
 * Normalise a phone number to include the Indian country code (91).
 * Accepts:
 *  - "9876543210"    → "919876543210"
 *  - "+919876543210" → "919876543210"
 *  - "919876543210"  → "919876543210"  (unchanged)
 * Returns null when the input is empty / undefined.
 */
function normalisePhone(raw) {
    if (!raw) return null;
    // Strip all non-digits
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return null;

    // Already has country code (12 digits starting with 91)
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    // 10-digit local number → prepend 91
    if (digits.length === 10) return `91${digits}`;
    // Any other format — return as-is (may include other country codes)
    return digits;
}

/**
 * Push a lead to TeleCRM asynchronously.
 *
 * @param {Object} fields  - Lead fields. Keys must match TeleCRM API names.
 *                           Common: { name, phone, email, status, city, neet_marks }
 * @param {string[]} tags  - Optional array of tag strings to label this lead's source.
 * @returns {Promise<void>} - Always resolves; never throws.
 */

let lastTrackedPath = '';

/**
 * Map pathnames to human-readable page names for better CRM tracking.
 */
function getPageName(path) {
    if (path === '/') return 'Home Page';
    if (path.startsWith('/colleges/')) return 'College Detail';
    if (path.startsWith('/find-colleges')) return 'Find Colleges';
    if (path.startsWith('/pricing')) return 'Pricing Page';
    if (path.startsWith('/checkout')) return 'Checkout Page';
    if (path.startsWith('/dashboard')) return 'User Dashboard';
    if (path.startsWith('/review')) return 'Write Review';
    if (path.startsWith('/login')) return 'Login Page';
    if (path.startsWith('/signup')) return 'Signup Page';
    if (path.startsWith('/careers')) return 'Careers Page';
    if (path.startsWith('/news-blogs')) return 'News & Blogs';
    if (path.startsWith('/webinars-seminars')) return 'Webinars & Seminars';
    if (path.startsWith('/mbbs-abroad')) return 'MBBS Abroad';
    if (path.startsWith('/about')) return 'About Us';
    if (path.startsWith('/contact')) return 'Contact Us';
    if (path.startsWith('/advertise')) return 'Advertise';
    if (path.startsWith('/universities')) return 'Universities';
    if (path.startsWith('/exams')) return 'Entrance Exams';
    if (path.startsWith('/courses/')) return 'Course Detail';
    if (path.startsWith('/forgot-password')) return 'Forgot Password';
    if (path.startsWith('/reset-password')) return 'Reset Password';
    if (path.startsWith('/invoice')) return 'Invoice Page';
    if (path.startsWith('/privacy')) return 'Privacy Policy';
    if (path.startsWith('/terms')) return 'Terms of Service';
    if (path.includes('tools')) return 'Admission Tools';
    
    // Default: clean up the path
    return path.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Home';
}

/**
 * Track a page view for a known user.
 * Looks for 'telecrm_user' in localStorage. If found, pushes a tag to TeleCRM.
 */
export function trackTeleCRMPageView(path, title) {
    if (lastTrackedPath === path) return;
    lastTrackedPath = path;

    // Small delay to ensure React Helmet has updated the document.title
    setTimeout(() => {
        try {
            const user = JSON.parse(localStorage.getItem('telecrm_user') || 'null');
            // Only track if we have a known identifier (email or phone)
            if (!user || (!user.email && !user.phone)) return;

            const pageName = getPageName(path);
            const displayName = title || document.title || pageName;
            
            pushLeadToTeleCRM(
                { 
                    ...user, 
                    status: 'Fresh', 
                    last_page: displayName,
                    source: displayName 
                }, 
                [`Visited: ${displayName}`]
            );
        } catch (e) {
            // Silently fail
        }
    }, 100);
}

export async function pushLeadToTeleCRM(fields = {}, tags = []) {
    // Silently skip if credentials aren't configured yet
    if (!ENTERPRISE_ID || ENTERPRISE_ID === 'your_enterprise_id_here') return;
    if (!TOKEN || TOKEN === 'your_async_bearer_token_here') return;

    // Build API URL lazily (only after credential guards pass)
    const API_URL = `https://next-api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`;

    try {
        // Build the clean fields object
        const leadFields = {};
        // Standard fields that are likely native in TeleCRM fields object
        const standardFields = new Set(['name', 'email', 'phone', 'city', 'status', 'state', 'source']);
        const extraFields = [];
        
        for (const [key, val] of Object.entries(fields)) {
            if (val !== undefined && val !== null && val !== '') {
                if (standardFields.has(key)) {
                    leadFields[key] = (key === 'phone') ? normalisePhone(val) : val;
                } else {
                    // Collect unknown fields to put in a note
                    extraFields.push(`${key.replace(/_/g, ' ').toUpperCase()}: ${val}`);
                }
            }
        }

        // Default source if not provided
        if (!leadFields.source) leadFields.source = 'Colleges Portal';

        // We must have at least the unique identifier (phone or email)
        if (!leadFields.phone && !leadFields.email) return;

        // Save identity locally so we can track subsequent page views automatically
        try {
            const currentUser = JSON.parse(localStorage.getItem('telecrm_user') || '{}');
            const updatedUser = { ...currentUser };
            if (leadFields.name) updatedUser.name = leadFields.name;
            if (leadFields.email) updatedUser.email = leadFields.email;
            if (leadFields.phone) updatedUser.phone = leadFields.phone;
            localStorage.setItem('telecrm_user', JSON.stringify(updatedUser));
        } catch (e) {
            // Ignore storage errors (e.g. incognito mode restrictions)
        }

        const body = { 
            fields: {
                ...leadFields,
                // Add case-sensitive variations for older/strict TeleCRM versions
                Name: leadFields.name,
                Email: leadFields.email,
                Phone: leadFields.phone,
                PhoneNumber: leadFields.phone,
                // Add specific tracking fields
                last_page: leadFields.last_page || '',
                touchpoint: tags.join(', ')
            },
            // Move unique identifiers to the top level
            name: leadFields.name,
            email: leadFields.email,
            phone: leadFields.phone,
            phoneNumber: leadFields.phone,
            source: leadFields.source || 'Colleges Portal',
            // ENABLE ACTUAL TAGS (The most important part)
            tags: tags
        };

        // Add tags and extra fields as a beautifully formatted note
        if ((tags && tags.length > 0) || extraFields.length > 0) {
            const isPageVisit = tags.some(t => t.startsWith('Visited:'));
            let noteText = '';
            
            if (isPageVisit) {
                const path = tags[0].replace('Visited: ', '');
                noteText = `🌐 PAGE VISIT: ${path}`;
            } else {
                const tagStr = tags.length > 0 ? `📌 SOURCE: ${tags.join(' | ')}` : '';
                const extraStr = extraFields.length > 0 ? `📝 EXTRA INFO:\n${extraFields.join('\n')}` : '';
                noteText = [tagStr, extraStr].filter(Boolean).join('\n\n');
            }

            body.actions = [
                {
                    type: "note",
                    text: noteText
                }
            ];
        }

        // Fire-and-forget with enhanced debug logging
        fetch(API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        .then(async (res) => {
            if (import.meta.env.DEV) {
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    console.debug('[TeleCRM] Success:', data);
                } else {
                    console.error('[TeleCRM] API Error:', res.status, data);
                }
            }
        })
        .catch((err) => {
            if (import.meta.env.DEV) {
                console.warn('[TeleCRM] Network error:', err?.message);
            }
        });

    } catch (err) {
        if (import.meta.env.DEV) {
            console.warn('[TeleCRM] Unexpected builder error:', err?.message);
        }
    }
}
