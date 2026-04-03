import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-6 py-6">
      <div className="mx-auto flex min-h-[90vh] max-w-7xl flex-col">
        {/* Top nav */}
        <header className="flex items-center gap-8 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-sm text-white">
            +
          </div>

          <nav className="flex items-center gap-8 text-sm font-semibold text-black">
            <Link href="/help" className="hover:underline">
              Help
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </nav>
        </header>

        {/* Hero section */}
        <section className="flex flex-1 items-center">
          <div className="grid w-full items-center gap-12 md:grid-cols-2">
            {/* Left side */}
            <div className="max-w-md">
              <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-black md:text-6xl">
                Make
                <br />
                scheduling
                <br />
                giga ez
              </h1>

              <div className="flex flex-col items-start gap-2">
                <Link
                  href="/get-started"
                  className="inline-flex items-center gap-2 bg-fuchsia-500 px-4 py-2 text-lg font-bold text-white transition hover:bg-fuchsia-600"
                >
                  Get Started
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="/login"
                  className="text-lg font-semibold text-sky-600 hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>

            {/* Right side image placeholder */}
            <div className="flex justify-center md:justify-end">
              <div className="flex h-[420px] w-full max-w-[420px] items-center justify-center rounded-3xl bg-violet-100 text-center shadow-sm">
                <div>
                  <p className="text-lg font-semibold text-violet-700">
                    Calendar image placeholder
                  </p>
                  <p className="mt-2 text-sm text-violet-500">
                    Replace this with your screenshot later
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}