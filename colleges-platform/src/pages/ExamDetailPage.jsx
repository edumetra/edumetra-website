import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    GraduationCap, Calendar, Clock, BookOpen, 
    CheckCircle2, Info, ArrowLeft, Zap, 
    Target, Award, FileText
} from 'lucide-react';
import { EXAM_DATA } from '../data/exams';
import SEOHead from '../components/SEOHead';

const ExamDetailPage = () => {
    const { slug } = useParams();
    const exam = EXAM_DATA[slug];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!exam) {
        return (
            <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Exam Not Found</h1>
                <p className="text-slate-400 mb-8">The exam you are looking for does not exist or has been moved.</p>
                <Link to="/" className="text-red-500 hover:text-red-400 font-semibold">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070c1a] pt-32 pb-20 px-4">
            <SEOHead 
                title={`${exam.name} Exam Guidelines`}
                description={exam.description}
                url={`/exams/${slug}`}
            />

            {/* Ambient Background */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none -z-0" />
            <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-0" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>

                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                            <GraduationCap className="w-3.5 h-3.5" /> Exam Guide
                        </span>
                        {exam.status && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                                <Zap className="w-3.5 h-3.5" /> {exam.status}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                        {exam.name}
                        <span className="block text-xl md:text-2xl font-bold text-slate-500 mt-2">
                            {exam.fullName}
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                        {exam.description}
                    </p>
                </motion.div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {exam.conductingBody && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2 text-red-400">
                                <Award className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Conducting Body</span>
                            </div>
                            <p className="text-white font-bold">{exam.conductingBody}</p>
                        </div>
                    )}
                    {exam.frequency && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2 text-blue-400">
                                <Calendar className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Frequency</span>
                            </div>
                            <p className="text-white font-bold">{exam.frequency}</p>
                        </div>
                    )}
                    {exam.mode && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2 text-emerald-400">
                                <Zap className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Exam Mode</span>
                            </div>
                            <p className="text-white font-bold">{exam.mode}</p>
                        </div>
                    )}
                    {exam.duration && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2 text-purple-400">
                                <Clock className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                            </div>
                            <p className="text-white font-bold">{exam.duration}</p>
                        </div>
                    )}
                    {exam.stats?.totalMarks && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2 text-amber-400">
                                <Target className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Total Marks</span>
                            </div>
                            <p className="text-white font-bold">{exam.stats.totalMarks}</p>
                        </div>
                    )}
                    {exam.stats?.totalQuestions && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-2 text-cyan-400">
                                <FileText className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Questions</span>
                            </div>
                            <p className="text-white font-bold">{exam.stats.totalQuestions}</p>
                        </div>
                    )}
                </div>

                {/* Detailed Sections */}
                <div className="space-y-8">
                    {/* Eligibility */}
                    {exam.eligibility && (
                        <section className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <CheckCircle2 className="w-5 h-5 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Eligibility Criteria</h2>
                            </div>
                            <div className="text-slate-300 leading-relaxed bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">
                                {exam.eligibility}
                            </div>
                        </section>
                    )}

                    {/* Syllabus/Sections */}
                    {exam.sections && (
                        <section className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <BookOpen className="w-5 h-5 text-blue-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Key Sections</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {exam.sections.map((section, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800/50 text-slate-300 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                                        {section}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Exam Overview / Stats */}
                    {exam.stats && (
                        <section className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 justify-center sm:justify-start">
                                <Info className="w-6 h-6 text-slate-500" /> Additional Details
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {Object.entries(exam.stats).map(([key, value], idx) => (
                                    <div key={idx}>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                            {key.replace(/([A-Z])/g, ' $1')}
                                        </div>
                                        <div className="text-xl font-black text-white">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Disclaimer */}
                    <div className="flex items-start gap-3 p-6 bg-slate-900/30 border border-slate-800/60 rounded-2xl mt-12">
                        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Disclaimer: All information provided here is for general informational purposes. Please check the official portal of {exam.conductingBody || 'the respective board'} for the latest updates, dates, and official guidelines.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamDetailPage;
