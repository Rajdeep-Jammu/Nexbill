import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
      <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-0">
        {title}
      </h1>
      {children && <div className="flex items-center gap-2 sm:gap-4">{children}</div>}
    </div>
  );
}
