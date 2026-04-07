import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Get User
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Check Plan & Usage Limit
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('subscription_tier, ai_usage_count')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier || 'free'
    const usage = profile?.ai_usage_count || 0
    
    const LIMITS = { free: 0, premium: 1, pro: 3 }
    const limit = LIMITS[tier] || 0

    if (usage >= limit) {
      return new Response(
        JSON.stringify({ error: `Usage limit reached (${usage}/${limit}). Please upgrade your plan.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // 3. Call Gemini
    const { reviews } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    const prompt = `Analyze these student reviews and provide high-level insights in JSON format.
    Focus on: Pros, Cons, and a Final Recommendation (Should I join?).
    Reviews: ${JSON.stringify(reviews.map(r => r.review_text))}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    })

    const result = await response.json()
    const text = result.candidates[0].content.parts[0].text
    const insights = JSON.parse(text)

    // 4. Increment Usage
    await supabaseClient.rpc('increment_ai_usage', { user_id_param: user.id })

    return new Response(
      JSON.stringify(insights),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
