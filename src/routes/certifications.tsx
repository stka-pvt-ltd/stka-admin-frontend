import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminCertifications,
  useCreateCertification,
  useUpdateCertification,
  useDeleteCertification,
} from "@/hooks/use-admin-queries";
import type { CertificationResponse, CertificationRequest } from "@/types/api";
import {
  Plus,
  Pencil,
  Trash2,
  Award,
  Loader2,
  AlertCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";

export const Route = createFileRoute("/certifications")({
  head: () => ({
    meta: [{ title: "Certifications | STKA Admin" }],
  }),
  component: AdminCertificationsPage,
});

function AdminCertificationsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: pageData, isLoading, error } = useAdminCertifications({
    pageNumber: page,
    pageSize,
    sortBy: "id",
    sortOrder: "asc",
  });

  const certs = pageData?.content ?? [];
  const totalPages = pageData?.totalPage ?? 1;

  const createCertMutation = useCreateCertification();
  const updateCertMutation = useUpdateCertification();
  const deleteCertMutation = useDeleteCertification();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationResponse | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CertificationRequest>({
    title: "",
    issuingAuthority: "",
    certificateNumber: "",
    issuedAt: "",
    expireAt: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCert(null);
    setFormData({
      title: "",
      issuingAuthority: "",
      certificateNumber: "",
      issuedAt: "",
      expireAt: "",
      description: "",
    });
    setSelectedFiles([]);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (cert: CertificationResponse) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title || "",
      issuingAuthority: cert.issuingAuthority || "",
      certificateNumber: cert.certificateNumber || "",
      issuedAt: cert.issuedAt || "",
      expireAt: cert.expireAt || "",
      description: cert.description || "",
    });
    setSelectedFiles([]);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Title is required (max 150 characters).");
      return;
    }
    if (!formData.issuingAuthority.trim()) {
      setFormError("Issuing authority is required (max 150 characters).");
      return;
    }
    if (!formData.certificateNumber.trim()) {
      setFormError("Certificate number is required (max 100 characters).");
      return;
    }
    if (!formData.issuedAt) {
      setFormError("Issued date is required.");
      return;
    }
    if (!formData.expireAt) {
      setFormError("Expiry date is required.");
      return;
    }
    if (new Date(formData.expireAt) <= new Date(formData.issuedAt)) {
      setFormError("Expiry date must be after issued date.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    try {
      if (editingCert) {
        await updateCertMutation.mutateAsync({
          id: editingCert.id,
          data: formData,
          files: selectedFiles.length > 0 ? selectedFiles : undefined,
        });
        setSuccessMsg("Certification updated successfully.");
      } else {
        await createCertMutation.mutateAsync({
          data: formData,
          files: selectedFiles.length > 0 ? selectedFiles : undefined,
        });
        setSuccessMsg("Certification created successfully.");
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save certification.");
    }
  };

  const handleDelete = async () => {
    if (!deletingCertId) return;
    try {
      await deleteCertMutation.mutateAsync(deletingCertId);
      setDeletingCertId(null);
      setSuccessMsg("Certification deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete certification.");
    }
  };

  return (
    <AdminLayout
      title="Certifications & Accreditations"
      subtitle="Manage regulatory compliance and quality assurance certificates"
      actions={
        <Button onClick={openCreateModal} className="gap-1.5 text-xs font-medium">
          <Plus className="h-4 w-4" /> Add Certification
        </Button>
      }
    >
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">×</button>
        </div>
      )}

      <div className="bg-background rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive text-sm flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <span>Failed to load certifications. Please try again.</span>
          </div>
        ) : certs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-3">
            <Award className="h-8 w-8 mx-auto text-slate-400" />
            <p>No certifications have been added yet.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Certification
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Preview</TableHead>
                    <TableHead className="text-xs">Certification Title</TableHead>
                    <TableHead className="text-xs">Issuing Authority</TableHead>
                    <TableHead className="text-xs">Certificate #</TableHead>
                    <TableHead className="text-xs">Issued Date</TableHead>
                    <TableHead className="text-xs">Expiry Date</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.map((cert) => {
                    const firstImage = cert.certificateImages && cert.certificateImages.length > 0 ? cert.certificateImages[0] : null;
                    return (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 border overflow-hidden flex items-center justify-center shrink-0">
                            {firstImage ? (
                              <img src={firstImage.imageUrl} alt={cert.title} className="h-full w-full object-contain" />
                            ) : (
                              <Award className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">{cert.title}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{cert.issuingAuthority}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{cert.certificateNumber || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{cert.issuedAt || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{cert.expireAt || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(cert)} className="h-8 w-8 text-slate-600 hover:text-foreground">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingCertId(cert.id)} className="h-8 w-8 text-slate-600 hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-muted-foreground">
                <span>
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="h-8 gap-1 text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 gap-1 text-xs"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                {editingCert ? <Pencil className="h-4 w-4" /> : <Award className="h-4 w-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingCert ? "Edit Certification" : "Add Certification"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Enter official accreditation details and upload document images.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="max-h-[calc(85vh-9rem)] overflow-y-auto px-6 py-5 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <FormSection title="Accreditation Details">
                <FormField label="Certification Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. WHO-GMP Compliance Certificate"
                    maxLength={150}
                    required
                  />
                </FormField>

                <FormField label="Issuing Authority" required>
                  <Input
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, issuingAuthority: e.target.value }))}
                    placeholder="e.g. World Health Organization / CDSCO"
                    maxLength={150}
                    required
                  />
                </FormField>

                <FormField label="Certificate Number" required>
                  <Input
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, certificateNumber: e.target.value }))}
                    placeholder="e.g. GMP-2024-889"
                    maxLength={100}
                    required
                  />
                </FormField>

                <FormGrid cols={2}>
                  <FormField label="Issued Date" required>
                    <Input
                      type="date"
                      value={formData.issuedAt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, issuedAt: e.target.value }))}
                      required
                    />
                  </FormField>

                  <FormField label="Expiry Date" required>
                    <Input
                      type="date"
                      value={formData.expireAt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expireAt: e.target.value }))}
                      required
                    />
                  </FormField>
                </FormGrid>

                <FormField label="Description" required>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Scope, standard specifications, and regulatory details..."
                    className="min-h-[90px]"
                    required
                  />
                </FormField>
              </FormSection>

              <FormSection title="Certificate Images">
                {editingCert && editingCert.certificateImages && editingCert.certificateImages.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Existing Images:</span>
                    <div className="flex flex-wrap gap-2">
                      {editingCert.certificateImages.map((img) => (
                        <div key={img.id} className="h-16 w-16 rounded-lg border bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                          <img src={img.imageUrl} alt="Certificate" className="h-full w-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-600 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-900/30">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <Upload className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} file(s) selected`
                        : "Click to upload certificate document image(s)"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Supports PNG, JPG, WEBP (Max 5MB each)</span>
                  </div>
                </div>
              </FormSection>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCertMutation.isPending || updateCertMutation.isPending}
                className="text-xs h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm px-5"
              >
                {createCertMutation.isPending || updateCertMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Certification"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingCertId)}
        onOpenChange={(open) => !open && setDeletingCertId(null)}
        title="Delete Certification?"
        description="This certification will be permanently removed from the website. This action cannot be undone."
        confirmLabel="Delete Certification"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteCertMutation.isPending}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
