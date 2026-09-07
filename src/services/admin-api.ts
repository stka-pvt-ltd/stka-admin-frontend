import { apiClient } from "@/lib/api-client";
import type {
  LoginRequest,
  UserResponse,
  ProductRequest,
  ProductResponse,
  CategoryRequest,
  CategoryResponse,
  CertificationRequest,
  CertificationResponse,
  CompanyInformationRequest,
  CompanyInformationResponse,
  BannerRequest,
  BannerResponse,
  ManufacturingRequest,
  ManufacturingResponse,
  JobRequest,
  JobResponse,
  EnquiryResponse,
  PageResponse,
  APIResponse,
  PaginationParams,
} from "@/types/api";

export const adminAuthApi = {
  async login(credentials: LoginRequest): Promise<UserResponse> {
    return apiClient.post<UserResponse>("/api/v1/auth/login", credentials);
  },
};

export const adminProductsApi = {
  async getAll(params?: PaginationParams): Promise<PageResponse<ProductResponse>> {
    return apiClient.get<PageResponse<ProductResponse>>(
      "/api/v1/public/products",
      params as Record<string, string | number | boolean | undefined> | undefined
    );
  },
  async search(keyword: string, params?: PaginationParams): Promise<PageResponse<ProductResponse>> {
    return apiClient.get<PageResponse<ProductResponse>>("/api/v1/public/products/search", {
      keyword,
      ...params,
    });
  },
  async getById(id: string): Promise<ProductResponse> {
    return apiClient.get<ProductResponse>(`/api/v1/admin/products/${id}`);
  },
  async create(data: ProductRequest): Promise<ProductResponse> {
    return apiClient.post<ProductResponse>("/api/v1/admin/products", data);
  },
  async update(id: string, data: ProductRequest): Promise<ProductResponse> {
    return apiClient.put<ProductResponse>(`/api/v1/admin/products/${id}`, data);
  },
  async uploadImages(id: string, files: File[]): Promise<ProductResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiClient.post<ProductResponse>(`/api/v1/admin/products/${id}/images`, formData);
  },
  async delete(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(`/api/v1/admin/products/${id}`);
  },
};

export const adminCategoriesApi = {
  async getAll(params?: PaginationParams): Promise<PageResponse<CategoryResponse>> {
    return apiClient.get<PageResponse<CategoryResponse>>(
      "/api/v1/public/categories",
      params as Record<string, string | number | boolean | undefined> | undefined
    );
  },
  async getById(id: string): Promise<CategoryResponse> {
    return apiClient.get<CategoryResponse>(`/api/v1/admin/categories/${id}`);
  },
  async create(data: CategoryRequest): Promise<CategoryResponse> {
    return apiClient.post<CategoryResponse>("/api/v1/admin/categories", data);
  },
  async update(id: string, data: CategoryRequest): Promise<CategoryResponse> {
    return apiClient.put<CategoryResponse>(`/api/v1/admin/categories/${id}`, data);
  },
  async uploadImage(id: string, file: File): Promise<CategoryResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.put<CategoryResponse>(`/api/v1/admin/categories/${id}/image`, formData);
  },
  async delete(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(`/api/v1/admin/categories/${id}`);
  },
};

export const adminCompanyInfoApi = {
  async get(): Promise<CompanyInformationResponse | null> {
    try {
      return await apiClient.get<CompanyInformationResponse>("/api/v1/public/company");
    } catch (err: any) {
      if (
        err.status === 404 ||
        err.status === 400 ||
        (err.message && err.message.toLowerCase().includes("not found"))
      ) {
        return null;
      }
      throw err;
    }
  },
  async create(data: CompanyInformationRequest): Promise<CompanyInformationResponse> {
    return apiClient.post<CompanyInformationResponse>("/api/v1/admin/company", data);
  },
  async update(data: CompanyInformationRequest): Promise<CompanyInformationResponse> {
    return apiClient.put<CompanyInformationResponse>("/api/v1/admin/company", data);
  },
  async save(data: CompanyInformationRequest): Promise<CompanyInformationResponse> {
    try {
      return await apiClient.put<CompanyInformationResponse>("/api/v1/admin/company", data);
    } catch (err: any) {
      if (
        err.status === 404 ||
        err.status === 400 ||
        (err.message && err.message.toLowerCase().includes("not found"))
      ) {
        return await apiClient.post<CompanyInformationResponse>("/api/v1/admin/company", data);
      }
      throw err;
    }
  },
  async uploadLogo(file: File): Promise<CompanyInformationResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.put<CompanyInformationResponse>("/api/v1/admin/company/logo", formData);
  },
};

export const adminCertificationsApi = {
  async getAll(params?: PaginationParams): Promise<PageResponse<CertificationResponse>> {
    return apiClient.get<PageResponse<CertificationResponse>>(
      "/api/v1/public/certifications",
      params as Record<string, string | number | boolean | undefined> | undefined
    );
  },
  async getById(id: string): Promise<CertificationResponse> {
    return apiClient.get<CertificationResponse>(`/api/v1/admin/certifications/${id}`);
  },
  async create(data: CertificationRequest): Promise<CertificationResponse> {
    return apiClient.post<CertificationResponse>("/api/v1/admin/certifications", data);
  },
  async update(id: string, data: CertificationRequest): Promise<CertificationResponse> {
    return apiClient.put<CertificationResponse>(`/api/v1/admin/certifications/${id}`, data);
  },
  async uploadImages(id: string, files: File[]): Promise<CertificationResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiClient.post<CertificationResponse>(`/api/v1/admin/certifications/${id}/images`, formData);
  },
  async delete(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(`/api/v1/admin/certifications/${id}`);
  },
};

export const adminManufacturingApi = {
  async getAll(): Promise<ManufacturingResponse[]> {
    return apiClient.get<ManufacturingResponse[]>("/api/v1/admin/manufacturing");
  },
  async getById(id: string): Promise<ManufacturingResponse> {
    return apiClient.get<ManufacturingResponse>(`/api/v1/admin/manufacturing/${id}`);
  },
  async create(data: ManufacturingRequest): Promise<ManufacturingResponse> {
    return apiClient.post<ManufacturingResponse>("/api/v1/admin/manufacturing", data);
  },
  async update(id: string, data: ManufacturingRequest): Promise<ManufacturingResponse> {
    return apiClient.put<ManufacturingResponse>(`/api/v1/admin/manufacturing/${id}`, data);
  },
  async toggleActive(id: string, active: boolean): Promise<ManufacturingResponse> {
    return apiClient.patch<ManufacturingResponse>(`/api/v1/admin/manufacturing/${id}/status?active=${active}`);
  },
  async uploadImage(id: string, file: File): Promise<ManufacturingResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ManufacturingResponse>(`/api/v1/admin/manufacturing/${id}/images`, formData);
  },
  async deleteImage(id: string, imageId: string): Promise<ManufacturingResponse> {
    return apiClient.delete<ManufacturingResponse>(`/api/v1/admin/manufacturing/${id}/images/${imageId}`);
  },
  async delete(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(`/api/v1/admin/manufacturing/${id}`);
  },
};

export const adminBannersApi = {
  async getAll(): Promise<BannerResponse[]> {
    return apiClient.get<BannerResponse[]>("/api/v1/admin/banners");
  },
  async getById(id: string): Promise<BannerResponse> {
    return apiClient.get<BannerResponse>(`/api/v1/admin/banners/${id}`);
  },
  async create(data: BannerRequest): Promise<BannerResponse> {
    return apiClient.post<BannerResponse>("/api/v1/admin/banners", data);
  },
  async update(id: string, data: BannerRequest): Promise<BannerResponse> {
    return apiClient.put<BannerResponse>(`/api/v1/admin/banners/${id}`, data);
  },
  async toggleActive(id: string, active: boolean): Promise<BannerResponse> {
    return apiClient.patch<BannerResponse>(`/api/v1/admin/banners/${id}/status?active=${active}`);
  },
  async uploadImage(id: string, file: File): Promise<BannerResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<BannerResponse>(`/api/v1/admin/banners/${id}/image`, formData);
  },
  async deleteImage(id: string): Promise<BannerResponse> {
    return apiClient.delete<BannerResponse>(`/api/v1/admin/banners/${id}/image`);
  },
  async delete(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(`/api/v1/admin/banners/${id}`);
  },
};

export const adminJobsApi = {
  async getAll(params?: PaginationParams): Promise<PageResponse<JobResponse>> {
    return apiClient.get<PageResponse<JobResponse>>(
      "/api/v1/admin/jobs",
      params as Record<string, string | number | boolean | undefined> | undefined
    );
  },
  async getById(id: string): Promise<JobResponse> {
    return apiClient.get<JobResponse>(`/api/v1/admin/jobs/${id}`);
  },
  async create(data: JobRequest): Promise<JobResponse> {
    return apiClient.post<JobResponse>("/api/v1/admin/jobs", data);
  },
  async update(id: string, data: JobRequest): Promise<JobResponse> {
    return apiClient.put<JobResponse>(`/api/v1/admin/jobs/${id}`, data);
  },
  async toggleActive(id: string, active: boolean): Promise<JobResponse> {
    return apiClient.patch<JobResponse>(`/api/v1/admin/jobs/${id}/active?active=${active}`);
  },
  async delete(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(`/api/v1/admin/jobs/${id}`);
  },
};

export const adminEnquiriesApi = {
  async getAll(params?: PaginationParams & { status?: string; subject?: string; search?: string }): Promise<PageResponse<EnquiryResponse>> {
    return apiClient.get<PageResponse<EnquiryResponse>>(
      "/api/v1/admin/enquiries",
      params as Record<string, string | number | boolean | undefined> | undefined
    );
  },
  async getById(id: string): Promise<EnquiryResponse> {
    return apiClient.get<EnquiryResponse>(`/api/v1/admin/enquiries/${id}`);
  },
  async updateStatus(id: string, status: string): Promise<EnquiryResponse> {
    return apiClient.patch<EnquiryResponse>(`/api/v1/admin/enquiries/${id}/status?status=${encodeURIComponent(status)}`);
  },
  async downloadAttachment(id: string): Promise<Blob> {
    return apiClient.downloadBlob(`/api/v1/admin/enquiries/${id}/attachment`);
  },
  async delete(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(`/api/v1/admin/enquiries/${id}`);
  },
};
