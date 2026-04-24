import CustomerLayout from "../customer-layout";
import PageHeader from "@/components/PageHeader";
import Cart from "@/components/customer/Cart";

export default function CartPage() {
    return (
        <CustomerLayout>
            <PageHeader title="Your Cart" />
            <Cart />
        </CustomerLayout>
    )
}
