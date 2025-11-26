import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  delay?: number;
  gradient?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  delay = 0,
  gradient = "from-blue-500 to-purple-600"
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Card className={cn("relative overflow-hidden border-0 shadow-xl", className)}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", gradient)} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: "spring" }}
                className="text-3xl font-bold"
              >
                {value}
              </motion.p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className={cn(
                "rounded-lg bg-gradient-to-br p-3",
                gradient
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          </div>
          
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className="mt-4 flex items-center gap-2"
            >
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">عن الشهر الماضي</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MiniStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  className?: string;
}

export function MiniStatCard({
  label,
  value,
  icon: Icon,
  color = "bg-blue-500",
  className
}: MiniStatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-md transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("rounded-full p-2", color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
