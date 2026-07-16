import Sidebar from '@/app/ui/sidebar';
import { requireManager } from '@/app/lib/utils/auth/require-manager';

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireManager();

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