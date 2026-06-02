import { sendCapiEvent } from './helpers/capi.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { eventName, email, phone, externalId, customData, eventId, city, eventSourceUrl } = req.body;

        if (!eventName) {
            return res.status(400).json({ error: 'eventName is required' });
        }

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const referer = req.headers['referer'] || null;

        const result = await sendCapiEvent(
            eventName,
            {
                email,
                phone,
                externalId,
                city,
                eventSourceUrl: eventSourceUrl || referer,
                clientIp,
                userAgent
            },
            customData,
            eventId
        );

        return res.status(200).json(result);
    } catch (err) {
        console.error('[CAPI Handler Error]:', err);
        return res.status(500).json({ error: err.message || 'CAPI tracking failed' });
    }
}
