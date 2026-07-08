'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/lib/accounts/logout';

type SidebarRole = 'employee' | 'manager';

type SidebarProps = {
  role: SidebarRole;
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const basePath = `/dashboard/${role}`;

  const mainLinks =
    role === 'manager'
      ? [
          { name: 'Dashboard', href: basePath },
          { name: 'Messages', href: `${basePath}/messages` },
          { name: 'Manage Employees', href: `${basePath}/manage-employees` },
        ]
      : [
          { name: 'Dashboard', href: basePath },
          { name: 'Messages', href: `${basePath}/messages` },
          { name: 'Request Time Off', href: `${basePath}/request-time-off` },
        ];

  const generalLinks = [
    { name: 'Settings', href: `${basePath}/settings` },
    { name: 'Help', href: `${basePath}/help` },
  ];

  const linkClass = (href: string) => {
    const isActive = pathname === href;

    return `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-purple-500 text-white'
        : 'text-gray-700 hover:bg-gray-200 hover:text-black'
    }`;
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-300 bg-white px-4 py-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-black">Scheduler</h1>
        <p className="text-sm capitalize text-gray-500">{role}</p>
      </div>

      <nav className="flex flex-1 flex-col justify-between">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Menu
          </p>

          <div className="flex flex-col gap-1">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            General
          </p>

          <div className="flex flex-col gap-1">
            {generalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.name}
              </Link>
            ))}

            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-red-100 hover:text-red-600"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
    </aside>
  );
}