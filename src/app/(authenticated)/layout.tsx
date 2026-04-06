import SessionProvider from "@/components/SessionProvider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-slate-50 print:p-0 print:bg-white">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
