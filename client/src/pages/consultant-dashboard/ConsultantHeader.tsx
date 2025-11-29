import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

interface ConsultantHeaderProps {
  isArabic: boolean;
  welcomeName: string;
}

export function ConsultantHeader({ isArabic, welcomeName }: Readonly<ConsultantHeaderProps>) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? "لوحة التحكم" : "Dashboard"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isArabic
            ? `مرحباً ${welcomeName}`
            : "Welcome to Rabit platform for consultants"}
        </p>
      </div>
      <Link href="/tools">
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Plus className="w-4 h-4 me-2" />
          {isArabic ? "استخدم أداة" : "Use Tool"}
        </Button>
      </Link>
    </div>
  );
}
