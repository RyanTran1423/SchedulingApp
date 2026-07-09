import Sidebar from '@/app/ui/sidebar';
import { getUser } from '@/app/lib/accounts/get-user';
import { redirect } from 'next/navigation';

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'manager') {
    redirect('/login');
    // Or redirect('/dashboard/employee') if you want to send employees to their dashboard
  }

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