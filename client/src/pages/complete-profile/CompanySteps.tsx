import { Building2, MapPin, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { StepProps } from "./types";
import { CITIES, INDUSTRIES, COMPANY_SIZES } from "./constants";
import {
  ProfilePictureUpload,
  BioField,
  CitySelect,
  SelectField,
  InputWithIcon,
} from "./FormFields";

// Step 0: Company Info
function CompanyBasicInfo({ profileData, setProfileData, isArabic }: Readonly<StepProps>) {
  return (
    <div className="space-y-4">
      <ProfilePictureUpload
        profilePicture={profileData.profilePicture}
        isArabic={isArabic}
        icon={<Building2 className="w-12 h-12 text-white" />}
        shape="rounded"
        label={isArabic ? "انقر لتحميل شعار الشركة" : "Click to upload company logo"}
      />

      <BioField
        value={profileData.companyDescription}
        onChange={(value) => setProfileData({ ...profileData, companyDescription: value })}
        isArabic={isArabic}
        label={isArabic ? "وصف الشركة" : "Company Description"}
        placeholder={isArabic ? "اكتب وصفاً موجزاً عن الشركة..." : "Write a brief description about your company..."}
        rows={4}
      />

      <div className="space-y-2">
        <Label>{isArabic ? "سنة التأسيس" : "Founded Year"}</Label>
        <Input
          type="number"
          placeholder={isArabic ? "مثال: 2020" : "e.g. 2020"}
          value={profileData.foundedYear}
          onChange={(e) => setProfileData({ ...profileData, foundedYear: e.target.value })}
          dir="ltr"
        />
      </div>
    </div>
  );
}

// Step 1: Business Details
function CompanyBusinessDetails({ profileData, setProfileData, isArabic }: Readonly<StepProps>) {
  return (
    <div className="space-y-4">
      <SelectField
        value={profileData.industry}
        onChange={(value) => setProfileData({ ...profileData, industry: value })}
        isArabic={isArabic}
        label="Industry"
        labelAr="القطاع"
        placeholder="Select industry"
        placeholderAr="اختر القطاع"
        options={INDUSTRIES}
      />

      <SelectField
        value={profileData.companySize}
        onChange={(value) => setProfileData({ ...profileData, companySize: value })}
        isArabic={isArabic}
        label="Company Size"
        labelAr="حجم الشركة"
        placeholder="Select size"
        placeholderAr="اختر الحجم"
        options={COMPANY_SIZES}
      />

      <CitySelect
        value={profileData.city}
        onChange={(value) => setProfileData({ ...profileData, city: value })}
        isArabic={isArabic}
        cities={CITIES}
      />

      <InputWithIcon
        value={profileData.address}
        onChange={(value) => setProfileData({ ...profileData, address: value })}
        isArabic={isArabic}
        label="Full Address"
        labelAr="العنوان التفصيلي"
        placeholder="District, Street..."
        placeholderAr="الحي، الشارع..."
        icon={<MapPin className="w-4 h-4" />}
      />
    </div>
  );
}

// Step 2: Contact & Links
function CompanyContactLinks({ profileData, setProfileData, isArabic }: Readonly<StepProps>) {
  return (
    <div className="space-y-4">
      <InputWithIcon
        value={profileData.website}
        onChange={(value) => setProfileData({ ...profileData, website: value })}
        isArabic={isArabic}
        label="Website"
        labelAr="الموقع الإلكتروني"
        placeholder="https://..."
        placeholderAr="https://..."
        icon={<Globe className="w-4 h-4" />}
        dir="ltr"
      />

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FaLinkedin className="w-4 h-4" />
          {isArabic ? "صفحة LinkedIn" : "LinkedIn Page"}
        </Label>
        <Input
          placeholder="https://linkedin.com/company/..."
          value={profileData.linkedIn}
          onChange={(e) => setProfileData({ ...profileData, linkedIn: e.target.value })}
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FaXTwitter className="w-4 h-4" />
          X (Twitter)
        </Label>
        <Input
          placeholder="@companyname"
          value={profileData.twitter}
          onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
          dir="ltr"
        />
      </div>
    </div>
  );
}

// Main Company Steps Component
export function CompanySteps({ currentStep, profileData, setProfileData, isArabic }: Readonly<StepProps & { currentStep: number }>) {
  const commonProps = { profileData, setProfileData, isArabic };

  switch (currentStep) {
    case 0:
      return <CompanyBasicInfo {...commonProps} />;
    case 1:
      return <CompanyBusinessDetails {...commonProps} />;
    case 2:
      return <CompanyContactLinks {...commonProps} />;
    default:
      return null;
  }
}
