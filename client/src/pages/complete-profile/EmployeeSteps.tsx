import { User, Briefcase } from "lucide-react";
import { StepProps } from "./types";
import { CITIES, EXPERIENCE_OPTIONS, EDUCATION_OPTIONS } from "./constants";
import {
  ProfilePictureUpload,
  BioField,
  CitySelect,
  SocialLinks,
  SelectField,
  TagsInput,
  ResumeUpload,
  InputWithIcon,
} from "./FormFields";

interface EmployeeStepProps extends StepProps {
  skillInput: string;
  setSkillInput: (value: string) => void;
  handleAddSkill: () => void;
  handleRemoveSkill: (skill: string) => void;
}

// Step 0: Basic Info
function EmployeeBasicInfo({ profileData, setProfileData, isArabic }: Readonly<StepProps>) {
  return (
    <div className="space-y-4">
      <ProfilePictureUpload
        profilePicture={profileData.profilePicture}
        isArabic={isArabic}
        icon={<User className="w-12 h-12 text-white" />}
      />

      <BioField
        value={profileData.bio}
        onChange={(value) => setProfileData({ ...profileData, bio: value })}
        isArabic={isArabic}
      />

      <CitySelect
        value={profileData.city}
        onChange={(value) => setProfileData({ ...profileData, city: value })}
        isArabic={isArabic}
        cities={CITIES}
      />

      <SocialLinks
        linkedIn={profileData.linkedIn}
        twitter={profileData.twitter}
        onLinkedInChange={(value) => setProfileData({ ...profileData, linkedIn: value })}
        onTwitterChange={(value) => setProfileData({ ...profileData, twitter: value })}
        isArabic={isArabic}
      />
    </div>
  );
}

// Step 1: Work Experience
function EmployeeWorkExperience({ profileData, setProfileData, isArabic }: Readonly<StepProps>) {
  return (
    <div className="space-y-4">
      <InputWithIcon
        value={profileData.jobTitle}
        onChange={(value) => setProfileData({ ...profileData, jobTitle: value })}
        isArabic={isArabic}
        label="Job Title"
        labelAr="المسمى الوظيفي"
        placeholder="e.g. HR Manager"
        placeholderAr="مثال: مدير موارد بشرية"
        icon={<Briefcase className="w-4 h-4" />}
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
          ["0-1", "1-3", "3-5", "5-10", "10+"].includes(opt.value)
        )}
      />

      <ResumeUpload isArabic={isArabic} />
    </div>
  );
}

// Step 2: Skills & Education
function EmployeeSkillsEducation({ 
  profileData, 
  setProfileData, 
  isArabic,
  skillInput,
  setSkillInput,
  handleAddSkill,
  handleRemoveSkill,
}: Readonly<EmployeeStepProps>) {
  return (
    <div className="space-y-4">
      <TagsInput
        tags={profileData.skills}
        inputValue={skillInput}
        onInputChange={setSkillInput}
        onAdd={handleAddSkill}
        onRemove={handleRemoveSkill}
        isArabic={isArabic}
        label="Skills"
        labelAr="المهارات"
        placeholder="Add a skill..."
        placeholderAr="أضف مهارة..."
      />

      <SelectField
        value={profileData.education}
        onChange={(value) => setProfileData({ ...profileData, education: value })}
        isArabic={isArabic}
        label="Education"
        labelAr="المؤهل العلمي"
        placeholder="Select education"
        placeholderAr="اختر المؤهل"
        options={EDUCATION_OPTIONS}
      />
    </div>
  );
}

// Main Employee Steps Component
interface EmployeeStepsComponentProps extends EmployeeStepProps {
  currentStep: number;
}

export function EmployeeSteps({
  currentStep,
  profileData,
  setProfileData,
  isArabic,
  skillInput,
  setSkillInput,
  handleAddSkill,
  handleRemoveSkill,
}: Readonly<EmployeeStepsComponentProps>) {
  const commonProps = { profileData, setProfileData, isArabic };

  switch (currentStep) {
    case 0:
      return <EmployeeBasicInfo {...commonProps} />;
    case 1:
      return <EmployeeWorkExperience {...commonProps} />;
    case 2:
      return (
        <EmployeeSkillsEducation
          profileData={profileData}
          setProfileData={setProfileData}
          isArabic={isArabic}
          skillInput={skillInput}
          setSkillInput={setSkillInput}
          handleAddSkill={handleAddSkill}
          handleRemoveSkill={handleRemoveSkill}
        />
      );
    default:
      return null;
  }
}
