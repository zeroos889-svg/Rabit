import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  User,
  Briefcase,
  MapPin,
  Globe,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Linkedin,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getDashboardPath } from "@/lib/navigation";

type UserType = "employee" | "consultant" | "company";

interface ProfileData {
  // Common fields
  bio: string;
  city: string;
  profilePicture: string;
  linkedIn: string;
  twitter: string;
  
  // Employee fields
  jobTitle: string;
  yearsOfExperience: string;
  skills: string[];
  education: string;
  resumeUrl: string;
  
  // Consultant fields
  specialty: string;
  certifications: string[];
  hourlyRate: string;
  availability: string;
  portfolio: string;
  
  // Company fields
  companyDescription: string;
  industry: string;
  companySize: string;
  website: string;
  address: string;
  foundedYear: string;
}

const INDUSTRIES = [
  { value: "technology", labelAr: "التقنية", labelEn: "Technology" },
  { value: "healthcare", labelAr: "الرعاية الصحية", labelEn: "Healthcare" },
  { value: "finance", labelAr: "المالية", labelEn: "Finance" },
  { value: "education", labelAr: "التعليم", labelEn: "Education" },
  { value: "retail", labelAr: "التجزئة", labelEn: "Retail" },
  { value: "manufacturing", labelAr: "التصنيع", labelEn: "Manufacturing" },
  { value: "construction", labelAr: "البناء والتشييد", labelEn: "Construction" },
  { value: "hospitality", labelAr: "الضيافة والسياحة", labelEn: "Hospitality" },
  { value: "logistics", labelAr: "اللوجستيات", labelEn: "Logistics" },
  { value: "other", labelAr: "أخرى", labelEn: "Other" },
];

const COMPANY_SIZES = [
  { value: "1-10", labelAr: "1-10 موظفين", labelEn: "1-10 employees" },
  { value: "11-50", labelAr: "11-50 موظف", labelEn: "11-50 employees" },
  { value: "51-200", labelAr: "51-200 موظف", labelEn: "51-200 employees" },
  { value: "201-500", labelAr: "201-500 موظف", labelEn: "201-500 employees" },
  { value: "501-1000", labelAr: "501-1000 موظف", labelEn: "501-1000 employees" },
  { value: "1000+", labelAr: "أكثر من 1000", labelEn: "1000+ employees" },
];

const SPECIALTIES = [
  { value: "recruitment", labelAr: "التوظيف", labelEn: "Recruitment" },
  { value: "compensation", labelAr: "التعويضات والمزايا", labelEn: "Compensation & Benefits" },
  { value: "training", labelAr: "التدريب والتطوير", labelEn: "Training & Development" },
  { value: "labor-law", labelAr: "قانون العمل", labelEn: "Labor Law" },
  { value: "hr-strategy", labelAr: "استراتيجية الموارد البشرية", labelEn: "HR Strategy" },
  { value: "performance", labelAr: "إدارة الأداء", labelEn: "Performance Management" },
  { value: "general", labelAr: "موارد بشرية عامة", labelEn: "General HR" },
];

const CITIES = [
  { value: "riyadh", labelAr: "الرياض", labelEn: "Riyadh" },
  { value: "jeddah", labelAr: "جدة", labelEn: "Jeddah" },
  { value: "dammam", labelAr: "الدمام", labelEn: "Dammam" },
  { value: "mecca", labelAr: "مكة المكرمة", labelEn: "Mecca" },
  { value: "medina", labelAr: "المدينة المنورة", labelEn: "Medina" },
  { value: "khobar", labelAr: "الخبر", labelEn: "Khobar" },
  { value: "tabuk", labelAr: "تبوك", labelEn: "Tabuk" },
  { value: "abha", labelAr: "أبها", labelEn: "Abha" },
  { value: "other", labelAr: "أخرى", labelEn: "Other" },
];

export default function CompleteProfile() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isArabic = i18n.language === "ar";

  const [userType, setUserType] = useState<UserType>("employee");
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: "",
    city: "",
    profilePicture: "",
    linkedIn: "",
    twitter: "",
    jobTitle: "",
    yearsOfExperience: "",
    skills: [],
    education: "",
    resumeUrl: "",
    specialty: "",
    certifications: [],
    hourlyRate: "",
    availability: "",
    portfolio: "",
    companyDescription: "",
    industry: "",
    companySize: "",
    website: "",
    address: "",
    foundedYear: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");

  // Get user data from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userType) {
          setUserType(user.userType as UserType);
        }
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  // Update profile mutation
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic ? "تم حفظ الملف الشخصي بنجاح!" : "Profile saved successfully!"
      );
      // Update local storage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.profileCompleted = true;
        localStorage.setItem("user", JSON.stringify(user));
      }
      // Redirect to dashboard
      const dashboardPath = getDashboardPath(userType);
      setTimeout(() => setLocation(dashboardPath), 1500);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || (isArabic ? "فشل في حفظ الملف الشخصي" : "Failed to save profile"));
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });

  const getSteps = () => {
    switch (userType) {
      case "employee":
        return [
          { id: 0, title: isArabic ? "المعلومات الأساسية" : "Basic Info" },
          { id: 1, title: isArabic ? "الخبرة المهنية" : "Work Experience" },
          { id: 2, title: isArabic ? "المهارات والتعليم" : "Skills & Education" },
        ];
      case "consultant":
        return [
          { id: 0, title: isArabic ? "المعلومات الأساسية" : "Basic Info" },
          { id: 1, title: isArabic ? "التخصص والخبرة" : "Specialty & Experience" },
          { id: 2, title: isArabic ? "التسعير والتواجد" : "Pricing & Availability" },
        ];
      case "company":
        return [
          { id: 0, title: isArabic ? "معلومات الشركة" : "Company Info" },
          { id: 1, title: isArabic ? "تفاصيل النشاط" : "Business Details" },
          { id: 2, title: isArabic ? "التواصل والروابط" : "Contact & Links" },
        ];
      default:
        return [];
    }
  };

  const steps = getSteps();
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleAddSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s) => s !== skill),
    });
  };

  const handleAddCertification = () => {
    if (certInput.trim() && !profileData.certifications.includes(certInput.trim())) {
      setProfileData({
        ...profileData,
        certifications: [...profileData.certifications, certInput.trim()],
      });
      setCertInput("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setProfileData({
      ...profileData,
      certifications: profileData.certifications.filter((c) => c !== cert),
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
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
    const dashboardPath = getDashboardPath(userType);
    setLocation(dashboardPath);
  };

  const renderEmployeeStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border"
                  title={isArabic ? "تحميل صورة" : "Upload photo"}
                  aria-label={isArabic ? "تحميل صورة" : "Upload photo"}
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {isArabic ? "انقر لتحميل صورة" : "Click to upload photo"}
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label>{isArabic ? "نبذة عنك" : "About You"}</Label>
              <Textarea
                placeholder={isArabic ? "اكتب نبذة مختصرة عن نفسك..." : "Write a brief bio about yourself..."}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>{isArabic ? "المدينة" : "City"}</Label>
              <Select
                value={profileData.city}
                onValueChange={(value) => setProfileData({ ...profileData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر المدينة" : "Select city"} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {isArabic ? city.labelAr : city.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Social Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
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
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Label>
                <Input
                  placeholder="@username"
                  value={profileData.twitter}
                  onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {/* Job Title */}
            <div className="space-y-2">
              <Label>{isArabic ? "المسمى الوظيفي" : "Job Title"}</Label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isArabic ? "مثال: مدير موارد بشرية" : "e.g. HR Manager"}
                  className="pr-10"
                  value={profileData.jobTitle}
                  onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                />
              </div>
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label>{isArabic ? "سنوات الخبرة" : "Years of Experience"}</Label>
              <Select
                value={profileData.yearsOfExperience}
                onValueChange={(value) => setProfileData({ ...profileData, yearsOfExperience: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر" : "Select"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">{isArabic ? "أقل من سنة" : "Less than 1 year"}</SelectItem>
                  <SelectItem value="1-3">{isArabic ? "1-3 سنوات" : "1-3 years"}</SelectItem>
                  <SelectItem value="3-5">{isArabic ? "3-5 سنوات" : "3-5 years"}</SelectItem>
                  <SelectItem value="5-10">{isArabic ? "5-10 سنوات" : "5-10 years"}</SelectItem>
                  <SelectItem value="10+">{isArabic ? "أكثر من 10 سنوات" : "10+ years"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label>{isArabic ? "السيرة الذاتية" : "Resume/CV"}</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isArabic ? "اسحب وأفلت ملف PDF أو انقر للتحميل" : "Drag and drop PDF or click to upload"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isArabic ? "الحد الأقصى 5 ميجابايت" : "Max 5MB"}
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Skills */}
            <div className="space-y-2">
              <Label>{isArabic ? "المهارات" : "Skills"}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={isArabic ? "أضف مهارة..." : "Add a skill..."}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" variant="outline" onClick={handleAddSkill}>
                  {isArabic ? "إضافة" : "Add"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label>{isArabic ? "المؤهل العلمي" : "Education"}</Label>
              <Select
                value={profileData.education}
                onValueChange={(value) => setProfileData({ ...profileData, education: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر المؤهل" : "Select education"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">{isArabic ? "ثانوية عامة" : "High School"}</SelectItem>
                  <SelectItem value="diploma">{isArabic ? "دبلوم" : "Diploma"}</SelectItem>
                  <SelectItem value="bachelor">{isArabic ? "بكالوريوس" : "Bachelor's"}</SelectItem>
                  <SelectItem value="master">{isArabic ? "ماجستير" : "Master's"}</SelectItem>
                  <SelectItem value="phd">{isArabic ? "دكتوراه" : "PhD"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderConsultantStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Briefcase className="w-12 h-12 text-white" />
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border"
                  title={isArabic ? "تحميل صورة" : "Upload photo"}
                  aria-label={isArabic ? "تحميل صورة" : "Upload photo"}
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label>{isArabic ? "نبذة عنك" : "About You"}</Label>
              <Textarea
                placeholder={isArabic ? "اكتب نبذة تعريفية عن خبراتك..." : "Write about your expertise..."}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={4}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>{isArabic ? "المدينة" : "City"}</Label>
              <Select
                value={profileData.city}
                onValueChange={(value) => setProfileData({ ...profileData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر المدينة" : "Select city"} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {isArabic ? city.labelAr : city.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Social Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
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

      case 1:
        return (
          <div className="space-y-4">
            {/* Specialty */}
            <div className="space-y-2">
              <Label>{isArabic ? "التخصص الرئيسي" : "Main Specialty"}</Label>
              <Select
                value={profileData.specialty}
                onValueChange={(value) => setProfileData({ ...profileData, specialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر التخصص" : "Select specialty"} />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {isArabic ? spec.labelAr : spec.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label>{isArabic ? "سنوات الخبرة" : "Years of Experience"}</Label>
              <Select
                value={profileData.yearsOfExperience}
                onValueChange={(value) => setProfileData({ ...profileData, yearsOfExperience: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر" : "Select"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3">{isArabic ? "1-3 سنوات" : "1-3 years"}</SelectItem>
                  <SelectItem value="3-5">{isArabic ? "3-5 سنوات" : "3-5 years"}</SelectItem>
                  <SelectItem value="5-10">{isArabic ? "5-10 سنوات" : "5-10 years"}</SelectItem>
                  <SelectItem value="10-15">{isArabic ? "10-15 سنة" : "10-15 years"}</SelectItem>
                  <SelectItem value="15+">{isArabic ? "أكثر من 15 سنة" : "15+ years"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <Label>{isArabic ? "الشهادات المهنية" : "Certifications"}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={isArabic ? "مثال: SHRM-CP, CIPD..." : "e.g. SHRM-CP, CIPD..."}
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCertification())}
                />
                <Button type="button" variant="outline" onClick={handleAddCertification}>
                  {isArabic ? "إضافة" : "Add"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.certifications.map((cert) => (
                  <Badge
                    key={cert}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveCertification(cert)}
                  >
                    {cert} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Hourly Rate */}
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

            {/* Availability */}
            <div className="space-y-2">
              <Label>{isArabic ? "التوافر" : "Availability"}</Label>
              <Select
                value={profileData.availability}
                onValueChange={(value) => setProfileData({ ...profileData, availability: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر" : "Select"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">{isArabic ? "دوام كامل" : "Full-time"}</SelectItem>
                  <SelectItem value="part-time">{isArabic ? "دوام جزئي" : "Part-time"}</SelectItem>
                  <SelectItem value="weekends">{isArabic ? "عطلات نهاية الأسبوع" : "Weekends only"}</SelectItem>
                  <SelectItem value="flexible">{isArabic ? "مرن" : "Flexible"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCompanyStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            {/* Company Logo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt="Logo"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-white" />
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border"
                  title={isArabic ? "تحميل شعار" : "Upload logo"}
                  aria-label={isArabic ? "تحميل شعار" : "Upload logo"}
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {isArabic ? "انقر لتحميل شعار الشركة" : "Click to upload company logo"}
              </p>
            </div>

            {/* Company Description */}
            <div className="space-y-2">
              <Label>{isArabic ? "وصف الشركة" : "Company Description"}</Label>
              <Textarea
                placeholder={isArabic ? "اكتب وصفاً موجزاً عن الشركة..." : "Write a brief description about your company..."}
                value={profileData.companyDescription}
                onChange={(e) => setProfileData({ ...profileData, companyDescription: e.target.value })}
                rows={4}
              />
            </div>

            {/* Founded Year */}
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

      case 1:
        return (
          <div className="space-y-4">
            {/* Industry */}
            <div className="space-y-2">
              <Label>{isArabic ? "القطاع" : "Industry"}</Label>
              <Select
                value={profileData.industry}
                onValueChange={(value) => setProfileData({ ...profileData, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر القطاع" : "Select industry"} />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {isArabic ? ind.labelAr : ind.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label>{isArabic ? "حجم الشركة" : "Company Size"}</Label>
              <Select
                value={profileData.companySize}
                onValueChange={(value) => setProfileData({ ...profileData, companySize: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر الحجم" : "Select size"} />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {isArabic ? size.labelAr : size.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>{isArabic ? "المدينة" : "City"}</Label>
              <Select
                value={profileData.city}
                onValueChange={(value) => setProfileData({ ...profileData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? "اختر المدينة" : "Select city"} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {isArabic ? city.labelAr : city.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>{isArabic ? "العنوان التفصيلي" : "Full Address"}</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isArabic ? "الحي، الشارع..." : "District, Street..."}
                  className="pr-10"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Website */}
            <div className="space-y-2">
              <Label>{isArabic ? "الموقع الإلكتروني" : "Website"}</Label>
              <div className="relative">
                <Globe className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="https://..."
                  className="pr-10"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                {isArabic ? "صفحة LinkedIn" : "LinkedIn Page"}
              </Label>
              <Input
                placeholder="https://linkedin.com/company/..."
                value={profileData.linkedIn}
                onChange={(e) => setProfileData({ ...profileData, linkedIn: e.target.value })}
                dir="ltr"
              />
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
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

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (userType) {
      case "employee":
        return renderEmployeeStep();
      case "consultant":
        return renderConsultantStep();
      case "company":
        return renderCompanyStep();
      default:
        return null;
    }
  };

  const getGradient = () => {
    switch (userType) {
      case "employee":
        return "from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20";
      case "consultant":
        return "from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20";
      case "company":
        return "from-blue-50 via-cyan-50 to-sky-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-cyan-900/20";
      default:
        return "from-gray-50 to-white";
    }
  };

  const getAccentColor = () => {
    switch (userType) {
      case "employee":
        return "from-green-600 to-emerald-600";
      case "consultant":
        return "from-purple-600 to-pink-600";
      case "company":
        return "from-blue-600 to-cyan-600";
      default:
        return "from-gray-600 to-gray-600";
    }
  };

  const getIcon = () => {
    switch (userType) {
      case "employee":
        return <User className="w-8 h-8 text-white" />;
      case "consultant":
        return <Briefcase className="w-8 h-8 text-white" />;
      case "company":
        return <Building2 className="w-8 h-8 text-white" />;
      default:
        return <User className="w-8 h-8 text-white" />;
    }
  };

  const getTitle = () => {
    switch (userType) {
      case "employee":
        return isArabic ? "أكمل ملفك الشخصي" : "Complete Your Profile";
      case "consultant":
        return isArabic ? "أكمل ملفك الاستشاري" : "Complete Your Consultant Profile";
      case "company":
        return isArabic ? "أكمل ملف الشركة" : "Complete Company Profile";
      default:
        return isArabic ? "أكمل ملفك" : "Complete Your Profile";
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getGradient()} py-12 px-4 sm:px-6 lg:px-8`}>
      <BackButton />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getAccentColor()} rounded-2xl mb-4 shadow-lg`}>
            {getIcon()}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className={`bg-gradient-to-r ${getAccentColor()} bg-clip-text text-transparent`}>
              {getTitle()}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic
              ? "أضف المزيد من المعلومات لتحسين ملفك الشخصي"
              : "Add more information to enhance your profile"}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {isArabic ? `الخطوة ${currentStep + 1} من ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
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

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <div>
                  {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
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
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={handleSkip}>
                    {isArabic ? "تخطي" : "Skip"}
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      className={`bg-gradient-to-r ${getAccentColor()} text-white`}
                      onClick={handleNext}
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
                  ) : (
                    <Button
                      type="button"
                      className={`bg-gradient-to-r ${getAccentColor()} text-white`}
                      onClick={handleSubmit}
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
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {isArabic
              ? "يمكنك تعديل هذه المعلومات لاحقاً من إعدادات الحساب"
              : "You can edit this information later from account settings"}
          </p>
        </div>
      </div>
    </div>
  );
}
