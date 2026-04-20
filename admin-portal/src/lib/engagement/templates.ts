export type EngagementTemplate = {
    key: string;
    subject?: string;
    body: string;
};

const templates: Record<string, EngagementTemplate[]> = {
    onboarding_day1_email_v1: [
        {
            key: "A",
            subject: "Finish setup and unlock your first shortlist",
            body: "Hi {{name}}, complete your first key step to get personalized college recommendations today.",
        },
        {
            key: "B",
            subject: "Your profile is almost ready",
            body: "Hi {{name}}, you are one step away from tailored guidance. Complete your setup now.",
        },
    ],
    onboarding_day2_whatsapp_v1: [
        {
            key: "A",
            body: "Hi {{name}}, quick reminder: complete {{pending_action}} to unlock better recommendations.",
        },
    ],
    onboarding_day3_rcs_v1: [
        {
            key: "A",
            body: "Still pending: {{pending_action}}. Finish it now to avoid missing this cycle.",
        },
    ],
    onboarding_day5_email_offer_v1: [
        {
            key: "A",
            subject: "Students like you completed this in minutes",
            body: "Hi {{name}}, complete your first action today and get priority insights for your profile.",
        },
    ],
};

export const resolveTemplate = (templateKey: string, variant = "A"): EngagementTemplate => {
    const versions = templates[templateKey];
    if (!versions?.length) {
        return { key: variant, body: "Hi {{name}}, continue your journey on our platform." };
    }

    return versions.find((v) => v.key === variant) ?? versions[0];
};

export const renderTemplate = (text: string, tokens: Record<string, string | number | null | undefined>): string => {
    return text.replace(/\{\{(.*?)\}\}/g, (_, token: string) => {
        const key = token.trim();
        const value = tokens[key];
        return value === null || value === undefined ? "" : String(value);
    });
};
