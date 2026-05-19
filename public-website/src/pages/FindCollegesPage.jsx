import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../features/auth/AuthProvider';
import { getAuthedPortalUrl } from '../shared/utils/authRedirect';

const COLLEGES_PORTAL_URL = 'https://colleges.edumetraglobal.com/colleges';

const FindCollegesPage = () => {
    const { session, loading } = useAuth();
    const [redirectUrl, setRedirectUrl] = useState(COLLEGES_PORTAL_URL);

    useEffect(() => {
        if (loading) return;

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const target = getAuthedPortalUrl(COLLEGES_PORTAL_URL, session, q ? { q } : {});

        setRedirectUrl(target);
        window.location.replace(target);
    }, [session, loading]);

    return (
        <>
            <Helmet>
                <title>Redirecting | Edumetra Colleges</title>
            </Helmet>
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Redirecting to Colleges Portal</h2>
                    <p className="text-slate-400">We're taking you to our updated college discovery platform.</p>
                    {!loading && (
                        <a
                            href={redirectUrl}
                            className="mt-8 inline-block text-red-500 hover:text-red-400 underline"
                        >
                            Click here if you're not redirected automatically
                        </a>
                    )}
                </div>
            </div>
        </>
    );
};

export default FindCollegesPage;
