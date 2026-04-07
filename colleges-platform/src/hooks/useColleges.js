import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ITEMS_PER_PAGE = 12;

export function useColleges() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const abortControllerRef = useRef(null);

    const fetchColleges = useCallback(async ({
        page = 1,
        query = '',
        filters = {},
        sort = 'rank_asc',
        isLoadMore = false
    }) => {
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setLoading(true);
            setError(null);

            let supabaseQuery = supabase
                .from('colleges')
                .select('*', { count: 'exact' })
                .eq('visibility', 'public');

            // 1. Text Search
            if (query) {
                supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,location_city.ilike.%${query}%,location_state.ilike.%${query}%`);
            }

            // 2. Filters
            if (filters.streams?.length > 0) {
                supabaseQuery = supabaseQuery.in('stream', filters.streams);
            }
            if (filters.naacGrades?.length > 0) {
                supabaseQuery = supabaseQuery.in('naac_grade', filters.naacGrades);
            }
            if (filters.locations?.length > 0) {
                supabaseQuery = supabaseQuery.in('location_city', filters.locations);
            }
            if (filters.states?.length > 0) {
                supabaseQuery = supabaseQuery.in('location_state', filters.states);
            }
            if (filters.types?.length > 0) {
                supabaseQuery = supabaseQuery.in('type', filters.types);
            }
            if (filters.courses?.length > 0) {
                supabaseQuery = supabaseQuery.contains('courses', filters.courses);
            }

            // Numeric fee filtering
            if (filters.feesMin && filters.feesMin > 0) {
                supabaseQuery = supabaseQuery.gte('fees_numeric', filters.feesMin);
            }
            if (filters.feesMax && filters.feesMax > 0) {
                supabaseQuery = supabaseQuery.lte('fees_numeric', filters.feesMax);
            }

            // 3. Sorting
            switch (sort) {
                case 'rating_desc':
                    supabaseQuery = supabaseQuery.order('rating', { ascending: false, nullsFirst: false });
                    break;
                case 'fees_asc':
                    supabaseQuery = supabaseQuery.order('fees_numeric', { ascending: true, nullsFirst: false });
                    break;
                case 'fees_desc':
                    supabaseQuery = supabaseQuery.order('fees_numeric', { ascending: false, nullsFirst: false });
                    break;
                case 'rank_desc':
                    supabaseQuery = supabaseQuery.order('rank', { ascending: false, nullsFirst: false });
                    break;
                case 'rank_asc':
                default:
                    supabaseQuery = supabaseQuery.order('rank', { ascending: true, nullsFirst: false });
                    break;
            }

            // 4. Pagination
            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            supabaseQuery = supabaseQuery.range(from, to).abortSignal(abortControllerRef.current.signal);

            const { data, count, error: supabaseError } = await supabaseQuery;

            if (supabaseError) throw supabaseError;

            const formattedData = (data || []).map(c => ({
                id: c.id,
                slug: c.slug,
                rank: c.rank,
                name: c.name,
                location: `${c.location_city}, ${c.location_state}`,
                city: c.location_city,
                state: c.location_state,
                type: c.type,
                stream: c.stream,
                naac_grade: c.naac_grade,
                fees_numeric: c.fees_numeric,
                rating: c.rating || 0,
                fees: c.fees,
                exams: c.exams,
                courses: c.courses || [],
                image: c.image || 'https://via.placeholder.com/800x600?text=No+Image'
            }));

            setTotalCount(count || 0);

            if (isLoadMore) {
                setColleges(prev => [...prev, ...formattedData]);
            } else {
                setColleges(formattedData);
            }

            setHasMore(from + formattedData.length < count);

        } catch (err) {
            // Supabase sometimes shapes AbortErrors slightly differently
            const isAbortError = err.name === 'AbortError' || err.message?.includes('Fetch is aborted') || err.message?.includes('aborted');
            if (!isAbortError) {
                console.error('Error fetching colleges:', err.message || err);
                setError(err.message || 'Failed to fetch colleges');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Also add a function to fetch distinct filter options directly from the existing colleges
    const fetchFilterOptions = useCallback(async () => {
        try {
            // Using a simple rpc function or fetching unique values if possible, otherwise we fetch minimal select
            // Note: In Supabase, getting distinct values requires either an RPC function or fetching a wide set. 
            // For now, let's fetch basic distinct columns using a wide query (or just return empty array if it gets too large)

            // Note: Since getting truly dynamic unique values across 10,000s of rows in Supabase without RPC is hard, 
            // we will fetch basic grouping. 
            // Better approach for Supabase: create an RPC or we hardcode common ones for now but pull distinct cities/states.

            const { data, error } = await supabase
                .from('colleges')
                .select('location_state, location_city, type, stream, naac_grade')
                .eq('visibility', 'public');

            if (error) throw error;

            const options = {
                states: [...new Set(data.map(d => d.location_state).filter(Boolean))].sort(),
                cities: [...new Set(data.map(d => d.location_city).filter(Boolean))].sort(),
                streams: [...new Set(data.map(d => d.stream).filter(Boolean))].sort(),
                types: [...new Set(data.map(d => d.type).filter(Boolean))].sort(),
                naacGrades: [...new Set(data.map(d => d.naac_grade).filter(Boolean))].sort(),
            };

            return options;

        } catch (err) {
            console.error('Error fetching filter options:', err);
            return null;
        }
    }, []);


    return {
        colleges,
        loading,
        error,
        hasMore,
        totalCount,
        fetchColleges,
        fetchFilterOptions
    };
}
