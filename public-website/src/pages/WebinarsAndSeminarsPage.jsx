import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    Users,
    Video,
    Download,
    Award,
    Globe,
    Bell
} from 'lucide-react';
import SEO from '../components/SEO';
import FAQSection from '../shared/ui/FAQSection';
import WebinarsHero from '../components/sections/webinars/WebinarsHero';
import UpcomingWebinars from '../components/sections/webinars/UpcomingWebinars';
import WebinarBenefits from '../components/sections/webinars/WebinarBenefits';
import PastWebinars from '../components/sections/webinars/PastWebinars';
import WebinarRegistration from '../components/sections/webinars/WebinarRegistration';
import WebinarCTA from '../components/sections/webinars/WebinarCTA';
import { WEBINAR_EVENTS } from '../shared/constants/events';
import { analytics } from '../shared/utils/analytics';
import { supabase } from '../services/supabaseClient';

const WebinarsAndSeminarsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analytics.trackPageView('/webinars-seminars', 'Webinars and Seminars');
        const fetchEvents = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            
            if (!error && data) {
                // Map DB keys to component expected keys
                const formatted = data.map(evt => ({
                    id: evt.id,
                    slug: evt.slug,
                    title: evt.title,
                    date: evt.date,
                    time: evt.time,
                    category: evt.category,
                    speaker: evt.speaker,
                    speakerTitle: evt.speaker_title,
                    description: evt.description,
                    longDescription: evt.long_description,
                    image: evt.image,
                    featured: evt.featured,
                    type: evt.type,
                    agenda: evt.agenda
                }));
                setUpcomingEvents(formatted);
            } else {
                setUpcomingEvents(WEBINAR_EVENTS); // fallback
            }
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const categories = [
        'All',
        'NEET Preparation',
        'Counseling Guide',
        'MBBS Abroad',
        'Career Guidance',
        'Study Tips'
    ];

    ];

    const pastEvents = [
        {
            title: 'Understanding NEET Cutoff Trends: 2014-2024 Analysis',
            date: '2025-01-28',
            views: 2840,
            duration: '1 hr 15 min',
            category: 'NEET Preparation',
            image: '📊',
            recordingAvailable: true
        },
        {
            title: 'State Quota vs AIQ: Which is Better for You?',
            date: '2025-01-20',
            views: 1923,
            duration: '52 min',
            category: 'Counseling Guide',
            image: '📍',
            recordingAvailable: true
        },
        {
            title: 'NMC Screening Test Preparation for Foreign MBBS Graduates',
            date: '2025-01-15',
            views: 1567,
            duration: '1 hr 30 min',
            category: 'MBBS Abroad',
            image: '✅',
            recordingAvailable: true
        },
        {
            title: 'Government vs Private Medical Colleges: Complete Comparison',
            date: '2025-01-08',
            views: 3142,
            duration: '1 hr 10 min',
            category: 'Career Guidance',
            image: '🏥',
            recordingAvailable: true
        }
    ];

    const benefits = [
        {
            icon: Users,
            title: 'Expert Guidance',
            description: 'Learn from experienced counselors, medical professionals, and NEET toppers with proven track records.'
        },
        {
            icon: Video,
            title: 'Interactive Sessions',
            description: 'Live Q&A, polls, and interactive discussions to get your specific questions answered in real-time.'
        },
        {
            icon: Download,
            title: 'Free Resources',
            description: 'Downloadable study materials, checklists, and guides shared during every webinar session.'
        },
        {
            icon: Award,
            title: 'Certificates',
            description: 'Receive participation certificates for attended webinars to showcase your continued learning.'
        },
        {
            icon: Globe,
            title: 'Accessible Anywhere',
            description: 'Join from anywhere using your phone, tablet, or computer. Recordings available for registered users.'
        },
        {
            icon: Bell,
            title: 'Timely Updates',
            description: 'Get notifications about counseling dates, cutoff releases, and important deadlines during sessions.'
        }
    ];

    const faqs = [
        {
            question: 'Are the webinars really free?',
            answer: 'Yes! All our webinars and seminars are completely free for students and parents. We believe in democratizing access to quality medical education guidance.'
        },
        {
            question: 'How do I register for a webinar?',
            answer: 'Simply fill out the registration form on this page with your details. You\'ll receive a confirmation email with the webinar link 24 hours before the event.'
        },
        {
            question: 'Will I get a recording if I miss the live session?',
            answer: 'Yes, all registered participants receive access to the recording within 24 hours of the webinar. The recording remains accessible for 7 days.'
        },
        {
            question: 'Can I ask questions during the webinar?',
            answer: 'Absolutely! We have dedicated Q&A sessions in every webinar. You can submit questions via chat, and our experts will answer them live.'
        },
        {
            question: 'What platform do you use for webinars?',
            answer: 'We use Zoom for our webinars. You\'ll receive a Zoom link in your confirmation email. No special software needed - works on any device with internet.'
        },
        {
            question: 'Do I get any study materials?',
            answer: 'Yes, we share downloadable PDFs, checklists, and reference materials during each webinar. You\'ll receive links to download these resources.'
        }
    ];

    const filteredUpcoming = selectedCategory === 'All'
        ? upcomingEvents
        : upcomingEvents.filter(event => event.category === selectedCategory);

    return (
        <>
            <SEO page="webinars-seminars" />

            <main className="pt-20">
                <WebinarsHero
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
                {loading ? (
                    <div className="py-20 text-center text-slate-400">Loading events...</div>
                ) : (
                    <UpcomingWebinars events={filteredUpcoming} />
                )}
                <WebinarBenefits benefits={benefits} />
                <PastWebinars events={pastEvents} />
                <WebinarRegistration />
                <FAQSection faqs={faqs} />
                <WebinarCTA />
            </main>
        </>
    );
};

export default WebinarsAndSeminarsPage;
