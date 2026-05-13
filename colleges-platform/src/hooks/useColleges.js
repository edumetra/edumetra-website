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
        // Safety timeout to reset loading state if request hangs
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 10000);

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
                image: c.image || 'https://placehold.co/800x600?text=No+Image'
            }));

            setTotalCount(count || 0);

            if (isLoadMore) {
                setColleges(prev => [...prev, ...formattedData]);
            } else {
                setColleges(formattedData);
            }

            setHasMore(from + formattedData.length < count);

        } catch (err) {
            // Check if this is an intentional abort (e.g. new search started)
            const isAbortError = err.name === 'AbortError' || 
                                err.message?.includes('Fetch is aborted') || 
                                err.message?.includes('aborted');

            if (isAbortError) {
                // Do NOT set error state for intentional aborts
                console.log('Fetch aborted intentionally');
                return;
            }

            if (err.message === 'Filter timeout') {
                setError('DATABASE_CONNECTION_BLOCKED');
            } else {
                console.error('Error fetching colleges:', err.message || err);
                setError(err.message || 'Failed to fetch colleges');
            }
        } finally {
            clearTimeout(safetyTimeout);
            setLoading(false);
        }
    }, []);

    // Optimized Fetch: Get distinct options for filters
    const fetchFilterOptions = useCallback(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout for filters

        try {
            // Note: Scanning 10,000+ rows in-browser is slow. 
            // We'll fetch a limited set of recent/active colleges to get a representative 
            // list of filters if a full RPC doesn't exist.
            const { data, error } = await supabase
                .from('colleges')
                .select('location_state, location_city, type, stream, naac_grade')
                .eq('visibility', 'public')
                .limit(2000) // Limit to 2000 for faster client-side processing
                .abortSignal(controller.signal);

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
            if (err.name === 'AbortError') {
                console.warn('Filter options fetch timed out, using defaults.');
            } else {
                console.error('Error fetching filter options:', err);
            }
            return null;
        } finally {
            clearTimeout(timeout);
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
