import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Info,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-4 rounded-full bg-muted p-4"
      >
        <Icon className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {action}
      </motion.div>}
    </motion.div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = "حدث خطأ",
  description = "عذراً، حدث خطأ أثناء تحميل البيانات",
  action
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={XCircle}
      title={title}
      description={description}
      action={action}
      className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
    />
  );
}

interface SuccessStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function SuccessState({
  title,
  description,
  action
}: SuccessStateProps) {
  return (
    <EmptyState
      icon={CheckCircle}
      title={title}
      description={description}
      action={action}
      className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
    />
  );
}

interface WarningStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function WarningState({
  title,
  description,
  action
}: WarningStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={action}
      className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20"
    />
  );
}
