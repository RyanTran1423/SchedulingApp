'use client';   // Lets us use hooks

import { inter, grotesk } from '@/app/ui/fonts';
import { useState } from 'react';
import { createAccount } from '@/app/lib/actions'

export default function GetStartedPage() {
    const [formData, setFormData] = useState({      // useState: React hook to let components remember data
        name: '',
        email: '',
        password: '',
        role: '',
        organization:''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData({...formData, [field]: value});
    };

    const handleSubmit = () => {
        console.log(formData);
    }

    return(
        <main className="min-h-screen bg-[#f3f3f3]">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="h-155 w-full rounded-xl max-w-lg bg-gray-300 p-8">
                    <h1 className={`${grotesk.className} mb-8 text-center text-2xl font-medium text-black`}>
                        Create an
                        <br />
                        Account
                    </h1>
                    <form action={createAccount} className="flex flex-col gap-4">
                        <div className={`${inter.className} flex flex-col gap-1`}>
                            <label htmlFor="name" className="text-sm text-black">
                                Name
                            </label>
                            <input
                                id="name"
                                name = "name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="h-10 w-full border border-black bg-white px-3 text-black"
                            />
                        </div>

                        <div className={`${inter.className} mt-5 flex flex-col gap-1`}>
                            <label htmlFor="email" className="text-sm text-black">
                                Email
                            </label>
                            <input
                                id="email"
                                name = "email"
                                type="text"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="h-10 w-full border border-black bg-white px-3 text-black"
                            />
                        </div>

                        <div className={`${inter.className} mt-5 flex flex-col gap-1`}>
                            <label htmlFor="password" className="text-sm text-black">
                                Password
                            </label>
                            <input
                                id="password"
                                name = "password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className="h-10 w-full border border-black bg-white px-3 text-black"
                            />
                        </div>

                        <div className={`${inter.className} mt-5 flex flex-col gap-1`}>
                            <label htmlFor="role" className="text-sm text-black">
                                Role
                            </label>
                            <select
                                id="role"
                                name = "role"
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className="h-10 w-28 rounded-md bg-white px-3 text-sm text-gray-500 text-black"
                            >
                                <option value="">Value</option>
                                <option value="manager">Manager</option>
                                <option value= "employee">Employee</option>
                            </select>
                        </div>

                        <div className={`${inter.className} mt-5 flex flex-col gap-1`}>
                            <label htmlFor="organization" className="text-sm text-black">
                                Organization
                            </label>
                            <input
                                id="organization"
                                name = "organization"
                                type="text"
                                value={formData.organization}
                                onChange={(e) => handleInputChange('organization', e.target.value)}
                                className="h-10 w-full border border-black bg-white px-3 text-black"
                            />
                        </div>
                        <button
                            onClick = {handleSubmit}
                            type = "submit"
                            className={`${inter.className} mt-8 w-full bg-purple-500 px-4 py-2 text-white rounded-md`}
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}