import React from 'react';
import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

const TrustBadges = ({ variant = 'default' }) => {
    const badges = [
        {
            icon: Shield,
            text: 'ISO 9001:2015 Certified',
            color: 'text-red-600'
        },
        {
            icon: Lock,
            text: '100% Secure',
            color: 'text-gray-700'
        },
        {
            icon: Award,
            text: '15+ Years Experience',
            color: 'text-red-500'
        },
        {
            icon: CheckCircle,
            text: 'MCI Approved Partner',
            color: 'text-gray-800'
        }
    ];

    if (variant === 'compact') {
        return (
            <div className="flex flex-wrap items-center justify-center gap-4">
                {badges.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
                        >
                            <Icon className={`w-4 h-4 ${badge.color}`} />
                            <span className="text-xs font-medium text-white">{badge.text}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                    <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                        <Icon className={`w-6 h-6 ${badge.color} flex-shrink-0`} />
                        <span className="text-sm font-medium text-slate-900">{badge.text}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default TrustBadges;
