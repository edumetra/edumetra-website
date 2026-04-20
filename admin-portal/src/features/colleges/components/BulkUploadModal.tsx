"use client";

import { useState, useRef } from "react";
import * as xlsx from "xlsx";
import { Upload, X, AlertCircle, CheckCircle2, FileSpreadsheet, Download } from "lucide-react";
import { processBulkColleges } from "@/app/actions/bulkUpload";

export default function BulkUploadModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = xlsx.read(data, { type: "array" });

                    if (workbook.SheetNames.length === 0) {
                        throw new Error("No sheets found in the Excel file.");
                    }

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = xlsx.utils.sheet_to_json(worksheet);

                    if (json.length === 0) {
                        throw new Error("The selected sheet is empty.");
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const res = await processBulkColleges(json as any);

                    if (res.error) {
                        setError(res.error);
                    } else {
                        setResult({ inserted: res.inserted || 0, skipped: res.skipped || 0 });
                        setTimeout(() => {
                            onSuccess();
                            handleClose();
                        }, 3000);
                    }
                } catch (err: unknown) {
                    setError("Failed to parse the file: " + (err instanceof Error ? err.message : String(err)));
                } finally {
                    setLoading(false);
                }
            };

            reader.onerror = () => {
                setError("Failed to read the file.");
                setLoading(false);
            };

            reader.readAsArrayBuffer(file);
        } catch (err: unknown) {
            setError("An unexpected error occurred: " + (err instanceof Error ? err.message : String(err)));
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative z-10">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-400" /> Bulk Upload Colleges
                    </h2>
                    <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-blue-400">Need the template?</p>
                            <p className="text-xs text-blue-300/80 mt-1">Download the standard format to ensure data parses correctly.</p>
                        </div>
                        <a
                            href="/sample_colleges_template.xlsx"
                            download
                            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" /> Download Format
                        </a>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-300">Select Excel File (.xlsx)</label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
                        >
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                id="excel-upload"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                <FileSpreadsheet className={`w-10 h-10 ${file ? 'text-emerald-400' : 'text-slate-500'}`} />
                                {file ? (
                                    <div className="text-emerald-400 font-semibold text-sm">
                                        Selected: <span className="text-white">{file.name}</span>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm font-semibold text-slate-300">Click to browse files</p>
                                        <p className="text-xs text-slate-500 mt-1">Supported formats: XLSX, CSV</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Upload Successful!</p>
                                <p className="text-emerald-300/80 mt-1">
                                    Inserted: {result.inserted} entries. <br />
                                    Skipped: {result.skipped} entries (missing names).
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading || !!result}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-red-900/20"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {loading ? "Processing..." : result ? "Processed" : "Start Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
}
