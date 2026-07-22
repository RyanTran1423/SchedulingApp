'use client';

import { useActionState, useState } from 'react';
import { grotesk, inter } from '@/app/ui/fonts';
import {
  login,
  type LoginActionState,
} from '@/app/lib/accounts/login';

const initialState: LoginActionState = {
  error: '',
};

export default function LogInPage() {
  const [state, formAction, isPending] = useActionState(
    login,
    initialState,
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] =
    useState(false);

  function handleInputChange(
    field: 'email' | 'password',
    value: string,
  ): void {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3]">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl bg-gray-300 p-8">
          <h1
            className={`${grotesk.className} mb-8 text-center text-2xl font-medium text-black`}
          >
            Login
          </h1>

          <form
            action={formAction}
            className="flex flex-col gap-4"
          >
            <div
              className={`${inter.className} flex flex-col gap-1`}
            >
              <label
                htmlFor="email"
                className="text-sm text-black"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(event) =>
                  handleInputChange(
                    'email',
                    event.target.value,
                  )
                }
                aria-invalid={Boolean(state?.error)}
                aria-describedby={
                  state?.error
                    ? 'login-error'
                    : undefined
                }
                className="h-10 w-full border border-black bg-white px-3 text-black"
              />
            </div>

            <div
              className={`${inter.className} mt-5 flex flex-col gap-1`}
            >
              <label
                htmlFor="password"
                className="text-sm text-black"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(event) =>
                  handleInputChange(
                    'password',
                    event.target.value,
                  )
                }
                aria-invalid={Boolean(state?.error)}
                aria-describedby={
                  state?.error
                    ? 'login-error'
                    : undefined
                }
                className="h-10 w-full border border-black bg-white px-3 text-black"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                className="mt-2 cursor-pointer self-end text-sm text-purple-500 hover:text-purple-700"
              >
                {showPassword ? 'Hide' : 'Show'} Password
              </button>
            </div>

            {state?.error && (
              <div
                id="login-error"
                role="alert"
                className="rounded-md border border-red-300 bg-red-100 px-3 py-2"
              >
                <p className="text-sm font-medium text-red-700">
                  {state.error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className={`${inter.className} mt-8 w-full rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-300`}
            >
              {isPending ? 'Logging in...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}