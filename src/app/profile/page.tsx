import CustomerLayout from "../customer-layout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <CustomerLayout>
        <PageHeader title="Profile" />
        <div className="flex items-center justify-center">
            <Card className="w-full max-w-md text-center p-8">
                <CardHeader>
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">Hello, Guest!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Log in or create an account to see your orders and manage your details.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button disabled>Login</Button>
                        <Button variant="secondary" disabled>Sign Up</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-8">
                        Are you a shop owner? <Link href="/admin/login" className="text-primary hover:underline">Go to Admin Panel</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    </CustomerLayout>
  );
}
