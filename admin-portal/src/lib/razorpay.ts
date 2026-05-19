export type RazorpayKeyMode = 'test' | 'live' | 'unknown';

export function getRazorpayKeyMode(keyId?: string | null): RazorpayKeyMode {
    if (!keyId) return 'unknown';
    if (keyId.startsWith('rzp_test_')) return 'test';
    if (keyId.startsWith('rzp_live_')) return 'live';
    return 'unknown';
}

export function getRazorpayCredentials() {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const mode = getRazorpayKeyMode(keyId);
    return { keyId, keySecret, mode };
}

export function assertRazorpayConfigured() {
    const { keyId, keySecret } = getRazorpayCredentials();
    if (!keyId || !keySecret) {
        throw new Error(
            'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in admin-portal environment variables.'
        );
    }
}

/** Plan prices in INR (before GST). Must match public-website / colleges-platform checkout. */
export const PLAN_PRICES_INR: Record<string, number> = {
    premium: 3000,
    pro: 30000,
};

export function calculateOrderAmounts(planType: string, discountPercentage = 0) {
    const baseAmount = PLAN_PRICES_INR[planType];
    if (!baseAmount) {
        throw new Error('Invalid planType');
    }

    const discount = Math.floor(baseAmount * (discountPercentage / 100));
    const taxableAmount = baseAmount - discount;
    const gstAmount = Math.floor(taxableAmount * 0.18);
    const totalAmount = taxableAmount + gstAmount;

    return {
        baseAmount,
        discount,
        taxableAmount,
        gstAmount,
        totalAmount,
        totalAmountPaise: totalAmount * 100,
        discountPaise: discount * 100,
    };
}
