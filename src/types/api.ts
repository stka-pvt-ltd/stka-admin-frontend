// STKA Backend API TypeScript Contracts for Admin
// Source of truth: com.backend.stka.*

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface UserResponse {
  id: string;
  jwtToken?: string;
  name: string;
  roles: string[];
}

export interface ImageResponse {
  id: string;
  imageUrl: string;
  publicId?: string;
}

export interface ProductRequest {
  productName: string;
  slug: string;
  genericName: string;
  brand: string;
  composition: string;
  strength: string;
  dosageForm: string;
  description: string;
  categoryId: string;
  imageUrls?: string[];
}

export interface ProductResponse {
  id: string;
  productName: string;
  slug: string;
  genericName: string;
  brand: string;
  composition: string;
  strength: string;
  dosageForm: string;
  description: string;
  categoryId: string;
  categoryName: string;
  productImages: ImageResponse[];
}

export interface CategoryRequest {
  categoryName: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

export interface CategoryResponse {
  id: string;
  categoryName: string;
  slug: string;
  description: string;
  categoryImage: ImageResponse | null;
}

export interface CertificationRequest {
  title: string;
  issuingAuthority: string;
  certificateNumber: string;
  issuedAt: string;
  expireAt: string;
  description: string;
}

export interface CertificationResponse {
  id: string;
  title: string;
  issuingAuthority: string;
  certificateNumber: string;
  issuedAt: string;
  expireAt: string;
  description: string;
  certificateImages: ImageResponse[];
}

export interface CompanyInformationRequest {
  companyName: string;
  legalName: string;
  description: string;
  vision: string;
  mission: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompanyInformationResponse {
  id: string;
  companyName: string;
  legalName: string;
  description: string;
  vision: string;
  mission: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  companyLogo: ImageResponse | null;
}

export interface BannerRequest {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface BannerResponse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  displayOrder: number;
  active: boolean;
  image: ImageResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManufacturingRequest {
  title: string;
  description: string;
  displayOrder?: number;
  active?: boolean;
}

export interface ManufacturingResponse {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  active: boolean;
  images: ImageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface JobRequest {
  title: string;
  department?: string;
  location: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | string;
  experience?: string;
  qualification?: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  displayOrder?: number;
  active?: boolean;
  applicationDeadline?: string;
}

export interface JobResponse {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | string;
  experience: string;
  qualification: string;
  description: string;
  responsibilities: string;
  requirements: string;
  displayOrder: number;
  active: boolean;
  applicationDeadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  company?: string;
  message: string;
}

export interface EnquiryResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  company: string;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | string;
  hasAttachment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElement: number;
  totalPage: number;
  lastPage: boolean;
}

export interface APIResponse {
  message: string;
  status: boolean;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}
