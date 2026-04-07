export const EXAM_DATA = {
    'neet': {
        name: 'NEET (UG)',
        fullName: 'National Eligibility cum Entrance Test (Undergraduate)',
        conductingBody: 'National Testing Agency (NTA)',
        frequency: 'Once a year',
        mode: 'Pen & Paper (Offline)',
        duration: '3 Hours 20 Minutes',
        sections: ['Physics', 'Chemistry', 'Biology (Botany & Zoology)'],
        eligibility: '10+2 with Physics, Chemistry, Biology/Biotechnology and English as core subjects.',
        description: 'NEET is the primary entrance examination for students who wish to study undergraduate medical courses (MBBS) and dental courses (BDS) in government or private medical and dental colleges in India.',
        stats: {
            totalMarks: 720,
            questions: 200,
            languages: 13
        }
    },
    'aiims': {
        name: 'AIIMS (UG)',
        fullName: 'All India Institute of Medical Sciences Entrance Exam',
        status: 'Merged with NEET',
        description: 'Since 2020, separate entrance exams for AIIMS have been discontinued. Admissions to all AIIMS institutes across India for MBBS are now conducted solely through NEET (UG) scores.',
        conductingBody: 'AIIMS New Delhi (Admission via NTA NEET)',
        eligibility: 'Candidates must qualify NEET (UG) and participate in MCC counseling.'
    },
    'jipmer': {
        name: 'JIPMER',
        fullName: 'Jawaharlal Institute of Postgraduate Medical Education & Research',
        status: 'Merged with NEET',
        description: 'Previously, JIPMER conducted its own entrance exam. However, since 2020, admissions to MBBS courses at JIPMER Puducherry and Karaikal are based on NEET (UG) merit ranks.',
        conductingBody: 'JIPMER (Admission via NTA NEET)',
        eligibility: 'Candidates must qualify NEET (UG) and participate in centralized counseling.'
    },
    'neet-pg': {
        name: 'NEET PG',
        fullName: 'National Eligibility cum Entrance Test (Postgraduate)',
        conductingBody: 'National Board of Examinations (NBE)',
        frequency: 'Once a year',
        mode: 'Computer Based Test (CBT)',
        duration: '3 Hours 30 Minutes',
        eligibility: 'MBBS degree or Provisional MBBS Pass Certificate recognized by NMC and completion of one year of internship.',
        description: 'NEET PG is the single window entrance examination for MD/MS and PG Diploma courses in medical institutes across India.',
        stats: {
            totalQuestions: 200,
            marking: '+4 for correct, -1 for incorrect'
        }
    },
    'fmge': {
        name: 'FMGE',
        fullName: 'Foreign Medical Graduate Examination',
        conductingBody: 'National Board of Examinations (NBE)',
        frequency: 'Twice a year (June & December)',
        mode: 'Computer Based Test (CBT)',
        eligibility: 'Indian citizen or OCI who has a primary medical qualification confirmed by the Indian Embassy concerned to be a recognized qualification for enrollment as a medical practitioner.',
        description: 'FMGE is a screening test for Indian citizens with foreign medical degrees who wish to practice medicine in India.'
    },
    'ini-cet': {
        name: 'INI CET',
        fullName: 'Institute of National Importance Combined Entrance Test',
        conductingBody: 'AIIMS New Delhi',
        frequency: 'Twice a year (January & July)',
        mode: 'Computer Based Test (CBT)',
        description: 'INI CET replaces individual PG entrance exams for AIIMS, JIPMER, PGIMER, and NIMHANS. It is for admission to MD, MS, M.Ch, DM, and MDS courses.',
        eligibility: 'MBBS degree recognized by NMC/DCI and completion of required internship.'
    },
    'gpat': {
        name: 'GPAT',
        fullName: 'Graduate Pharmacy Aptitude Test',
        conductingBody: 'National Testing Agency (NTA)',
        frequency: 'Once a year',
        mode: 'Computer Based Test (CBT)',
        duration: '3 Hours',
        eligibility: 'Bachelor\'s degree in Pharmacy (4 years after 10+2) from a recognized university.',
        description: 'GPAT is the national level entrance examination for entry into M.Pharm programs. The score is also used for awarding fellowships and other financial assistance in the field of Pharmacy.'
    }
};
