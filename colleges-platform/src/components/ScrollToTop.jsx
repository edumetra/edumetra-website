import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackTeleCRMPageView } from '../services/telecrm';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
        
        // Track page views in TeleCRM for returning/known users
        trackTeleCRMPageView(pathname);
    }, [pathname]);

    return null;
}
