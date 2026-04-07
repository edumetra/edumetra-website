import { useState, useEffect } from 'react';
import { cookieStorage } from '../utils/cookieStorage';

const GUEST_LIMIT = 3;
const STORAGE_KEY = 'visited_edumetra_colleges';

export const useGuestLimit = (user, currentCollegeSlug) => {
    const [hasExceededLimit, setHasExceededLimit] = useState(false);
    const [viewCount, setViewCount] = useState(0);

    useEffect(() => {
        if (user || !currentCollegeSlug) {
            setHasExceededLimit(false);
            return;
        }

        try {
            const storedVisits = cookieStorage.getItem(STORAGE_KEY);
            let visitedColleges = storedVisits ? JSON.parse(storedVisits) : [];

            if (!visitedColleges.includes(currentCollegeSlug)) {
                visitedColleges.push(currentCollegeSlug);
                cookieStorage.setItem(STORAGE_KEY, JSON.stringify(visitedColleges));
            }

            setViewCount(visitedColleges.length);

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
