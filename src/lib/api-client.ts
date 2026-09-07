import { API_BASE_URL } from "./config";
import type { APIResponse } from "@/types/api";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const TOKEN_KEY = "stka_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeAdminToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getAuthHeaders(isFormData = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json";
  } else {
    headers["Accept"] = "application/json";
  }

  const token = getAdminToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}


export function sanitizeErrorMessage(message: string, status?: number): string {
  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "The requested item could not be found.";
  }

  if (!message) {
    return "Something went wrong while processing your request. Please try again.";
  }

  const lower = message.toLowerCase();

  if (
    lower.includes("postgres") ||
    lower.includes("sqlstate") ||
    lower.includes("hibernate") ||
    lower.includes("jpa") ||
    lower.includes("exception") ||
    lower.includes("table") ||
    lower.includes("constraint") ||
    lower.includes("foreign key") ||
    lower.includes("cloudflare") ||
    lower.includes("r2") ||
    lower.includes("s3") ||
    lower.includes("bucket")
  ) {
    if (status === 409 || lower.includes("duplicate") || lower.includes("already exists")) {
      return "An item with this name or code already exists or is in use. Please check your inputs.";
    }
    return "Something went wrong while processing your request. Please try again.";
  }

  return message;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (data && typeof data === "object") {
      const apiResp = data as APIResponse;
      if (apiResp.message) {
        errorMessage = apiResp.message;
      }
    }
    if (response.status === 401) {
      removeAdminToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("stka:auth:expired"));
      }
    }
    throw new ApiError(sanitizeErrorMessage(errorMessage, response.status), response.status, data);
  }

  return data as T;
}

export const apiClient = {
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: getAuthHeaders(false),
        credentials: "include",
      });
      return await handleResponse<T>(response);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network connection error. Please check your network connection.", 0, err);
    }
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(isFormData),
        credentials: "include",
        body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : null,
      });
      return await handleResponse<T>(response);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network connection error. Please check your network connection.", 0, err);
    }
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(isFormData),
        credentials: "include",
        body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : null,
      });
      return await handleResponse<T>(response);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network connection error. Please check your network connection.", 0, err);
    }
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(isFormData),
        credentials: "include",
        body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : null,
      });
      return await handleResponse<T>(response);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network connection error. Please check your network connection.", 0, err);
    }
  },

  async delete<T>(path: string): Promise<T> {
    const url = `${API_BASE_URL}${path}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(false),
        credentials: "include",
      });
      return await handleResponse<T>(response);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Network connection error. Please check your network connection.", 0, err);
    }
  },

  async downloadBlob(path: string): Promise<Blob> {
    const url = `${API_BASE_URL}${path}`;
    const token = getAdminToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          removeAdminToken();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("stka:auth:expired"));
          }
        }
        throw new ApiError(`Attachment download failed with status ${response.status}`, response.status);
      }

      return await response.blob();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("Failed to download attachment.", 0, err);
    }
  },
};
