import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Link } from "wouter";

interface QuickTool {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: LucideIcon;
  href: string;
  color: string;
  count: number;
}

interface QuickToolsProps {
  tools: QuickTool[];
  isArabic: boolean;
}

function QuickToolCard({ tool, isArabic }: Readonly<{ tool: QuickTool; isArabic: boolean }>) {
  const Icon = tool.icon;
  
  return (
    <Link href={tool.href}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div
            className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl mb-3`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="flex items-center justify-between">
            {isArabic ? tool.title : tool.titleEn}
            <Badge variant="secondary">{tool.count}</Badge>
          </CardTitle>
          <CardDescription>
            {isArabic ? tool.description : tool.descriptionEn}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            {isArabic ? "استخدم الآن" : "Use Now"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export function QuickTools({ tools, isArabic }: Readonly<QuickToolsProps>) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {isArabic ? "الأدوات السريعة" : "Quick Tools"}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <QuickToolCard key={tool.href} tool={tool} isArabic={isArabic} />
        ))}
      </div>
    </div>
  );
}

export type { QuickTool };
