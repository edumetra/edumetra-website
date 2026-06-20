import React from 'react';
import { Info } from 'lucide-react';

const OptInNotice = () => {
    return (
        <div className="flex items-start gap-3 p-4 bg-primary-900/20 border border-primary-500/30 rounded-lg text-slate-300 text-sm my-4">
            <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <p>
                By clicking submit, I agree to the terms & conditions and privacy policy and I am giving my consent to receive updates through SMS/email/RCS/WhatsApp
            </p>
        </div>
    );
};

export default OptInNotice;
