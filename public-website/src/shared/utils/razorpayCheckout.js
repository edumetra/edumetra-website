import { formatPhoneForRazorpay } from './phone';

/** Razorpay expects +(country)number — e.g. +919876543210 */
export function formatContactForRazorpay(raw) {
    const digits = formatPhoneForRazorpay(raw);
    if (!digits) return '';
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    return digits.startsWith('+') ? digits : `+${digits}`;
}

/**
 * Build Standard Checkout options aligned with Razorpay Orders API.
 * Uses server-returned keyId so it always matches the key that created the order.
 */
export function buildRazorpayCheckoutOptions({
    keyId,
    orderId,
    amountPaise,
    user,
    contactTenDigit,
    planName,
    onDismiss,
    onSuccess,
}) {
    const contact = formatContactForRazorpay(contactTenDigit);
    const email = user?.email || '';

    return {
        key: keyId,
        order_id: orderId,
        amount: Number(amountPaise),
        currency: 'INR',
        name: 'Edumetra',
        description: `${planName} Plan — One-time Payment`,
        image: `${typeof window !== 'undefined' ? window.location.origin : ''}/logo-final.jpg`,
        prefill: {
            email,
            name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
            contact,
        },
        notes: {
            user_id: user?.id || '',
            plan: planName,
        },
        theme: { color: '#ef4444' },
        // UPI Intent (mobile) / UPI QR (desktop) — avoid deprecated Collect-only UX
        config: {
            display: {
                blocks: {
                    upi_block: {
                        name: 'Pay via UPI',
                        instruments: [{ method: 'upi' }],
                    },
                    other_block: {
                        name: 'Cards & Netbanking',
                        instruments: [
                            { method: 'card' },
                            { method: 'netbanking' },
                        ],
                    },
                },
                sequence: ['block.upi_block', 'block.other_block'],
                preferences: { show_default_blocks: true },
            },
        },
        modal: {
            ondismiss: onDismiss,
        },
        handler: onSuccess,
    };
}

export function assertRazorpayKey(keyId) {
    if (!keyId || typeof keyId !== 'string') {
        throw new Error(
            'Payment gateway is not configured. Missing Razorpay Key ID — set RAZORPAY_KEY_ID on the server (and redeploy).'
        );
    }
    if (!keyId.startsWith('rzp_')) {
        throw new Error('Invalid Razorpay Key ID. Check RAZORPAY_KEY_ID in deployment settings.');
    }
}
