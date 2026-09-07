import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminCompanyInfo, useUpdateCompanyInfo, useUploadCompanyLogo } from "@/hooks/use-admin-queries";
import type { CompanyInformationRequest } from "@/types/api";
import {
  Building2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  Upload,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_COMPANY_FORM: CompanyInformationRequest = {
  companyName: "STKA Pharmaceutical",
  legalName: "STKA PVT LTD.",
  description: "STKA Pvt Ltd is a pharmaceutical company focused on the development, manufacturing, and supply of quality pharmaceutical products.",
  vision: "To become a trusted pharmaceutical company delivering quality, reliable, and accessible healthcare solutions.",
  mission: "To provide high-quality pharmaceutical products while maintaining strong standards of quality, integrity, and customer satisfaction.",
  email: "info@stkapvt.com",
  phone: "9625979342",
  address: "Shop No. 1 Hussain House, Tektar",
  city: "Darbhanga",
  state: "Bihar",
  country: "India",
  pinCode: "847306",
  location: "Sh75, Tektar, Bihar 847306, India",
  latitude: 26.278879,
  longitude: 85.850139,
};

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [{ title: "Company Profile Management | STKA Admin" }],
  }),
  component: AdminCompanyPage,
});

function AdminCompanyPage() {
  const { data: companyData, isLoading, error, refetch } = useAdminCompanyInfo();
  const updateCompanyMutation = useUpdateCompanyInfo();
  const uploadLogoMutation = useUploadCompanyLogo();

  const [formData, setFormData] = useState<CompanyInformationRequest>(DEFAULT_COMPANY_FORM);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (companyData) {
      setFormData({
        companyName: companyData.companyName || "",
        legalName: companyData.legalName || "",
        description: companyData.description || "",
        vision: companyData.vision || "",
        mission: companyData.mission || "",
        email: companyData.email || "",
        phone: companyData.phone || "",
        address: companyData.address || "",
        city: companyData.city || "",
        state: companyData.state || "",
        country: companyData.country || "",
        pinCode: companyData.pinCode || "",
        location: companyData.location || "",
        latitude: companyData.latitude,
        longitude: companyData.longitude,
      });
      if (companyData.companyLogo?.imageUrl) {
        setLogoPreview(companyData.companyLogo.imageUrl);
      }
    } else {
      setFormData(DEFAULT_COMPANY_FORM);
    }
  }, [companyData]);

  const handleLogoFileChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    // Basic frontend validations matching backend constraints
    if (!formData.companyName.trim()) {
      setFormError("Company name is required (max 150 characters).");
      return;
    }
    if (!formData.legalName.trim()) {
      setFormError("Legal name is required (max 200 characters).");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (!formData.vision.trim()) {
      setFormError("Vision statement is required.");
      return;
    }
    if (!formData.mission.trim()) {
      setFormError("Mission statement is required.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Email is required.");
      return;
    }
    if (!formData.address.trim()) {
      setFormError("Address is required.");
      return;
    }
    if (!formData.city.trim() || !formData.state.trim() || !formData.country.trim()) {
      setFormError("City, State, and Country are required.");
      return;
    }
    if (!formData.pinCode.trim()) {
      setFormError("Pin code is required.");
      return;
    }

    try {
      await updateCompanyMutation.mutateAsync(formData);
      if (logoFile) {
        await uploadLogoMutation.mutateAsync(logoFile);
        setLogoFile(null);
      }
      setSuccessMsg("Company profile updated successfully.");
    } catch (err: any) {
      setFormError(err.message || "Failed to update company information.");
    }
  };

  return (
    <AdminLayout title="Company Profile" subtitle="Manage corporate identity, vision, mission, contact channels, and map location">
      {isLoading ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Company Profile</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error instanceof Error ? error.message : "Failed to fetch company details from server."}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="gap-2 text-xs border-destructive/30 hover:bg-destructive/10">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {!companyData && (
            <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-xs font-bold">Uninitialized Profile</AlertTitle>
              <AlertDescription className="text-xs">
                Company profile has not been created yet on the server. Please review the details below and click Save Company Profile to initialize the profile.
              </AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-xs font-bold">Success</AlertTitle>
              <AlertDescription className="text-xs">{successMsg}</AlertDescription>
            </Alert>
          )}

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-bold">Update Failed</AlertTitle>
              <AlertDescription className="text-xs">{formError}</AlertDescription>
            </Alert>
          )}

          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Building2 className="h-4 w-4 text-emerald-600" /> BRANDING & CORPORATE IDENTITY
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Company logo and official business names
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormSection title="Company Logo">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="h-24 w-24 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company Logo" className="h-full w-full object-contain p-2" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">Upload New Corporate Logo</Label>
                    <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3 text-center hover:border-emerald-600 transition-colors bg-white dark:bg-slate-900">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex items-center justify-center gap-2 pointer-events-none">
                        <Upload className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {logoFile ? logoFile.name : "Click to select logo file (JPG, PNG)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Company Names">
                <FormGrid cols={2}>
                  <FormField label="Company Name" required>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g. STKA Pharma"
                      maxLength={150}
                      required
                    />
                  </FormField>

                  <FormField label="Legal Name" required>
                    <Input
                      value={formData.legalName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
                      placeholder="e.g. STKA Pharmaceuticals Private Limited"
                      maxLength={200}
                      required
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection title="Company Profile">
                <FormField label="Overview / Description" required>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Comprehensive description of pharmaceutical operations and capabilities..."
                    className="min-h-[100px]"
                    required
                  />
                </FormField>

                <FormGrid cols={2}>
                  <FormField label="Vision Statement" required>
                    <Textarea
                      value={formData.vision}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vision: e.target.value }))}
                      placeholder="Corporate vision statement..."
                      className="min-h-[80px]"
                      required
                    />
                  </FormField>

                  <FormField label="Mission Statement" required>
                    <Textarea
                      value={formData.mission}
                      onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
                      placeholder="Corporate mission statement..."
                      className="min-h-[80px]"
                      required
                    />
                  </FormField>
                </FormGrid>
              </FormSection>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <MapPin className="h-4 w-4 text-emerald-600" /> CONTACT & LOCATION DETAILS
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Official contact channels and geographical location rendered in website footer and Contact map
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormSection title="Contact Channels">
                <FormGrid cols={2}>
                  <FormField label="Email Address" required>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="info@stkapvt.com"
                      required
                    />
                  </FormField>

                  <FormField label="Phone Number" required>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection title="Address Details">
                <FormField label="Street Address" required>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Plot No. 45, GIDC Industrial Estate"
                    required
                  />
                </FormField>

                <FormGrid cols={4}>
                  <FormField label="City" required>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="Ahmedabad"
                      required
                    />
                  </FormField>

                  <FormField label="State" required>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                      placeholder="Gujarat"
                      required
                    />
                  </FormField>

                  <FormField label="Country" required>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                      placeholder="India"
                      required
                    />
                  </FormField>

                  <FormField label="PIN Code" required>
                    <Input
                      value={formData.pinCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pinCode: e.target.value }))}
                      placeholder="380001"
                      required
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection title="Map Location">
                <FormGrid cols={3}>
                  <FormField label="Location Name">
                    <Input
                      value={formData.location || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Corporate Office & Plant"
                      maxLength={255}
                    />
                  </FormField>

                  <FormField label="Latitude (-90 to 90)">
                    <Input
                      type="number"
                      step="any"
                      min={-90}
                      max={90}
                      value={formData.latitude ?? ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFormData((prev) => ({ ...prev, latitude: isNaN(val) ? undefined : val }));
                      }}
                      placeholder="23.0225"
                    />
                  </FormField>

                  <FormField label="Longitude (-180 to 180)">
                    <Input
                      type="number"
                      step="any"
                      min={-180}
                      max={180}
                      value={formData.longitude ?? ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFormData((prev) => ({ ...prev, longitude: isNaN(val) ? undefined : val }));
                      }}
                      placeholder="72.5714"
                    />
                  </FormField>
                </FormGrid>
              </FormSection>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateCompanyMutation.isPending || uploadLogoMutation.isPending}
              className="gap-2 px-6 py-2.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
            >
              {updateCompanyMutation.isPending || uploadLogoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Company Profile
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}

