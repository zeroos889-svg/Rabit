export type UserType = "employee" | "consultant" | "company";

export interface ProfileData {
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

export interface StepProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  isArabic: boolean;
}

export interface Step {
  id: number;
  title: string;
}

export const INITIAL_PROFILE_DATA: ProfileData = {
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
};
