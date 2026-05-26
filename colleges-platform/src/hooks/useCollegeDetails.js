import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCollegeDetails(collegeSlug) {
    const [college, setCollege] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCollegeDetails = async () => {
            if (!collegeSlug) return;

            try {
                setLoading(true);
                setError(null);

                const { data: collegeData, error: collegeError } = await supabase
                    .schema('public')
                    .from('colleges')
                    .select('*')
                    .eq('slug', collegeSlug)
                    .single();

                if (collegeError) throw collegeError;

                const { data: detailsData, error: detailsError } = await supabase
                    .schema('public')
                    .from('college_details')
                    .select('*')
                    .eq('college_id', collegeData.id)
                    .single();

                if (detailsError && detailsError.code !== 'PGRST116') {
                    console.error("Warning: Could not fetch details data", detailsError);
                }

                // Fetch relational cutoffs
                let cutoffsData = [];
                try {
                    const { data, error: err } = await supabase
                        .schema('public')
                        .from('cutoffs')
                        .select('*')
                        .eq('college_id', collegeData.id)
                        .order('year', { ascending: false });
                    if (!err && data) cutoffsData = data;
                } catch (e) {
                    console.error("Failed to fetch relational cutoffs", e);
                }

                // Fetch relational rankings
                let rankingsData = [];
                try {
                    const { data, error: err } = await supabase
                        .schema('public')
                        .from('rankings')
                        .select('*')
                        .eq('college_id', collegeData.id)
                        .order('year', { ascending: false });
                    if (!err && data) rankingsData = data;
                } catch (e) {
                    console.error("Failed to fetch relational rankings", e);
                }

                const minorityText = (typeof collegeData.minority_status === 'string' && collegeData.minority_status !== 'Non-Minority' && collegeData.minority_status !== 'true' && collegeData.minority_status !== 'false' && collegeData.minority_status.trim() !== '')
                    ? collegeData.minority_status
                    : (typeof detailsData?.minority_status === 'string' && detailsData.minority_status !== 'Non-Minority' && detailsData.minority_status !== 'true' && detailsData.minority_status !== 'false' && detailsData.minority_status.trim() !== '')
                        ? detailsData.minority_status
                        : null;

                const isMinorityBool = (detailsData?.minority_status === true || collegeData.minority_status === true || collegeData.minority_status === 'true' || minorityText !== null);

                // Fetch relational courses
                let coursesData = [];
                try {
                    const { data, error: err } = await supabase
                        .schema('public')
                        .from('college_courses')
                        .select('*, course_fees_breakdown(*)')
                        .eq('college_id', collegeData.id);
                    if (!err && data) coursesData = data;
                } catch (e) {
                    console.error("Failed to fetch relational courses", e);
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

                const formattedCourses = (coursesData && coursesData.length > 0)
                    ? coursesData.map(course => {
                        const totalFees = (course.course_fees_breakdown || []).reduce((sum, item) => sum + (item.amount || 0), 0);
                        return {
                            name: course.name,
                            duration: course.duration || 'N/A',
                            fees: totalFees > 0 ? `${totalFees.toLocaleString('en-IN')}` : 'N/A',
                            fees_breakdown: course.course_fees_breakdown || []
                        };
                      })
                    : (collegeData.courses || []).map(course => ({
                        name: course,
                        duration: 'N/A',
                        fees: collegeData.fees || 'N/A',
                        fees_breakdown: []
                      }));

                const formattedCollege = {
                    ...collegeData,
                    ...detailsData,
                    minority_status_text: minorityText,
                    is_minority: isMinorityBool,
                    total_associated_beds_in_hospital: detailsData?.total_associated_beds_in_hospital || placementStats?.total_associated_beds_in_hospital || 0,
                    location: `${collegeData.location_city}, ${collegeData.location_state}`,
                    city: collegeData.location_city,
                    state: collegeData.location_state,
                    students: 0,
                    founded: collegeData.established_year || 'N/A',
                    tuition: collegeData.fees || 'N/A',
                    programs: collegeData.courses || [],
                    courses_fees: formattedCourses,
                    cutoffs: cutoffsData || [],
                    rankings: rankingsData || [],
                    placementStats,
                    image: collegeData.image || 'https://placehold.co/1200x400/0f172a/3b82f6?text=Campus+View',
                    gallery_images: Array.isArray(collegeData.gallery_images) ? collegeData.gallery_images : [],
                    campus_photos: Array.isArray(collegeData.campus_photos) ? collegeData.campus_photos : [],
                    campus_life_images: Array.isArray(detailsData?.campus_life_images) ? detailsData.campus_life_images : [],
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
    }, [collegeSlug]);

    return {
        college,
        loading,
        error
    };
}
