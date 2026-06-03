/**
 * TeleCRM Async API Integration — Colleges Platform
 * Docs: https://next-api.telecrm.in
 */

import { supabase } from '../lib/supabase';

const ENTERPRISE_ID = import.meta.env.VITE_TELECRM_ENTERPRISE_ID;
const TOKEN = import.meta.env.VITE_TELECRM_TOKEN;
const PLATFORM_SOURCE = 'Colleges Platform';

let lastTrackedPath = '';

function normalisePhone(raw) {
    if (!raw) return null;
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
}

function getPageName(path) {
    if (path === '/') return 'Colleges Home';
    if (path.startsWith('/colleges/')) return 'College Detail';
    if (path === '/colleges') return 'College Search';
    if (path.startsWith('/pricing')) return 'Pricing Page';
    if (path.startsWith('/checkout')) return 'Checkout Page';
    if (path.startsWith('/profile')) return 'User Profile';
    if (path.startsWith('/rankings')) return 'Rankings';
    if (path.startsWith('/eligibility')) return 'Eligibility Checker';
    if (path.startsWith('/rank-predictor')) return 'Rank Predictor';
    if (path.startsWith('/neet-prep')) return 'NEET Prep';
    if (path.startsWith('/compare')) return 'Compare Colleges';
    if (path.startsWith('/review')) return 'Write Review';
    if (path.startsWith('/articles')) return 'Articles';
    if (path.startsWith('/contact')) return 'Contact';
    if (path.startsWith('/careers')) return 'Careers';
    if (path.startsWith('/invoice')) return 'Invoice';
    return path.split('/').filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Colleges Home';
}

export function getStoredTeleCRMUser() {
    try {
        return JSON.parse(localStorage.getItem('telecrm_user') || 'null');
    } catch {
        return null;
    }
}

/** Track navigation / CTA for leads already identified in TeleCRM. */
export async function trackTeleCRMTouchpoint(tags, extraFields = {}) {
    try {
        let stored = getStoredTeleCRMUser();
        if (!stored?.email && !stored?.phone) {
            const { data } = await supabase.auth.getSession();
            const sbUser = data?.session?.user;
            if (sbUser) {
                const metadata = sbUser.user_metadata || {};
                stored = {
                    name: metadata.full_name || metadata.name || '',
                    email: sbUser.email || '',
                    phone: metadata.phone || sbUser.phone || '',
                };
                if (stored.email || stored.phone) {
                    localStorage.setItem('telecrm_user', JSON.stringify(stored));
                }
            }
        }

        if (!stored?.email && !stored?.phone) return;
        pushLeadToTeleCRM(
            { ...stored, ...extraFields, status: extraFields.status || 'Fresh' },
            tags
        );
    } catch (e) {
        // Silently fail
    }
}

export function trackTeleCRMPageView(path, title) {
    if (lastTrackedPath === path) return;
    lastTrackedPath = path;

    // Track in session history first
    try {
        const pageName = getPageName(path);
        const displayName = title || document.title || pageName;
        const history = JSON.parse(sessionStorage.getItem('telecrm_page_history') || '[]');
        if (!history.includes(displayName)) {
            history.push(displayName);
            sessionStorage.setItem('telecrm_page_history', JSON.stringify(history));
        }
    } catch (e) {
        // Ignore
    }

    setTimeout(async () => {
        try {
            let user = getStoredTeleCRMUser();
            if (!user?.email && !user?.phone) {
                const { data } = await supabase.auth.getSession();
                const sbUser = data?.session?.user;
                if (sbUser) {
                    const metadata = sbUser.user_metadata || {};
                    user = {
                        name: metadata.full_name || metadata.name || '',
                        email: sbUser.email || '',
                        phone: metadata.phone || sbUser.phone || '',
                    };
                    if (user.email || user.phone) {
                        localStorage.setItem('telecrm_user', JSON.stringify(user));
                    }
                }
            }

            if (!user?.email && !user?.phone) return;

            const pageName = getPageName(path);
            const displayName = title || document.title || pageName;

            pushLeadToTeleCRM(
                {
                    ...user,
                    status: 'Fresh',
                    last_page: displayName,
                    source: PLATFORM_SOURCE,
                },
                [`Visited: ${displayName}`]
            );
        } catch (e) {
            // Silently fail
        }
    }, 100);
}

export async function pushLeadToTeleCRM(fields = {}, tags = []) {
    if (!ENTERPRISE_ID || ENTERPRISE_ID === 'your_enterprise_id_here') return;
    if (!TOKEN || TOKEN === 'your_async_bearer_token_here') return;

    const API_URL = `https://next-api.telecrm.in/enterprise/${ENTERPRISE_ID}/autoupdatelead`;

    try {
        const leadFields = {};
        const standardFields = new Set(['name', 'email', 'phone', 'city', 'status', 'state', 'source', 'last_page']);
        const extraFields = [];

        for (const [key, val] of Object.entries(fields)) {
            if (val !== undefined && val !== null && val !== '') {
                if (standardFields.has(key)) {
                    leadFields[key] = key === 'phone' ? normalisePhone(val) : val;
                } else {
                    extraFields.push(`${key.replace(/_/g, ' ').toUpperCase()}: ${val}`);
                }
            }
        }

        if (!leadFields.source) leadFields.source = PLATFORM_SOURCE;
        if (!leadFields.last_page && typeof document !== 'undefined') {
            leadFields.last_page = document.title;
        }
        if (!leadFields.phone && !leadFields.email) return;

        try {
            const currentUser = getStoredTeleCRMUser() || {};
            const updatedUser = { ...currentUser };
            if (leadFields.name) updatedUser.name = leadFields.name;
            if (leadFields.email) updatedUser.email = leadFields.email;
            if (leadFields.phone) updatedUser.phone = leadFields.phone;
            localStorage.setItem('telecrm_user', JSON.stringify(updatedUser));
        } catch {
            // ignore storage errors
        }

        const body = {
            fields: {
                ...leadFields,
                Name: leadFields.name,
                Email: leadFields.email,
                Phone: leadFields.phone,
                PhoneNumber: leadFields.phone,
                last_page: leadFields.last_page || '',
                touchpoint: tags.join(', '),
            },
            name: leadFields.name,
            email: leadFields.email,
            phone: leadFields.phone,
            phoneNumber: leadFields.phone,
            source: leadFields.source,
            tags,
        };

        // Add page history and tags/extra fields as note
        let historyStr = '';
        try {
            const history = JSON.parse(sessionStorage.getItem('telecrm_page_history') || '[]');
            if (history.length > 0) {
                historyStr = `🐾 PAGE VISIT PATH:\n${history.map((p) => `• ${p}`).join('\n')}`;
            }
        } catch {}

        const isPageVisit = tags.some((t) => t.startsWith('Visited:'));
        let noteText = '';
        if (isPageVisit) {
            noteText = `🌐 PAGE VISIT: ${tags[0].replace('Visited: ', '')}`;
        } else {
            const tagStr = tags.length > 0 ? `📌 SOURCE: ${tags.join(' | ')}` : '';
            const extraStr = extraFields.length > 0 ? `📝 EXTRA INFO:\n${extraFields.join('\n')}` : '';
            noteText = [tagStr, extraStr, historyStr].filter(Boolean).join('\n\n');
        }

        if (noteText) {
            body.actions = [{ type: 'SYSTEM_NOTE', text: noteText }];
        }

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
                    if (res.ok) console.debug('[TeleCRM] Success:', data);
                    else console.error('[TeleCRM] API Error:', res.status, data);
                }
            })
            .catch((err) => {
                if (import.meta.env.DEV) console.warn('[TeleCRM] Network error:', err?.message);
            });
    } catch (err) {
        if (import.meta.env.DEV) console.warn('[TeleCRM] Unexpected builder error:', err?.message);
    }
}
