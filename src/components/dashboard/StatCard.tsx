import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  isWarning?: boolean;
};

export default function StatCard({
  title,
  value,
  change,
  icon,
  isWarning = false,
}: StatCardProps) {
  return (
    <Card className="rounded-xl border-border bg-card/50 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl sm:text-3xl font-bold text-foreground">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs mt-1",
              isWarning ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {change} from last week
          </p>
        )}
      </CardContent>
    </Card>
  );
}
