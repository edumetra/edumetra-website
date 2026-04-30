import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const FindCollegesPage = () => {
    useEffect(() => {
        // Handle search query if present
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const target = q 
            ? `https://colleges.edumetraglobal.com/colleges?q=${encodeURIComponent(q)}`
            : 'https://colleges.edumetraglobal.com/colleges';
            
        window.location.replace(target);
    }, []);

    return (
        <>
            <Helmet>
                <title>Redirecting | Edumetra Colleges</title>
            </Helmet>
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">Redirecting to Colleges Portal</h2>
                    <p className="text-slate-400">We're taking you to our updated college discovery platform.</p>
                    <a 
                        href="https://colleges.edumetraglobal.com/colleges" 
                        className="mt-8 inline-block text-red-500 hover:text-red-400 underline"
                    >
                        Click here if you're not redirected automatically
                    </a>
                </div>
            </div>
        </>
    );
};

export default FindCollegesPage;
