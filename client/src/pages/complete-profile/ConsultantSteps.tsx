import { Briefcase, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaLinkedin } from "react-icons/fa6";
import { StepProps } from "./types";
import { CITIES, SPECIALTIES, EXPERIENCE_OPTIONS, AVAILABILITY_OPTIONS } from "./constants";
import {
  ProfilePictureUpload,
  BioField,
  CitySelect,
  SelectField,
  TagsInput,
} from "./FormFields";

interface ConsultantStepProps extends StepProps {
  certInput: string;
  setCertInput: (_value: string) => void;
  handleAddCertification: () => void;
  handleRemoveCertification: (_cert: string) => void;
}

// Step 0: Basic Info
function ConsultantBasicInfo({ profileData, setProfileData, isArabic }: Readonly<StepProps>) {
  return (
    <div className="space-y-4">
      <ProfilePictureUpload
        profilePicture={profileData.profilePicture}
        isArabic={isArabic}
        icon={<Briefcase className="w-12 h-12 text-white" />}
      />

      <BioField
        value={profileData.bio}
        onChange={(value) => setProfileData({ ...profileData, bio: value })}
        isArabic={isArabic}
        placeholder={isArabic ? "اكتب نبذة تعريفية عن خبراتك..." : "Write about your expertise..."}
        rows={4}
      />

      <CitySelect
        value={profileData.city}
        onChange={(value) => setProfileData({ ...profileData, city: value })}
        isArabic={isArabic}
        cities={CITIES}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FaLinkedin className="w-4 h-4" />
            LinkedIn
          </Label>
          <Input
            placeholder="https://linkedin.com/in/..."
            value={profileData.linkedIn}
            onChange={(e) => setProfileData({ ...profileData, linkedIn: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {isArabic ? "الموقع الشخصي" : "Portfolio"}
          </Label>
          <Input
            placeholder="https://..."
            value={profileData.portfolio}
            onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

// Step 1: Specialty & Experience
function ConsultantSpecialty({ 
  profileData, 
  setProfileData, 
  isArabic,
  certInput,
  setCertInput,
  handleAddCertification,
  handleRemoveCertification,
}: Readonly<ConsultantStepProps>) {
  return (
    <div className="space-y-4">
      <SelectField
        value={profileData.specialty}
        onChange={(value) => setProfileData({ ...profileData, specialty: value })}
        isArabic={isArabic}
        label="Main Specialty"
        labelAr="التخصص الرئيسي"
        placeholder="Select specialty"
        placeholderAr="اختر التخصص"
        options={SPECIALTIES}
      />

      <SelectField
        value={profileData.yearsOfExperience}
        onChange={(value) => setProfileData({ ...profileData, yearsOfExperience: value })}
        isArabic={isArabic}
        label="Years of Experience"
        labelAr="سنوات الخبرة"
        placeholder="Select"
        placeholderAr="اختر"
        options={EXPERIENCE_OPTIONS.filter(opt => 
          ["1-3", "3-5", "5-10", "10-15", "15+"].includes(opt.value)
        )}
      />

      <TagsInput
        tags={profileData.certifications}
        inputValue={certInput}
        onInputChange={setCertInput}
        onAdd={handleAddCertification}
        onRemove={handleRemoveCertification}
        isArabic={isArabic}
        label="Certifications"
        labelAr="الشهادات المهنية"
        placeholder="e.g. SHRM-CP, CIPD..."
        placeholderAr="مثال: SHRM-CP, CIPD..."
      />
    </div>
  );
}

// Step 2: Pricing & Availability
function ConsultantPricing({ profileData, setProfileData, isArabic }: Readonly<StepProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{isArabic ? "السعر بالساعة (ريال)" : "Hourly Rate (SAR)"}</Label>
        <Input
          type="number"
          placeholder={isArabic ? "مثال: 500" : "e.g. 500"}
          value={profileData.hourlyRate}
          onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
          dir="ltr"
        />
      </div>

      <SelectField
        value={profileData.availability}
        onChange={(value) => setProfileData({ ...profileData, availability: value })}
        isArabic={isArabic}
        label="Availability"
        labelAr="التوافر"
        placeholder="Select"
        placeholderAr="اختر"
        options={AVAILABILITY_OPTIONS}
      />
    </div>
  );
}

// Main Consultant Steps Component
interface ConsultantStepsComponentProps extends ConsultantStepProps {
  currentStep: number;
}

export function ConsultantSteps({
  currentStep,
  profileData,
  setProfileData,
  isArabic,
  certInput,
  setCertInput,
  handleAddCertification,
  handleRemoveCertification,
}: Readonly<ConsultantStepsComponentProps>) {
  const commonProps = { profileData, setProfileData, isArabic };

  switch (currentStep) {
    case 0:
      return <ConsultantBasicInfo {...commonProps} />;
    case 1:
      return (
        <ConsultantSpecialty
          profileData={profileData}
          setProfileData={setProfileData}
          isArabic={isArabic}
          certInput={certInput}
          setCertInput={setCertInput}
          handleAddCertification={handleAddCertification}
          handleRemoveCertification={handleRemoveCertification}
        />
      );
    case 2:
      return <ConsultantPricing {...commonProps} />;
    default:
      return null;
  }
}
