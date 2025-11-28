import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  isArabic: boolean;
  isLoading: boolean;
  accentColor: string;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onSubmit: () => void;
}

// Back Button Component
function BackButton({ isArabic, onClick }: Readonly<{ isArabic: boolean; onClick: () => void }>) {
  return (
    <Button type="button" variant="outline" onClick={onClick}>
      {isArabic ? (
        <>
          <ArrowRight className="w-4 h-4 ml-2" />
          السابق
        </>
      ) : (
        <>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </>
      )}
    </Button>
  );
}

// Next Button Component  
function NextButton({ isArabic, accentColor, onClick }: Readonly<{ isArabic: boolean; accentColor: string; onClick: () => void }>) {
  return (
    <Button
      type="button"
      className={`bg-gradient-to-r ${accentColor} text-white`}
      onClick={onClick}
    >
      {isArabic ? (
        <>
          التالي
          <ArrowLeft className="w-4 h-4 mr-2" />
        </>
      ) : (
        <>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
}

// Submit Button Component
function SubmitButton({ 
  isArabic, 
  accentColor, 
  isLoading, 
  onClick 
}: Readonly<{ 
  isArabic: boolean; 
  accentColor: string; 
  isLoading: boolean; 
  onClick: () => void;
}>) {
  return (
    <Button
      type="button"
      className={`bg-gradient-to-r ${accentColor} text-white`}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {isArabic ? "جارٍ الحفظ..." : "Saving..."}
        </div>
      ) : (
        <>
          <Sparkles className="w-4 h-4 ml-2" />
          {isArabic ? "حفظ وإكمال" : "Save & Complete"}
        </>
      )}
    </Button>
  );
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  isArabic,
  isLoading,
  accentColor,
  onBack,
  onNext,
  onSkip,
  onSubmit,
}: Readonly<NavigationButtonsProps>) {
  const isLastStep = currentStep >= totalSteps - 1;
  const showBackButton = currentStep > 0;

  return (
    <div className="flex justify-between mt-8">
      <div>
        {showBackButton && <BackButton isArabic={isArabic} onClick={onBack} />}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onSkip}>
          {isArabic ? "تخطي" : "Skip"}
        </Button>

        {isLastStep ? (
          <SubmitButton
            isArabic={isArabic}
            accentColor={accentColor}
            isLoading={isLoading}
            onClick={onSubmit}
          />
        ) : (
          <NextButton
            isArabic={isArabic}
            accentColor={accentColor}
            onClick={onNext}
          />
        )}
      </div>
    </div>
  );
}
