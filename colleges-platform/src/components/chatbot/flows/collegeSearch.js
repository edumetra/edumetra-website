import { supabase } from '../../../lib/supabase';

/**
 * College search by stream + state
 * Returns top 5 matching colleges
 */
export async function searchCollegesByStreamAndState(stream, state) {
    let query = supabase
        .from('colleges')
        .select('id, slug, name, location_city, location_state, type, rating, fees, image, rank')
        .eq('visibility', 'public')
        .order('rank', { ascending: true, nullsFirst: false })
        .limit(5);

    if (stream && stream !== 'Any') query = query.eq('stream', stream);
    if (state && state !== 'Any') query = query.ilike('location_state', `%${state}%`);

    const { data } = await query;
    return data || [];
}

/**
 * Fetch cutoffs for a specific college
 */
export async function getCollegeCutoffs(collegeId) {
    const { data } = await supabase
        .from('colleges')
        .select('name, cutoffs, exams')
        .eq('id', collegeId)
        .single();
    return data || null;
}

/**
 * Search colleges by partial name (for cutoff flow)
 */
export async function searchCollegeByName(name) {
    const { data } = await supabase
        .from('colleges')
        .select('id, slug, name, location_city, type, rating, cutoffs, exams')
        .eq('visibility', 'public')
        .ilike('name', `%${name}%`)
        .limit(4);
    return data || [];
}

/**
 * Save counselling request
 */
export async function saveCounsellingRequest({ name, phone, userId, query }) {
    const { error } = await supabase.from('counselling_requests').insert({
        name,
        phone,
        user_id: userId || null,
        query: query || 'Chatbot request',
        status: 'pending',
    });
    return !error;
}
