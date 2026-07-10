import Sidebar from '@/app/ui/sidebar';
import { requireRoleFromCookie } from '@/app/lib/utils/cookie';

export default async function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRoleFromCookie('employee');

  return (
    <div className="flex min-h-screen bg-[#f3f3f3]">
      <Sidebar
        role="employee"
        userName={user.name}
      />

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}