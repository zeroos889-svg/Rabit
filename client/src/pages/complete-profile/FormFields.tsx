import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload } from "lucide-react";
import { FaLinkedin, FaXTwitter } from "react-icons/fa6";

interface SelectOption {
  value: string;
  labelAr: string;
  labelEn: string;
}

// Profile Picture Upload Component
interface ProfilePictureProps {
  profilePicture: string;
  isArabic: boolean;
  icon: React.ReactNode;
  shape?: "circle" | "rounded";
  label?: string;
}

export function ProfilePictureUpload({ 
  profilePicture, 
  isArabic, 
  icon,
  shape = "circle",
  label
}: Readonly<ProfilePictureProps>) {
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const defaultLabel = label || (isArabic ? "انقر لتحميل صورة" : "Click to upload photo");
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={`w-24 h-24 ${shapeClass} bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center`}>
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className={`w-full h-full ${shapeClass} object-cover`}
            />
          ) : (
            icon
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
      <p className="text-sm text-gray-500">{defaultLabel}</p>
    </div>
  );
}

// Bio/Description Field Component
interface BioFieldProps {
  value: string;
  onChange: (value: string) => void;
  isArabic: boolean;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function BioField({ value, onChange, isArabic, label, placeholder, rows = 3 }: Readonly<BioFieldProps>) {
  const defaultLabel = label || (isArabic ? "نبذة عنك" : "About You");
  const defaultPlaceholder = placeholder || (isArabic ? "اكتب نبذة مختصرة عن نفسك..." : "Write a brief bio about yourself...");
  
  return (
    <div className="space-y-2">
      <Label>{defaultLabel}</Label>
      <Textarea
        placeholder={defaultPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}

// City Select Component
interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  isArabic: boolean;
  cities: SelectOption[];
}

export function CitySelect({ value, onChange, isArabic, cities }: Readonly<CitySelectProps>) {
  return (
    <div className="space-y-2">
      <Label>{isArabic ? "المدينة" : "City"}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={isArabic ? "اختر المدينة" : "Select city"} />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.value} value={city.value}>
              {isArabic ? city.labelAr : city.labelEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Social Links Component
interface SocialLinksProps {
  linkedIn: string;
  twitter: string;
  onLinkedInChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  isArabic: boolean;
  showTwitter?: boolean;
}

export function SocialLinks({ 
  linkedIn, 
  twitter, 
  onLinkedInChange, 
  onTwitterChange, 
  isArabic: _isArabic,
  showTwitter = true 
}: Readonly<SocialLinksProps>) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FaLinkedin className="w-4 h-4" />
          LinkedIn
        </Label>
        <Input
          placeholder="https://linkedin.com/in/..."
          value={linkedIn}
          onChange={(e) => onLinkedInChange(e.target.value)}
          dir="ltr"
        />
      </div>
      {showTwitter && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FaXTwitter className="w-4 h-4" />
            X (Twitter)
          </Label>
          <Input
            placeholder="@username"
            value={twitter}
            onChange={(e) => onTwitterChange(e.target.value)}
            dir="ltr"
          />
        </div>
      )}
    </div>
  );
}

// Generic Select Field
interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  isArabic: boolean;
  label: string;
  labelAr: string;
  placeholder: string;
  placeholderAr: string;
  options: SelectOption[];
}

export function SelectField({ 
  value, 
  onChange, 
  isArabic, 
  label, 
  labelAr, 
  placeholder,
  placeholderAr,
  options 
}: Readonly<SelectFieldProps>) {
  return (
    <div className="space-y-2">
      <Label>{isArabic ? labelAr : label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={isArabic ? placeholderAr : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {isArabic ? opt.labelAr : opt.labelEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Tags Input Component (for Skills/Certifications)
interface TagsInputProps {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
  isArabic: boolean;
  label: string;
  labelAr: string;
  placeholder: string;
  placeholderAr: string;
}

export function TagsInput({
  tags,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  isArabic,
  label,
  labelAr,
  placeholder,
  placeholderAr,
}: Readonly<TagsInputProps>) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{isArabic ? labelAr : label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={isArabic ? placeholderAr : placeholder}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="outline" onClick={onAdd}>
          {isArabic ? "إضافة" : "Add"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="cursor-pointer hover:bg-red-100"
            onClick={() => onRemove(tag)}
          >
            {tag} ×
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Resume Upload Component
interface ResumeUploadProps {
  isArabic: boolean;
}

export function ResumeUpload({ isArabic }: Readonly<ResumeUploadProps>) {
  return (
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
  );
}

// Text Input with Icon
interface InputWithIconProps {
  value: string;
  onChange: (value: string) => void;
  isArabic: boolean;
  label: string;
  labelAr: string;
  placeholder: string;
  placeholderAr: string;
  icon: React.ReactNode;
  type?: string;
  dir?: "ltr" | "rtl" | "auto";
}

export function InputWithIcon({
  value,
  onChange,
  isArabic,
  label,
  labelAr,
  placeholder,
  placeholderAr,
  icon,
  type = "text",
  dir = "auto",
}: Readonly<InputWithIconProps>) {
  return (
    <div className="space-y-2">
      <Label>{isArabic ? labelAr : label}</Label>
      <div className="relative">
        <span className="absolute right-3 top-3 h-4 w-4 text-gray-400">
          {icon}
        </span>
        <Input
          type={type}
          placeholder={isArabic ? placeholderAr : placeholder}
          className="pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
        />
      </div>
    </div>
  );
}
