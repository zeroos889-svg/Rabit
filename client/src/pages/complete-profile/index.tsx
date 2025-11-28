import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { BackButton } from "@/components/BackButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getDashboardPath } from "@/lib/navigation";

import { UserType, ProfileData, INITIAL_PROFILE_DATA } from "./types";
import { EmployeeSteps } from "./EmployeeSteps";
import { ConsultantSteps } from "./ConsultantSteps";
import { CompanySteps } from "./CompanySteps";
import { getStepsForType, getGradient, getAccentColor, getIcon, getTitle } from "./config";
import { NavigationButtons } from "./NavigationButtons";
import { ProgressIndicator } from "./ProgressIndicator";
import { ProfileHeader, HelpText } from "./ProfileHeader";

// Helper function to update localStorage
function updateLocalStorage() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return;
  
  const user = JSON.parse(userStr);
  user.profileCompleted = true;
  localStorage.setItem("user", JSON.stringify(user));
}

// Helper to get user type from localStorage
function getUserTypeFromStorage(): UserType | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return user.userType as UserType || null;
  } catch {
    return null;
  }
}

export default function CompleteProfile() {
  const { i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isArabic = i18n.language === "ar";

  const [userType, setUserType] = useState<UserType>("employee");
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(INITIAL_PROFILE_DATA);

  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  // Get user data from localStorage
  useEffect(() => {
    const storedUserType = getUserTypeFromStorage();
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  // Update profile mutation
  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic ? "تم حفظ الملف الشخصي بنجاح!" : "Profile saved successfully!"
      );
      updateLocalStorage();
      const dashboardPath = getDashboardPath({ userType });
      setTimeout(() => setLocation(dashboardPath), 1500);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || (isArabic ? "فشل في حفظ الملف الشخصي" : "Failed to save profile"));
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });

  const steps = getStepsForType(userType, isArabic);

  // Skills handlers
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !profileData.skills.includes(trimmed)) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  // Certifications handlers
  const handleAddCertification = () => {
    const trimmed = certInput.trim();
    if (trimmed && !profileData.certifications.includes(trimmed)) {
      setProfileData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, trimmed],
      }));
      setCertInput("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setProfileData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert),
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    updateProfileMutation.mutate({
      bio: profileData.bio,
      city: profileData.city,
      profilePicture: profileData.profilePicture,
      linkedIn: profileData.linkedIn,
      twitter: profileData.twitter,
      metadata: JSON.stringify({
        ...profileData,
        userType,
      }),
    });
  };

  const handleSkip = () => {
    const dashboardPath = getDashboardPath({ userType });
    setLocation(dashboardPath);
  };

  // Render step content based on user type
  const renderStepContent = () => {
    const commonProps = { profileData, setProfileData, isArabic };

    switch (userType) {
      case "employee":
        return (
          <EmployeeSteps
            {...commonProps}
            currentStep={currentStep}
            skillInput={skillInput}
            setSkillInput={setSkillInput}
            handleAddSkill={handleAddSkill}
            handleRemoveSkill={handleRemoveSkill}
          />
        );
      case "consultant":
        return (
          <ConsultantSteps
            {...commonProps}
            currentStep={currentStep}
            certInput={certInput}
            setCertInput={setCertInput}
            handleAddCertification={handleAddCertification}
            handleRemoveCertification={handleRemoveCertification}
          />
        );
      case "company":
        return (
          <CompanySteps
            {...commonProps}
            currentStep={currentStep}
          />
        );
      default:
        return null;
    }
  };

  const gradient = getGradient(userType);
  const accentColor = getAccentColor(userType);
  const icon = getIcon(userType);
  const title = getTitle(userType, isArabic);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} py-12 px-4 sm:px-6 lg:px-8`}>
      <BackButton />

      <div className="max-w-2xl mx-auto">
        <ProfileHeader
          icon={icon}
          title={title}
          accentColor={accentColor}
          isArabic={isArabic}
        />

        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          isArabic={isArabic}
        />

        {/* Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {steps[currentStep]?.title}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "املأ البيانات التالية للمتابعة"
                : "Fill in the following information to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()}>
              {renderStepContent()}

              <NavigationButtons
                currentStep={currentStep}
                totalSteps={steps.length}
                isArabic={isArabic}
                isLoading={isLoading}
                accentColor={accentColor}
                onBack={handleBack}
                onNext={handleNext}
                onSkip={handleSkip}
                onSubmit={handleSubmit}
              />
            </form>
          </CardContent>
        </Card>

        <HelpText isArabic={isArabic} />
      </div>
    </div>
  );
}
