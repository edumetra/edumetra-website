import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Download, FileText, CheckCircle,
    Loader2, AlertCircle, Building2, Mail, Calendar, Hash
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import SEO from '../components/SEO';

const ADMIN_URL = 'https://admin.edumetra.in';

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
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                    >
                        {/* ── Header Band ── */}
                        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-8 py-7">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-white font-black text-4xl tracking-tight leading-none">
                                        INVOICE
                                    </h1>
                                    <p className="text-red-100 text-sm mt-2 font-mono tracking-widest">
                                        {invoice.invoice_number}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-black text-2xl flex items-center justify-end gap-2">
                                        <Building2 className="w-6 h-6" />
                                        Edumetra
                                    </div>
                                    <p className="text-red-100 text-xs mt-1">edumetra.in</p>
                                </div>
                            </div>

                            <div className="mt-5 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <CheckCircle className="w-4 h-4 text-white" />
                                <span className="text-white text-xs font-bold uppercase tracking-wider">
                                    Payment Successful
                                </span>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="p-8 space-y-8">

                            {/* Meta: Billed To + Invoice Details */}
                            <div className="grid grid-cols-2 gap-8">
                                {/* Left — Billed To */}
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
                                        Billed To
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            {invoice.user_name && (
                                                <p className="text-white font-semibold text-sm leading-tight">
                                                    {invoice.user_name}
                                                </p>
                                            )}
                                            <p className="text-slate-300 text-sm break-all">
                                                {invoice.user_email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right — Invoice Meta */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-slate-500 text-xs">Invoice Number</p>
                                            <p className="text-white font-mono font-bold text-sm">
                                                {invoice.invoice_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-slate-500 text-xs">Issue Date</p>
                                            <p className="text-white font-semibold text-sm">
                                                {formatDate(invoice.issued_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-slate-500 text-xs">Billing Period</p>
                                            <p className="text-white font-semibold text-sm">
                                                {invoice.billing_period}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="rounded-xl overflow-hidden border border-slate-800">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-800/60 border-b border-slate-700">
                                            <th className="text-left px-5 py-3 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                                                Description
                                            </th>
                                            <th className="text-right px-5 py-3 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {/* Base Plan */}
                                        <tr>
                                            <td className="px-5 py-4">
                                                <p className="text-white font-semibold">
                                                    {planDisplayName(invoice.plan_type)}
                                                </p>
                                                <p className="text-slate-500 text-xs mt-0.5">
                                                    Monthly subscription · {invoice.billing_period}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-right text-white font-semibold">
                                                ₹{formatINR(invoice.amount_inr ?? invoice.amount_paise / 100)}
                                            </td>
                                        </tr>

                                        {/* Coupon Discount */}
                                        {Number(invoice.discount_paise || 0) > 0 && (
                                            <tr>
                                                <td className="px-5 py-4 text-emerald-400">
                                                    Coupon Discount
                                                </td>
                                                <td className="px-5 py-4 text-right text-emerald-400 font-semibold">
                                                    −₹{formatINR(invoice.discount_inr ?? invoice.discount_paise / 100)}
                                                </td>
                                            </tr>
                                        )}

                                        {/* GST */}
                                        {Number(invoice.tax_paise || 0) > 0 && (
                                            <tr>
                                                <td className="px-5 py-4 text-slate-300">GST (18%)</td>
                                                <td className="px-5 py-4 text-right text-slate-300 font-semibold">
                                                    ₹{formatINR(invoice.tax_inr ?? invoice.tax_paise / 100)}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-800/60 border-t border-slate-700">
                                            <td className="px-5 py-4 text-white font-black text-base">
                                                Total Paid
                                            </td>
                                            <td className="px-5 py-4 text-right text-white font-black text-xl">
                                                ₹{formatINR(invoice.total_inr ?? invoice.total_paise / 100)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Payment Reference */}
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-1.5">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                    Payment Reference
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="text-slate-400 text-xs">Razorpay Payment ID:</span>
                                    <span className="text-white font-mono text-xs break-all">
                                        {invoice.razorpay_payment_id}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="text-slate-400 text-xs">Invoice ID:</span>
                                    <span className="text-white font-mono text-xs break-all">
                                        {invoice.id}
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-800 pt-5 text-center">
                                <p className="text-xs text-slate-600">
                                    This is a computer-generated invoice and does not require a signature.
                                </p>
                                <p className="text-xs text-slate-700 mt-1">
                                    Edumetra © {new Date().getFullYear()} · edumetra.in · All rights reserved.
                                </p>
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
