'use client';

import { grotesk, inter } from '@/app/ui/fonts';

export default function LogInPage() {
    return (
        <main className="min-h-screen bg-[#f3f3f3]">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-lg rounded-xl bg-gray-300 p-8">
                    <h1 className={`${grotesk.className} mb-8 text-center text-2xl font-medium text-black`}>
                        Login
                    </h1>

                    <div className={`${inter.className} flex flex-col gap-1`}>
                        <label htmlFor="email" className="text-sm text-black">
                            Email
                        </label>
                        <input
                            id="email"
                            className="h-10 w-full border border-black bg-white px-3 text-black"
                        />
                    </div>

                    <div className={`${inter.className} mt-5 flex flex-col gap-1`}>
                        <label htmlFor="password" className="text-sm text-black">
                            Password
                        </label>
                        <input
                            id="password"
                            className="h-10 w-full border border-black bg-white px-3 text-black"
                        />
                    </div>

                    <button
                        // Implement onClick={handleSubmit} later
                        type="submit"
                        className={`${inter.className} mt-8 w-full bg-purple-500 px-4 py-2 text-white rounded-md`}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </main>
    );
}