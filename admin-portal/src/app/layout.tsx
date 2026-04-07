import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/Sidebar";
import { SecurityProvider } from "@/components/SecurityProvider";
import type { AdminPermissions } from "@/shared/permissions";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Edumetra Admin Portal",
    description: "Manage colleges, cutoffs, and rankings",
    verification: {
        google: "Xy-T0I9WvHWOcUjGkrvU7uuGg-i_UXSOYcTYDZCkA3I",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    // If no authenticated user, render a bare shell — login/denied pages get no sidebar
    if (!user) {
        return (
            <html lang="en" className="dark">
                <head>
                    <Script id="gtm-head" strategy="afterInteractive">
                        {`
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','GTM-5M8W4DBD');
                        `}
                    </Script>
                    <Script id="meta-pixel" strategy="afterInteractive">
                        {`
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window,document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '1476788420642976');
                            fbq('track', 'PageView');
                        `}
                    </Script>
                </head>
                <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
                    <noscript>
                        <iframe
                            src="https://www.googletagmanager.com/ns.html?id=GTM-5M8W4DBD"
                            height="0"
                            width="0"
                            style={{ display: "none", visibility: "hidden" }}
                        />
                    </noscript>
                    <noscript>
                        <img 
                            height="1" 
                            width="1" 
                            style={{ display: "none" }}
                            src="https://www.facebook.com/tr?id=1476788420642976&ev=PageView&noscript=1"
                            alt=""
                        />
                    </noscript>
                    {children}
                </body>
            </html>
        );
    }

    let userRole = "mini_admin";
    let permissions: AdminPermissions = {};

    const { data: adminProfile } = await supabase
        .from("admins")
        .select("role, permissions")
        .eq("id", user.id)
        .single() as { data: { role: string; permissions: AdminPermissions } | null };

    if (adminProfile) {
        userRole = adminProfile.role;
        permissions = adminProfile.permissions ?? {};
    }

    return (
        <html lang="en" className="dark">
            <head>
                <Script id="gtm-head" strategy="afterInteractive">
                    {`
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM-5M8W4DBD');
                    `}
                </Script>
                <Script id="meta-pixel-main" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window,document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '1476788420642976');
                        fbq('track', 'PageView');
                    `}
                </Script>
            </head>
            <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-5M8W4DBD"
                        height="0"
                        width="0"
                        style={{ display: "none", visibility: "hidden" }}
                    />
                </noscript>
                <noscript>
                    <img 
                        height="1" 
                        width="1" 
                        style={{ display: "none" }}
                        src="https://www.facebook.com/tr?id=1476788420642976&ev=PageView&noscript=1"
                        alt=""
                    />
                </noscript>
                <SecurityProvider>
                    <div className="flex h-screen overflow-hidden">
                        <Sidebar
                            userRole={userRole}
                            userEmail={user?.email}
                            permissions={permissions}
                        />
                        <main className="flex-1 overflow-y-auto bg-slate-950">
                            {children}
                        </main>
                    </div>
                </SecurityProvider>
            </body>
        </html>
    );
}
