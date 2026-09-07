import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminProductsApi,
  adminCategoriesApi,
  adminCompanyInfoApi,
  adminCertificationsApi,
  adminManufacturingApi,
  adminBannersApi,
  adminJobsApi,
  adminEnquiriesApi,
} from "@/services/admin-api";
import type {
  PaginationParams,
  JobRequest,
  CategoryRequest,
  ProductRequest,
  CertificationRequest,
  ManufacturingRequest,
  BannerRequest,
  CompanyInformationRequest,
} from "@/types/api";

// Query Keys
export const ADMIN_QUERY_KEYS = {
  products: ["admin", "products"] as const,
  categories: ["admin", "categories"] as const,
  companyInfo: ["admin", "companyInfo"] as const,
  certifications: ["admin", "certifications"] as const,
  manufacturing: ["admin", "manufacturing"] as const,
  banners: ["admin", "banners"] as const,
  jobs: ["admin", "jobs"] as const,
  enquiries: ["admin", "enquiries"] as const,
};

// --- Products Hooks ---
export function useAdminProducts(params?: PaginationParams) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.products, params],
    queryFn: () => adminProductsApi.getAll(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, files }: { data: ProductRequest; files?: File[] }) => {
      const product = await adminProductsApi.create(data);
      if (files && files.length > 0) {
        return await adminProductsApi.uploadImages(product.id, files);
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, files }: { id: string; data: ProductRequest; files?: File[] }) => {
      const product = await adminProductsApi.update(id, data);
      if (files && files.length > 0) {
        return await adminProductsApi.uploadImages(id, files);
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminProductsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });
    },
  });
}

// --- Categories Hooks ---
export function useAdminCategories(params?: PaginationParams) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.categories, params],
    queryFn: () => adminCategoriesApi.getAll(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, file }: { data: CategoryRequest; file?: File | null }) => {
      const category = await adminCategoriesApi.create(data);
      if (file) {
        return await adminCategoriesApi.uploadImage(category.id, file);
      }
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, file }: { id: string; data: CategoryRequest; file?: File | null }) => {
      const category = await adminCategoriesApi.update(id, data);
      if (file) {
        return await adminCategoriesApi.uploadImage(id, file);
      }
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.categories });
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.products });
    },
  });
}

// --- Company Info Hooks ---
export function useAdminCompanyInfo() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.companyInfo,
    queryFn: () => adminCompanyInfoApi.get(),
  });
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyInformationRequest) => adminCompanyInfoApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.companyInfo });
    },
  });
}

export function useUploadCompanyLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => adminCompanyInfoApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.companyInfo });
    },
  });
}

// --- Certifications Hooks ---
export function useAdminCertifications(params?: PaginationParams) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.certifications, params],
    queryFn: () => adminCertificationsApi.getAll(params),
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, files }: { data: CertificationRequest; files?: File[] }) => {
      const certification = await adminCertificationsApi.create(data);
      if (files && files.length > 0) {
        return await adminCertificationsApi.uploadImages(certification.id, files);
      }
      return certification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.certifications });
    },
  });
}

export function useUpdateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, files }: { id: string; data: CertificationRequest; files?: File[] }) => {
      const certification = await adminCertificationsApi.update(id, data);
      if (files && files.length > 0) {
        return await adminCertificationsApi.uploadImages(id, files);
      }
      return certification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.certifications });
    },
  });
}

export function useUploadCertificationImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      adminCertificationsApi.uploadImages(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.certifications });
    },
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCertificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.certifications });
    },
  });
}

// --- Manufacturing Hooks ---
export function useAdminManufacturing() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.manufacturing,
    queryFn: () => adminManufacturingApi.getAll(),
  });
}

export function useCreateManufacturing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, files }: { data: ManufacturingRequest; files?: File[] }) => {
      let facility = await adminManufacturingApi.create(data);
      if (files && files.length > 0) {
        for (const file of files) {
          facility = await adminManufacturingApi.uploadImage(facility.id, file);
        }
      }
      return facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.manufacturing });
    },
  });
}

export function useUpdateManufacturing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, files }: { id: string; data: ManufacturingRequest; files?: File[] }) => {
      let facility = await adminManufacturingApi.update(id, data);
      if (files && files.length > 0) {
        for (const file of files) {
          facility = await adminManufacturingApi.uploadImage(id, file);
        }
      }
      return facility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.manufacturing });
    },
  });
}

export function useUploadManufacturingImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      adminManufacturingApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.manufacturing });
    },
  });
}

export function useDeleteManufacturingImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: string; imageId: string }) =>
      adminManufacturingApi.deleteImage(id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.manufacturing });
    },
  });
}

export function useToggleManufacturingActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminManufacturingApi.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.manufacturing });
    },
  });
}

export function useDeleteManufacturing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminManufacturingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.manufacturing });
    },
  });
}

// --- Banners Hooks ---
export function useAdminBanners() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.banners,
    queryFn: () => adminBannersApi.getAll(),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, file }: { data: BannerRequest; file?: File | null }) => {
      let banner = await adminBannersApi.create(data);
      if (file) {
        banner = await adminBannersApi.uploadImage(banner.id, file);
      }
      return banner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.banners });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data, file }: { id: string; data: BannerRequest; file?: File | null }) => {
      let banner = await adminBannersApi.update(id, data);
      if (file) {
        banner = await adminBannersApi.uploadImage(id, file);
      }
      return banner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.banners });
    },
  });
}

export function useUploadBannerImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      adminBannersApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.banners });
    },
  });
}

export function useDeleteBannerImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminBannersApi.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.banners });
    },
  });
}

export function useToggleBannerActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminBannersApi.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.banners });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminBannersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.banners });
    },
  });
}

// --- Jobs Hooks ---
export function useAdminJobs(params?: PaginationParams) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.jobs, params],
    queryFn: () => adminJobsApi.getAll(params),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JobRequest) => adminJobsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.jobs });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobRequest }) =>
      adminJobsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.jobs });
    },
  });
}

export function useToggleJobActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminJobsApi.toggleActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.jobs });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminJobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.jobs });
    },
  });
}

// --- Enquiries Hooks ---
export function useAdminEnquiries(params?: PaginationParams & { status?: string; subject?: string; search?: string }) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.enquiries, params],
    queryFn: () => adminEnquiriesApi.getAll(params),
  });
}

export function useUpdateEnquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminEnquiriesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.enquiries });
    },
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminEnquiriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.enquiries });
    },
  });
}
