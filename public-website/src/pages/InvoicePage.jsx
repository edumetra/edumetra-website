import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Download, FileText, CheckCircle,
    Loader2, AlertCircle, Building2, Mail, Calendar, Hash
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import SEO from '../components/SEO';

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://edumetra-website.vercel.app';

// ── PDF Download ──────────────────────────────────────────────────────────────
async function downloadAsPDF(elementId, filename) {
    // Dynamically import to keep initial bundle size small
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
    ]);

    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, {
        scale: 2,                 // 2× for crisp text on retina
        useCORS: true,
        backgroundColor: '#0f172a', // slate-900 bg
        logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
}

// ── Main Component ────────────────────────────────────────────────────────────
const InvoicePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const invoiceId = searchParams.get('id');
    const paymentId = searchParams.get('payment_id');

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [downloading, setDownloading] = useState(false);
    const invoiceRef = useRef(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!invoiceId && !paymentId) { navigate('/dashboard'); return; }
        fetchInvoice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, invoiceId, paymentId]);

    const fetchInvoice = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ userId: user.id });
            if (invoiceId) params.set('invoiceId', invoiceId);
            if (paymentId) params.set('paymentId', paymentId);

            const res = await fetch(`${ADMIN_URL}/api/razorpay/get-invoice?${params}`);
            const data = await res.json();

            if (!res.ok || !data.invoice) throw new Error(data.error || 'Invoice not found');
            setInvoice(data.invoice);
        } catch (err) {
            setError(err.message || 'Failed to load invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!invoice) return;
        setDownloading(true);
        try {
            await downloadAsPDF('invoice-document', `Invoice-${invoice.invoice_number}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
            // Fallback to print dialog
            window.print();
        } finally {
            setDownloading(false);
        }
    };

    const planDisplayName = (type) => ({ premium: 'Premium Plan', pro: 'Pro Plan' }[type] || type);

    const formatINR = (val) =>
        Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                <p className="text-slate-400 text-sm">Loading your invoice…</p>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 px-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-white font-bold text-xl">{error}</h2>
                <Link to="/dashboard" className="text-red-400 hover:text-red-300 underline text-sm">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <SEO page="invoice" />

            <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4">
                <div className="max-w-2xl mx-auto">

                    {/* Action Bar */}
                    <div className="flex items-center justify-between mb-8 print:hidden">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>

                        <button
                            id="download-invoice-btn"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {downloading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…</>
                                : <><Download className="w-4 h-4" /> Download PDF</>
                            }
                        </button>
                    </div>

                    {/* ── Invoice Document ─────────────────────────────────── */}
                    <motion.div
                        ref={invoiceRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="invoice-document"
                        className="bg-white text-slate-900 shadow-2xl rounded-sm overflow-hidden min-h-[842px] flex flex-col"
                    >
                        {/* ── Header: Logo & Title ── */}
                        <div className="p-10 border-b-4 border-red-600 flex justify-between items-start">
                            <div>
                                <div className="text-3xl font-black text-slate-900 flex items-center gap-2 mb-2">
                                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white text-xl">E</div>
                                    EDUMETRA
                                </div>
                                <div className="text-xs text-slate-500 font-medium space-y-0.5">
                                    <p>Edumetra Educational Services</p>
                                    <p>123 Education Hub, MG Road</p>
                                    <p>Bangalore, Karnataka - 560001</p>
                                    <p>Email: support@edumetra.in</p>
                                    <p>GSTIN: 29AAAAA0000A1Z5 (Sample)</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-5xl font-black text-slate-200 leading-none mb-4">INVOICE</h1>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice Number</p>
                                    <p className="text-lg font-mono font-bold text-slate-900">{invoice.invoice_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Billing Info ── */}
                        <div className="px-10 py-8 grid grid-cols-2 gap-10 bg-slate-50/50">
                            <div>
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-3">Billed To</p>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-slate-900">{invoice.user_name || 'Valued Customer'}</p>
                                    <p className="text-sm text-slate-600">{invoice.user_email}</p>
                                    {invoice.user_phone && <p className="text-sm text-slate-600">{invoice.user_phone}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Issue Date</p>
                                    <p className="text-sm font-bold text-slate-900">{formatDate(invoice.issued_at)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Payment Status</p>
                                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Paid
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Billing Period</p>
                                    <p className="text-sm font-bold text-slate-900">{invoice.billing_period}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Items Table ── */}
                        <div className="px-10 py-6 flex-grow">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="py-4 text-left text-xs font-black text-slate-900 uppercase tracking-widest">Description</th>
                                        <th className="py-4 text-right text-xs font-black text-slate-900 uppercase tracking-widest">Qty</th>
                                        <th className="py-4 text-right text-xs font-black text-slate-900 uppercase tracking-widest">Price</th>
                                        <th className="py-4 text-right text-xs font-black text-slate-900 uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="py-6">
                                            <p className="text-sm font-bold text-slate-900">{planDisplayName(invoice.plan_type)}</p>
                                            <p className="text-xs text-slate-500 mt-1">Full access to Edumetra Premium features.</p>
                                        </td>
                                        <td className="py-6 text-right text-sm text-slate-600">1</td>
                                        <td className="py-6 text-right text-sm text-slate-600">₹{formatINR(invoice.amount_inr ?? invoice.amount_paise / 100)}</td>
                                        <td className="py-6 text-right text-sm font-bold text-slate-900">₹{formatINR(invoice.amount_inr ?? invoice.amount_paise / 100)}</td>
                                    </tr>
                                    
                                    {/* Taxes / Discounts */}
                                    {Number(invoice.discount_paise || 0) > 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-3 text-right text-xs font-bold text-slate-500">Discount</td>
                                            <td className="py-3 text-right text-sm font-bold text-emerald-600">-₹{formatINR(invoice.discount_inr ?? invoice.discount_paise / 100)}</td>
                                        </tr>
                                    )}
                                    {Number(invoice.tax_paise || 0) > 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-3 text-right text-xs font-bold text-slate-500">GST (18%)</td>
                                            <td className="py-3 text-right text-sm font-bold text-slate-900">₹{formatINR(invoice.tax_inr ?? invoice.tax_paise / 100)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Summary & Footer ── */}
                        <div className="mt-auto">
                            <div className="flex justify-end px-10 py-8 bg-slate-900 text-white">
                                <div className="w-64 space-y-4">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="text-xs uppercase font-bold tracking-widest">Total Paid</span>
                                        <span className="text-xl font-black text-white">₹{formatINR(invoice.total_inr ?? invoice.total_paise / 100)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-700">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Razorpay ID</p>
                                        <p className="text-[10px] font-mono text-slate-300 break-all">{invoice.razorpay_payment_id}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-10 flex justify-between items-end border-t border-slate-100">
                                <div className="text-[10px] text-slate-400 space-y-1">
                                    <p className="font-bold text-slate-500">Important Note:</p>
                                    <p>This is a computer-generated receipt and does not require a physical signature.</p>
                                    <p>For support, please contact us at support@edumetra.in</p>
                                </div>
                                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    Thank you for your business
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Download Again (below invoice) */}
                    <div className="mt-6 flex justify-center print:hidden">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                        >
                            {downloading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…</>
                                : <><Download className="w-4 h-4" /> Download Invoice as PDF</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Minimal print fallback styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-document, #invoice-document * { visibility: visible; }
                    #invoice-document { position: absolute; left: 0; top: 0; width: 100%; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </>
    );
};

export default InvoicePage;
