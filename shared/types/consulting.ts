// Consulting Types
export interface ConsultingType {
  id: number;
  nameAr: string;
  nameEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  duration: number;
  price?: number;
  basePriceSAR?: number;
  slaHours?: number;
}

export interface Consultant {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  specialty?: string;
  specialtyAr?: string;
  specialtyEn?: string;
  rating?: number;
  availability?: boolean;
}

export interface Package {
  id: number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price?: number;
  priceSAR?: number;
  duration?: number;
  slaHours?: number;
  features?: string | string[];
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name?: string;
    role?: string;
  };
  token?: string;
  accessToken?: string;
}
