'use client';

import { inter, grotesk } from '@/app/ui/fonts';
import { useState } from 'react';
import { createAccount } from '@/app/lib/accounts/signup';

export default function GetStartedPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    organization: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3]">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="h-155 w-full max-w-lg rounded-xl bg-gray-300 p-8">
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
                name="name"
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
                name="email"
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="h-10 w-full border border-black bg-white px-3 text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="mt-2 self-end text-sm text-purple-500 hover:text-purple-700 cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'} Password
              </button>
            </div>

            <div className={`${inter.className} mt-2 flex flex-col gap-1`}>
              <label htmlFor="role" className="text-sm text-black">
                Role
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="h-10 w-28 rounded-md bg-white px-3 text-sm text-black"
              >
                <option value="">Value</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div className={`${inter.className} mt-2 flex flex-col gap-1`}>
              <label htmlFor="organization" className="text-sm text-black">
                Organization
              </label>

              <input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className="h-10 w-full border border-black bg-white px-3 text-black"
              />
            </div>

            <button
              type="submit"
              className={`${inter.className} mt-7 w-full rounded-md bg-purple-500 px-4 py-2 text-white`}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}