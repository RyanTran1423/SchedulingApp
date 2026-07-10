import Sidebar from '@/app/ui/sidebar';
import { requireRoleFromCookie } from '@/app/lib/utils/cookie';

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRoleFromCookie('manager');

  return (
    <div className="flex min-h-screen bg-[#f3f3f3]">
      <Sidebar
        role="manager"
        userName={user.name}
      />

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}