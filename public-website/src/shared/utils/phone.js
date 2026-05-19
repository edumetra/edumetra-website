/** Strip to 10-digit Indian mobile for Razorpay UPI prefill. */
export function formatPhoneForRazorpay(raw) {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length === 10) return digits;
    if (digits.length > 10) return digits.slice(-10);
    return digits;
}

/** Valid 10-digit mobile starting with 6–9 (India). */
export function isValidIndianMobile(raw) {
    const mobile = formatPhoneForRazorpay(raw);
    return /^[6-9]\d{9}$/.test(mobile);
}
