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
 * Track a page view for a known user.
 * Looks for 'telecrm_user' in localStorage. If found, pushes a "Visited: [Page]" tag to TeleCRM.
 */
export function trackTeleCRMPageView(path, pageName) {
    if (lastTrackedPath === path) return;
    lastTrackedPath = path;

    try {
        const user = JSON.parse(localStorage.getItem('telecrm_user') || 'null');
        // Only track if we have a known identifier (email or phone)
        if (!user || (!user.email && !user.phone)) return;

        pushLeadToTeleCRM(
            { ...user, status: 'Fresh' }, 
            [`Visited: ${pageName || path}`]
        );
    } catch (e) {
        // Silently fail if localStorage parsing errors out
    }
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
        const notesArr = [];

        if (fields.name)  leadFields.name  = String(fields.name).trim();
        if (fields.email) leadFields.email = String(fields.email).trim().toLowerCase();

        const phone = normalisePhone(fields.phone);
        if (phone) leadFields.phone = phone;

        // Add tags to notes FIRST so it is highly visible
        if (tags && tags.length > 0) {
            notesArr.push(`📌 SOURCE: ${tags.join(' | ')}`);
        }

        // Standard fields that are likely native
        const standardFields = new Set(['name', 'email', 'phone', 'city', 'status']);
        
        for (const [key, val] of Object.entries(fields)) {
            if (val !== undefined && val !== null && val !== '') {
                if (standardFields.has(key)) {
                    leadFields[key] = val;
                } else {
                    // Collect unknown custom fields (like neet_marks) into notes so they aren't dropped
                    notesArr.push(`${key}: ${val}`);
                }
            }
        }

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

        const body = { fields: leadFields };
        
        if (notesArr.length > 0) {
            body.actions = [
                {
                    type: "SYSTEM_NOTE",
                    text: notesArr.join(' | ')
                }
            ];
        }

        // Fire-and-forget — no await on the caller side needed
        fetch(API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).catch((err) => {
            // Silently swallow network errors — never surface to user
            if (import.meta.env.DEV) {
                console.warn('[TeleCRM] Push failed (non-critical):', err?.message);
            }
        });

        if (import.meta.env.DEV) {
            console.debug('[TeleCRM] Lead pushed:', leadFields, 'tags:', tags);
        }
    } catch (err) {
        // Catch any synchronous errors in the builder logic
        if (import.meta.env.DEV) {
            console.warn('[TeleCRM] Unexpected error (non-critical):', err?.message);
        }
    }
}
