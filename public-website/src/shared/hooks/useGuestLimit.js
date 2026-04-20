import { useState, useEffect } from 'react';
import { cookieStorage } from '../utils/cookieStorage';

const GUEST_LIMIT = 3;
const STORAGE_KEY = 'visited_edumetra_colleges';

export const useGuestLimit = (user, currentCollegeSlug) => {
    const [hasExceededLimit, setHasExceededLimit] = useState(false);
    const [viewCount, setViewCount] = useState(0);

    useEffect(() => {
        // If user is logged in or we don't have a valid slug yet, don't check limits
        if (user || !currentCollegeSlug) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasExceededLimit(false);
            return;
        }

        try {
            // Read from cookieStorage
            const storedVisits = cookieStorage.getItem(STORAGE_KEY);
            let visitedColleges = storedVisits ? JSON.parse(storedVisits) : [];

            // If it's a new college view, add it
            if (!visitedColleges.includes(currentCollegeSlug)) {
                visitedColleges.push(currentCollegeSlug);
                cookieStorage.setItem(STORAGE_KEY, JSON.stringify(visitedColleges));
            }

            setViewCount(visitedColleges.length);

            // If they are on a NEW college and they have ALREADY viewed 3 others, block them.
            // Wait - if they have visited 3, and are viewing a 4th, block.
            // If they are viewing one of the 3 they already visited, they can still view it.
            // Wait, by adding it to the array, the length becomes 4.
            // If length is > 3 (meaning 4 or more), limit is exceeded.
            if (visitedColleges.length > GUEST_LIMIT) {
                setHasExceededLimit(true);
            } else {
                setHasExceededLimit(false);
            }
        } catch (error) {
            console.error('Error accessing local storage for guest limit tracking:', error);
        }
    }, [user, currentCollegeSlug]);

    return { hasExceededLimit, viewCount, limit: GUEST_LIMIT };
};
