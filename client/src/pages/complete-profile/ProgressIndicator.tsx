import { Progress } from "@/components/ui/progress";

interface Step {
  id: number;
  title: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  isArabic: boolean;
}

export function ProgressIndicator({ steps, currentStep, isArabic }: Readonly<ProgressIndicatorProps>) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">
          {isArabic 
            ? `الخطوة ${currentStep + 1} من ${steps.length}` 
            : `Step ${currentStep + 1} of ${steps.length}`}
        </span>
        <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between mt-2">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={`text-xs ${
              index <= currentStep ? "text-primary font-medium" : "text-gray-400"
            }`}
          >
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
}
