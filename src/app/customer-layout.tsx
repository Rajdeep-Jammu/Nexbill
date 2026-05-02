import { CustomerHeader } from "@/components/customer/CustomerHeader";
import CustomerMobileNav from "@/components/customer/CustomerMobileNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <CustomerHeader />
      <main className="flex-1 p-4 pb-24 lg:pb-12">
        <div className="max-w-7xl mx-auto w-full">
            {children}
        </div>
      </main>
      <CustomerMobileNav />
    </div>
  );
}
