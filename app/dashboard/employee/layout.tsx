import Sidebar from '@/app/ui/sidebar';
import { getUser } from '@/app/lib/accounts/get-user';
import { redirect } from 'next/navigation';

export default async function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'employee') {
    redirect('/login');
    // Or redirect('/dashboard/manager') if you want managers sent back to manager dashboard
  }

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