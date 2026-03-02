import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCollegeDetails(collegeId) {
    const [college, setCollege] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCollegeDetails = async () => {
            if (!collegeId) return;

            try {
                setLoading(true);
                setError(null);

                const { data: collegeData, error: collegeError } = await supabase
                    .schema('public')
                    .from('colleges')
                    .select('*')
                    .eq('id', collegeId)
                    .single();

                if (collegeError) throw collegeError;

                const { data: detailsData, error: detailsError } = await supabase
                    .schema('public')
                    .from('college_details')
                    .select('*')
                    .eq('college_id', collegeId)
                    .single();

                // If no detail record exists right now, we don't necessarily want to throw an error 
                // just treat it as empty.
                if (detailsError && detailsError.code !== 'PGRST116') {
                    console.error("Warning: Could not fetch details data", detailsError);
                }

                // Safe parsing of placement stats
                let placementStats = detailsData?.placement_stats || null;
                if (typeof placementStats === 'string') {
                    try {
                        placementStats = JSON.parse(placementStats);
                    } catch {
                        // ignore
                    }
                }

                const formattedCollege = {
                    ...collegeData,
                    ...detailsData,
                    location: `${collegeData.location_city}, ${collegeData.location_state}`,
                    city: collegeData.location_city,
                    state: collegeData.location_state,
                    students: 0,
                    founded: collegeData.established_year || 'N/A',
                    tuition: collegeData.fees || 'N/A',
                    programs: collegeData.courses || [],
                    placementStats,
                    image: collegeData.image || 'https://via.placeholder.com/1200x400/0f172a/3b82f6?text=Campus+View'
                };

                setCollege(formattedCollege);
            } catch (err) {
                console.error("Error fetching college details:", err.message);
                setError(err.message || 'Failed to load college details.');
            } finally {
                setLoading(false);
            }
        };

        fetchCollegeDetails();
    }, [collegeId]);

    return {
        college,
        loading,
        error
    };
}
