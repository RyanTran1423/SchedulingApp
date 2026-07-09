'use client';

import { grotesk, inter } from '@/app/ui/fonts';
import { useState } from 'react';
import { login } from '@/app/lib/accounts/login';

export default function LogInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3]">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl bg-gray-300 p-8">
          <h1 className={`${grotesk.className} mb-8 text-center text-2xl font-medium text-black`}>
            Login
          </h1>

          <form action={login} className="flex flex-col gap-4">
            <div className={`${inter.className} flex flex-col gap-1`}>
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
                className="absolute right-185 top-[59%] -translate-y-1/2 text-sm text-purple-500 hover:text-purple-700 cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'} Password
              </button>

            </div>

            <button
              type="submit"
              className={`${inter.className} mt-8 w-full rounded-md bg-purple-500 px-4 py-2 text-white`}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}