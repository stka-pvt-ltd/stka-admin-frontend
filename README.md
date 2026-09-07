# STKA Admin Dashboard (`stka-admin`)

Independent administrative management web application for STKA Pvt Ltd. Built with React 19, TanStack Start, TanStack Router, TanStack Query, Tailwind CSS v4, and Radix UI / Shadcn UI components.

---

## 1. Overview & Business Purpose

`stka-admin` is a decoupled, secured administration portal that allows authorized STKA staff to manage:
- Pharmaceutical product catalogue entries, strengths, composition, and dosage forms.
- Product categories and therapeutic classifications.
- Quality certificates, issuing authorities, and expiry tracking.
- Manufacturing plant units and equipment specifications.
- Homepage hero banners and promotional notices.
- Career requisitions and job postings.
- Customer enquiries and private PDF resume stream access.
- Dynamic company profile information, address, and geo-location details.

---

## 2. Admin Route Structure

- **`/login`**: Admin login page with credential validation and error messaging.
- **`/`**: Administrative dashboard overview with quick stat summaries and catalogue metrics.
- **`/products`**: Product management list, search, create modal, edit drawer, and deletion dialog.
- **`/categories`**: Therapeutic category management list, creation form, update form, and deletion protection check.
- **`/certifications`**: Regulatory certificate management, issue/expiry dates, and document upload.
- **`/manufacturing`**: Manufacturing unit management and plant facility specifications.
- **`/banners`**: Promotional hero banner management and active status toggles.
- **`/jobs`**: Career vacancy requisitions and position status management.
- **`/enquiries`**: Customer enquiry review table and secure PDF resume/attachment viewer.
- **`/company`**: Company information profile form with dynamic fallback resolution.

---

## 3. Key Administrative Features

- **JWT Authentication Guard**: `AdminAuthGuard` wraps protected routes, restricting access to authenticated sessions only.
- **Session Expiration Event Handling**:
  - A global HTTP `401 Unauthorized` interceptor emits a `stka:auth:expired` event.
  - Registers a listener that instantly invalidates auth state and redirects to `/login` with an informative toast: *"Your session has expired. Please log in again."*
  - Non-401 errors (400, 403, 404, 409, 500, network issues) show contextual error notices without triggering unexpected logouts.
- **Category Business Conflict Safeguard**: Attempting to delete a category containing assigned products triggers an HTTP 409 conflict alert, preventing accidental cascade deletion.
- **Secure PDF Streaming**: Attached enquiry PDF documents are streamed via authenticated admin API calls (`/api/v1/admin/enquiries/{id}/attachment`) with automatic blob URL creation and revoking.

---

## 4. Technology Stack

- **React**: 19.2.0
- **Routing**: TanStack Router `1.170.18`
- **SSR & Bundling**: TanStack Start `1.168.32`, Nitro `3.0.260603-beta`, Vite `8.1.5`
- **Data Fetching & State**: TanStack React Query `5.101.1`
- **UI & Components**: Radix UI primitives, Shadcn UI patterns, Tailwind CSS `4.2.1`
- **Icons & Notifications**: Lucide React `0.575.0`, Sonner `2.0.7`
- **Forms & Schema**: React Hook Form `7.71.2`, Zod `3.24.2`
- **TypeScript**: 5.8.3

---

## 5. Local Setup & Commands

### Prerequisites
- Node.js `20.x` or higher
- `npm` package manager
- Running backend instance at `http://localhost:8080`

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Local Admin Development API Endpoint
VITE_API_URL=http://localhost:8080
```

### Installation & Development Server

```bash
# Install dependencies
npm install

# Start admin development server (Port 5174)
npm run dev
```

The application will start locally at **`http://localhost:5174`**.

### Production Build & Preview

```bash
# Build production bundle
npm run build

# Preview built production output
npm run preview
```

---

## 6. Vercel Deployment Guide

To deploy `stka-admin` as a separate, independent Vercel project:

1. Import the repository in Vercel.
2. Set **Root Directory** to `stka-admin`.
3. Set **Framework Preset** to `Vite` or `Other`.
4. Configure Environment Variable:
   - `VITE_API_URL` = `https://api.stkapvt.com`
5. Click **Deploy**.
6. Attach custom admin production domain: `admin.stkapvt.com`.

---

## 7. Link Back to Monorepo Root

- ⬅️ [Return to Root README](../README.md)
