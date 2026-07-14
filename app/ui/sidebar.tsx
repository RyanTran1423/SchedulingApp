'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/lib/accounts/logout';

type SidebarRole = 'employee' | 'manager';

type SidebarProps = {
  role: SidebarRole;
  userName: string;
};

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const basePath = `/dashboard/${role}`;

  const mainLinks =
    role === 'manager'
      ? [
          { name: 'Dashboard', href: basePath },
          { name: 'Messages', href: `${basePath}/messages` },
          { name: 'Manage Employees', href: `${basePath}/manage-employees` },
          { name: 'Set Org Roles', href: `${basePath}/set-org-roles` },
        ]
      : [
          { name: 'Dashboard', href: basePath },
          { name: 'Messages', href: `${basePath}/messages` },
          { name: 'Request Time Off', href: `${basePath}/request-time-off` },
          { name: 'View Employees', href: `${basePath}/view-employees` },  
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
    <aside className="flex min-h-screen w-80 flex-col border-r border-gray-300 bg-white px-4 py-6">
      
      {/* TOP SECTION */}
      <div className="mb-8 flex items-center justify-between w-full shrink-0">
        <div>
  <h1 className="text-xl font-bold text-black">
    Welcome, {userName}
  </h1>
  <p className="text-sm capitalize text-gray-500">{role}</p>
</div>

        {/* ✅ PROFILE BUTTON */}
        <Link href={`/dashboard/${role}/profile`}>
          <div className="h-10 w-10 rounded-full bg-gray-400 hover:bg-gray-500 transition cursor-pointer flex items-center justify-center text-white font-semibold">
            {userName
  ? userName.charAt(0).toUpperCase()
  : 'P'}
          </div>
        </Link>
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