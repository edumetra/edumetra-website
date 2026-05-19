/** @returns {'test' | 'live' | 'unknown'} */
export function getRazorpayKeyMode(keyId) {
    if (!keyId || typeof keyId !== 'string') return 'unknown';
    if (keyId.startsWith('rzp_test_')) return 'test';
    if (keyId.startsWith('rzp_live_')) return 'live';
    return 'unknown';
}

const PRODUCTION_HOSTS = new Set([
    'www.edumetraglobal.com',
    'edumetraglobal.com',
    'colleges.edumetraglobal.com',
    'www.edumetra.in',
    'edumetra.in',
    'colleges.edumetra.in',
]);

export function isProductionPaymentHost() {
    if (typeof window === 'undefined') return false;
    return PRODUCTION_HOSTS.has(window.location.hostname);
}

export function assertLivePaymentsOnProduction(keyId) {
    const mode = getRazorpayKeyMode(keyId);
    if (mode === 'test' && isProductionPaymentHost()) {
        throw new Error(
            'Payments are in Razorpay TEST mode. No real money is charged. '
            + 'Set RAZORPAY_KEY_ID to your live key (rzp_live_...) in Vercel for public-website and colleges-platform, then redeploy.'
        );
    }
}

export function getTestModeBannerMessage(mode) {
    if (mode !== 'test') return null;
    return 'Razorpay TEST mode is active. Payments are simulated — your bank account will not be charged. '
        + 'Switch to live keys (rzp_live_...) in deployment settings for real payments.';
}
