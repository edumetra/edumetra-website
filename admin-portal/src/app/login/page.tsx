import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default function Login({
    searchParams,
}: {
    searchParams: { message: string };
}) {
    const signIn = async (formData: FormData) => {
        "use server";

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return redirect("/login?message=Could not authenticate user");
        }

        return redirect("/");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-2">
            <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
            <form
                className="flex w-full max-w-md flex-col gap-4"
                action={signIn}
            >
                <input
                    className="rounded-md border p-2"
                    name="email"
                    placeholder="admin@example.com"
                    required
                />
                <input
                    className="rounded-md border p-2"
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                />
                <button className="rounded-md bg-blue-600 p-2 text-white">
                    Sign In
                </button>
                {searchParams?.message && (
                    <p className="p-4 text-center text-red-600">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    );
}
