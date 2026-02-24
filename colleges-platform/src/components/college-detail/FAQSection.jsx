
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const AccordionItem = ({ question, answer, isOpen, onClick }) => (
    <div className="border border-slate-800 rounded-xl overflow-hidden mb-3 bg-slate-900/30">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
        >
            <span className="font-medium text-slate-200">{question}</span>
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDown className="w-5 h-5 text-slate-500" />
            </motion.div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-4 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-800/50">
                        {answer}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export const FAQSection = ({ collegeName }) => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        { q: `What is the admission process for ${collegeName}?`, a: "Admission is primarily based on entrance exam scores followed by counseling rounds. Candidates must meet the eligibility criteria and participate in the centralized seat allocation process." },
        { q: "Are there any scholarship opportunities?", a: "Yes, merit-based and need-based scholarships are available for deserving students. Please check the official website for deadline and application details." },
        { q: "How are the hostel facilities?", a: "The campus provides separate hostels for boys and girls with 24/7 security, Wi-Fi connectivity, and mess facilities offering nutritious meals." },
    ];

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-400" />
                Frequently Asked Questions
            </h2>
            {faqs.map((item, idx) => (
                <AccordionItem
                    key={idx}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === idx}
                    onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                />
            ))}
        </section>
    );
};
