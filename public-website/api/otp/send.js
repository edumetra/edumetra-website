import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Ensure phone has 91 prefix if it's 10 digits
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }

  try {
    // 0a. Check if phone is already registered and verified
    let status = 'available';
    try {
      // First try the RPC which has access to auth.users
      const { data, error: checkError } = await supabase.rpc('check_phone_registration', { 
        p_phone: formattedPhone 
      });
      
      if (!checkError && data) {
        status = data;
      } else {
        // Fallback: Check user_profiles directly
        const localPhone = formattedPhone.length === 12 ? formattedPhone.slice(2) : formattedPhone;
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .or(`phone_number.eq.${formattedPhone},phone_number.eq.${localPhone}`)
          .maybeSingle();

        if (profile) {
          status = 'verified';
        }
      }
    } catch (e) {
      console.warn('Error checking registration:', e);
    }

    if (status === 'verified') {
      return res.status(400).json({ 
        error: 'Phone number already exists. Please login instead.' 
      });
    }

    // 0b. Rate limiting: Max 2 tries per number in one day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('otp_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('phone', formattedPhone)
      .gt('created_at', oneDayAgo);

    if (countError) throw countError;

    if (count >= 2) {
      return res.status(429).json({ 
        error: 'Maximum 2 OTP attempts per day allowed. Please try again later.' 
      });
    }


    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 1. Store OTP in database
    const { error: dbError } = await supabase
      .from('otp_verifications')
      .insert([{ phone: formattedPhone, otp, expires_at: expiresAt }]);

    if (dbError) throw dbError;

    // 2. Send SMS via Instaalerts
    const apiKey = process.env.INSTAALERTS_API_KEY || 'k36gKPl3Yy4T7CSscOz8Gw==';
    const dltEntityId = process.env.INSTAALERTS_DLT_ENTITY_ID || '1001168848469782126';
    const dltTemplateId = process.env.INSTAALERTS_DLT_TEMPLATE_ID || '1007010321594087154';
    const senderId = process.env.INSTAALERTS_SENDER_ID || 'VIREDT';
    const text = `Your OTP for mobile number verification with Edumetra Global is ${otp}. It is valid for 10 minutes. Do not share it with anyone. - Virtue Edtech Pvt Ltd`;

    const smsUrl = `https://japi.instaalerts.zone/httpapi/QueryStringReceiver?ver=1.0&key=${apiKey}&encrpt=0&dest=${formattedPhone}&send=${senderId}&text=${encodeURIComponent(text)}&dlt_entity_id=${dltEntityId}&dlt_template_id=${dltTemplateId}`;

    const smsResponse = await fetch(smsUrl);
    const smsResult = await smsResponse.text();
    
    console.log('SMS Result:', smsResult);

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}
