'use client';

import PageHeader from "@/components/PageHeader";
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ReportsPage() {
    return (
        <div>
            <PageHeader title="Reports" />
            <div className="flex h-[60vh] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50">
                <Alert variant="destructive" className="max-w-md">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Feature Temporarily Disabled</AlertTitle>
                    <AlertDescription>
                        The reports feature is currently unavailable due to a recurring permission error. It has been temporarily disabled to prevent the application from crashing.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
