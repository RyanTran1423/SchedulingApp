import Sidebar from '@/app/ui/sidebar';
import { requireEmployee } from '@/app/lib/utils/auth/require-employee';

export default async function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireEmployee();

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