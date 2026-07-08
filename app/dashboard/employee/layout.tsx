import Sidebar from '@/app/ui/sidebar';

export default function EmployeeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f3f3f3]">
      <Sidebar role="employee" />

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}