import React, { useEffect } from 'react';
import {
    Globe,
    DollarSign,
    GraduationCap,
    Award,
    Users,
    MapPin,
    Clock,
    Shield,
    TrendingUp,
    BookOpen
} from 'lucide-react';
import SEO from '../components/SEO';
import FAQSection from '../shared/ui/FAQSection';
import MBBSAbroadHero from '../components/sections/mbbs-abroad/MBBSAbroadHero';
import WhyStudyAbroad from '../components/sections/mbbs-abroad/WhyStudyAbroad';
import CountryDestinations from '../components/sections/mbbs-abroad/CountryDestinations';
import AdmissionProcess from '../components/sections/mbbs-abroad/AdmissionProcess';
import MBBSAbroadCTA from '../components/sections/mbbs-abroad/MBBSAbroadCTA';
import { analytics } from '../shared/utils/analytics';

const MBBSAbroadPage = () => {
    useEffect(() => {
        analytics.trackPageView('/mbbs-abroad', 'MBBS Abroad');
    }, []);

    const stats = [
        { value: '10,000+', label: 'Students Placed Abroad', icon: Users },
        { value: '200+', label: 'Partner Universities', icon: GraduationCap },
        { value: '12+', label: 'Countries', icon: Globe },
        { value: '98%', label: 'Visa Success Rate', icon: TrendingUp }
    ];

    const whyAbroad = [
        {
            icon: DollarSign,
            title: 'Affordable Education',
            description: 'Study MBBS at a fraction of the cost compared to private medical colleges in India. Total cost including living expenses often lower than Indian donations.'
        },
        {
            icon: Award,
            title: 'International Recognition',
            description: 'Degrees from NMC and WHO-approved universities allow you to practice medicine in India and globally after clearing screening tests.'
        },
        {
            icon: Clock,
            title: 'No Entrance Exams',
            description: 'Direct admission based on NEET score and 12th marks. No need to wait for counseling rounds or compete for limited seats.'
        },
        {
            icon: Globe,
            title: 'Global Exposure',
            description: 'Study alongside international students, experience different cultures, and build a global network of medical professionals.'
        },
        {
            icon: BookOpen,
            title: 'English Medium',
            description: 'All programs offered in English medium, making it easier for Indian students to grasp complex medical concepts.'
        },
        {
            icon: Shield,
            title: 'Safe Environment',
            description: 'Partner universities ensure safe accommodation, 24/7 security, and dedicated support for international students.'
        }
    ];

    const countries = [
        {
            name: 'Russia',
            flag: '🇷🇺',
            image: MapPin,
            tuitionFee: '₹15-25 Lakhs',
            duration: '6 Years',
            universities: '50+',
            mediumOfTeaching: 'English',
            eligibility: '50% in PCB',
            recognition: 'NMC, WHO Approved',
            highlights: [
                'No donation or capitation fees',
                'European standard medical education',
                'Low cost of living (₹15,000-20,000/month)',
                'Direct admission without IELTS'
            ],
            popular: true
        },
        {
            name: 'China',
            flag: '🇨🇳',
            image: MapPin,
            tuitionFee: '₹18-35 Lakhs',
            duration: '6 Years',
            universities: '45+',
            mediumOfTeaching: 'English',
            eligibility: '50% in PCB',
            recognition: 'NMC, WHO Approved',
            highlights: [
                'World-class infrastructure',
                'Clinical exposure from 2nd year',
                'Scholarships available for Indian students',
                'Low living expenses'
            ]
        },
        {
            name: 'Kazakhstan',
            flag: '🇰🇿',
            image: MapPin,
            tuitionFee: '₹18-28 Lakhs',
            duration: '5 Years',
            universities: '15+',
            mediumOfTeaching: 'English',
            eligibility: '50% in PCB',
            recognition: 'NMC, WHO Approved',
            highlights: [
                'Direct admission process',
                'Indian food available',
                'Safe and student-friendly environment',
                'Only 5 years duration'
            ]
        },
        {
            name: 'Philippines',
            flag: '🇵🇭',
            image: MapPin,
            tuitionFee: '₹35-50 Lakhs',
            duration: '5.5 Years',
            universities: '25+',
            mediumOfTeaching: 'English',
            eligibility: '50% in PCB',
            recognition: 'NMC, WHO Approved',
            highlights: [
                'US-based medical curriculum',
                'English-speaking country',
                'Tropical climate similar to India',
                'High passing rate in NMC screening'
            ]
        },
        {
            name: 'Bangladesh',
            flag: '🇧🇩',
            image: MapPin,
            tuitionFee: '₹25-45 Lakhs',
            duration: '5 Years',
            universities: '40+',
            mediumOfTeaching: 'English',
            eligibility: '50% in PCB',
            recognition: 'NMC, WHO Approved',
            highlights: [
                'Similar culture and language',
                'Easy travel to and from India',
                'Quality medical education',
                'Growing medical infrastructure'
            ]
        },
        {
            name: 'Georgia',
            flag: '🇬🇪',
            image: MapPin,
            tuitionFee: '₹20-30 Lakhs',
            duration: '6 Years',
            universities: '20+',
            mediumOfTeaching: 'English',
            eligibility: '50% in PCB',
            recognition: 'NMC, WHO Approved',
            highlights: [
                'European medical education standards',
                '100% visa approval rate',
                'Modern infrastructure',
                'Safe for Indian students'
            ]
        }
    ];

    const admissionProcess = [
        {
            step: '1',
            title: 'Choose Country & University',
            description: 'Select from 200+ NMC-approved universities across 12+ countries based on budget, preferences, and career goals.'
        },
        {
            step: '2',
            title: 'Documentation',
            description: 'Prepare required documents: NEET admit card, 10th & 12th marksheets, passport, medical certificates.'
        },
        {
            step: '3',
            title: 'Apply & Get Offer Letter',
            description: 'Submit application to chosen universities. Receive offer letter within 7-15 days for eligible candidates.'
        },
        {
            step: '4',
            title: 'Visa Processing',
            description: 'We assist with complete visa documentation and application process. Visa approval typically takes 30-45 days.'
        },
        {
            step: '5',
            title: 'Travel & Admission',
            description: 'Book flight tickets, arrange airport pickup, and complete university admission formalities upon arrival.'
        }
    ];

    const faqs = [
        {
            question: 'Is MBBS from abroad recognized in India?',
            answer: 'Yes, MBBS degrees from NMC (National Medical Commission) and WHO-approved universities are recognized in India. After completing your MBBS abroad, you need to clear the NMC screening test (FMGE) to practice medicine in India. We only recommend NMC-approved universities to ensure your degree is valid.'
        },
        {
            question: 'What is the total cost of studying MBBS abroad?',
            answer: 'The total cost varies by country. Generally, it ranges from ₹15-50 lakhs for the entire course including tuition fees. Countries like Russia and Kazakhstan are more affordable (₹15-30 lakhs total), while Philippines costs around ₹35-50 lakhs. This includes tuition, accommodation, and living expenses. It\'s still much cheaper than private medical colleges in India which can cost ₹1 crore or more.'
        },
        {
            question: 'Do I need IELTS to study MBBS abroad?',
            answer: 'No, most countries offering MBBS in English medium do not require IELTS for admission. Countries like Russia, China, Kazakhstan, Georgia, and Bangladesh accept students with just NEET qualification and 50% in PCB. However, some universities in Philippines and UK may require English proficiency tests.'
        },
        {
            question: 'How long does the visa process take?',
            answer: 'Visa processing typically takes 30-45 days after receiving the university offer letter. We assist you with complete visa documentation and application process. The timeline may vary slightly depending on the country and time of year. We recommend starting the process at least 2-3 months before the course start date.'
        },
        {
            question: 'What is the NMC screening test pass rate for foreign graduates?',
            answer: 'The NMC screening test (FMGE) pass rate varies, but students from reputed NMC-approved universities typically have a 25-35% pass rate. However, with proper preparation and coaching, many of our students achieve much higher success rates. We provide guidance on NMC exam preparation and connect you with coaching resources.'
        },
        {
            question: 'Can I practice in India after completing MBBS abroad?',
            answer: 'Yes, absolutely! After completing MBBS from an NMC-approved university abroad, you need to clear the NMC screening test (FMGE). Once you pass this exam and complete the required registration process with the State Medical Council, you are eligible to practice medicine anywhere in India, just like Indian MBBS graduates.'
        },
        {
            question: 'Is it safe to study MBBS abroad?',
            answer: 'Yes, it is safe. We partner only with established universities that have a strong track record of hosting international students. These universities provide secure accommodation, 24/7 campus security, Indian food options, and dedicated support for international students. We also stay in touch with students throughout their course and provide assistance whenever needed.'
        },
        {
            question: 'What is the medium of instruction?',
            answer: 'All our recommended universities offer MBBS programs in English medium. This makes it easier for Indian students to understand complex medical concepts. Some universities also offer preparatory language courses to help students learn basic local language for patient interaction during clinical years.'
        }
    ];

    return (
        <>
            <SEO page="mbbs-abroad" />

            <main className="pt-20">
                <MBBSAbroadHero stats={stats} />
                <WhyStudyAbroad reasons={whyAbroad} />
                <CountryDestinations countries={countries} />
                <AdmissionProcess steps={admissionProcess} />

                <FAQSection
                    faqs={faqs}
                    title="Frequently Asked Questions About MBBS Abroad"
                    subtitle="Get answers to common questions about studying medicine internationally"
                />

                <MBBSAbroadCTA />
            </main>
        </>
    );
};

export default MBBSAbroadPage;
