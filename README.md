# STKA Admin Frontend (`stka-admin`)

A production-grade, independent Admin Frontend application for managing content and operational data of the STKA pharmaceutical platform.

## Architecture

- **Deployment Target**: `https://admin.stkapvt.com`
- **Framework**: TanStack Start / TanStack Router + React 19 + TypeScript + Tailwind CSS v4 + Shadcn UI
- **Port (Local)**: `http://localhost:5174`
- **Backend API**: `http://localhost:8080` (Local) / `https://api.stkapvt.com` (Production)

## Environment Variables

Copy `.env.example` to `.env`:

```bash
VITE_API_URL=http://localhost:8080
```

For production deployment:
```bash
VITE_API_URL=https://api.stkapvt.com
```

## Local Development

```bash
npm install
npm run dev
```

The application will start at `http://localhost:5174`.

## Independent Build & Deployment

`stka-admin` is completely decoupled from `stka-pharma-craft` (the public website). You can deploy `stka-admin` independently:

- **Root Directory**: `stka-admin`
- **Build Command**: `npm run build`
- **Output Directory**: `.output` (or Cloudflare Workers / Vercel preset)

## Features Included

- Admin Authentication & Guard (`/login`, JWT handling, 401 interceptor)
- Dashboard Overview (`/`)
- Product Portfolio Management (`/products`)
- Therapeutic Category Management (`/categories`)
- Quality Certifications (`/certifications`)
- Manufacturing Facilities (`/manufacturing`)
- Hero Banners & Promos (`/banners`)
- Career Requisitions (`/jobs`)
- Customer Enquiries & Secure Private PDF Streaming (`/enquiries`)
- Company Information Profile (`/company`)
