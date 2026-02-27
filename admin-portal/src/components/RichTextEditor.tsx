"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const QuillEditor = dynamic(() => import("react-quill"), { ssr: false });

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link', 'image', 'video'
    ];

    return (
        <div className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-red-500 ql-editor-wrapper">
            <QuillEditor
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || "Start writing..."}
            />
            <style jsx global>{`
                .ql-editor-wrapper .quill {
                    display: flex;
                    flex-direction: column;
                }
                .ql-editor-wrapper .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #334155; /* slate-700 */
                    background-color: #0f172a; /* slate-950 */
                    padding: 12px;
                }
                .ql-editor-wrapper .ql-container.ql-snow {
                    border: none;
                    background-color: transparent;
                    min-height: 250px;
                    font-size: 14px;
                    color: #f8fafc; /* slate-50 */
                }
                .ql-editor-wrapper .ql-editor.ql-blank::before {
                    color: #64748b; /* slate-500 */
                    font-style: normal;
                }
                .ql-editor-wrapper .ql-snow .ql-stroke {
                    stroke: #cbd5e1; /* slate-300 */
                }
                .ql-editor-wrapper .ql-snow .ql-fill, .ql-editor-wrapper .ql-snow .ql-stroke.ql-fill {
                    fill: #cbd5e1; /* slate-300 */
                }
                .ql-editor-wrapper .ql-snow .ql-picker {
                    color: #cbd5e1; /* slate-300 */
                }
                .ql-editor-wrapper .ql-editor {
                    padding: 16px;
                }
            `}</style>
        </div>
    );
}
