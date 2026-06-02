import crypto from 'crypto';

function sha256(val) {
    if (!val) return null;
    return crypto.createHash('sha256').update(String(val).trim().toLowerCase()).digest('hex');
}

function normalisePhone(raw) {
    if (!raw) return null;
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
}

export async function sendCapiEvent(eventName, userData = {}, customData = {}, eventId = null) {
    const PIXEL_ID = '1476788420642976';
    const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN || 'EAASZCVxNgOSEBRrxdVIpekgKZAPGDFZCP0l9Bfuc36OZAH7uMxlTrSFB8sKZCrkO1oIbxX216XXGSCgq56mYGcAAZA64ZB1zts1F41LCpj6MgQqqyWjpoRGTQ3wBrM6GfhdCXiIZCgmKjW2HFyTs5zy6QZC0y8ae3onjhOZBeqVJJySphZA9zGLJtDjmBXpK2jmHQZDZD';

    if (!ACCESS_TOKEN) {
        console.warn('[FB CAPI] Missing access token');
        return { success: false, error: 'Missing access token' };
    }

    try {
        const hashedEmail = sha256(userData.email);
        const hashedPhone = sha256(normalisePhone(userData.phone));

        const eventData = {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            user_data: {
                em: hashedEmail ? [hashedEmail] : [],
                ph: hashedPhone ? [hashedPhone] : [],
                client_ip_address: userData.clientIp || null,
                client_user_agent: userData.userAgent || null
            }
        };

        if (userData.externalId) {
            eventData.user_data.external_id = [sha256(userData.externalId)];
        }

        if (eventId) {
            eventData.event_id = eventId;
        }

        if (customData && Object.keys(customData).length > 0) {
            eventData.custom_data = customData;
        }

        const body = { data: [eventData] };
        const API_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const resData = await response.json();
        if (response.ok) {
            console.log(`[FB CAPI] Event "${eventName}" sent successfully:`, resData);
            return { success: true, data: resData };
        } else {
            console.error(`[FB CAPI] Error sending event "${eventName}":`, resData);
            return { success: false, error: resData };
        }
    } catch (err) {
        console.error(`[FB CAPI] Exception sending event "${eventName}":`, err.message);
        return { success: false, error: err.message };
    }
}
