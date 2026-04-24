import CustomerLayout from "./customer-layout";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/customer/ProductGrid";

export default function CustomerHomePage() {
  return (
    <CustomerLayout>
      <PageHeader title="Our Products" />
      <ProductGrid />
    </CustomerLayout>
  );
}
