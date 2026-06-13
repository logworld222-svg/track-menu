import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PracticeMenuPaneProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

export function PracticeMenuPane({
  title,
  className,
  children,
}: PracticeMenuPaneProps) {
  return (
    <Card className={cn("flex h-full min-h-48 flex-col lg:min-h-0", className)}>
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-4">{children}</CardContent>
    </Card>
  );
}
