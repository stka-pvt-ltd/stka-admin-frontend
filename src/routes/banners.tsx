import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useToggleBannerActive,
  useDeleteBannerImage,
  useDeleteBanner,
} from "@/hooks/use-admin-queries";
import type { BannerResponse, BannerRequest } from "@/types/api";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ExternalLink,
  Upload,
  X,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/banners")({
  head: () => ({
    meta: [{ title: "Banner Management | STKA Admin" }],
  }),
  component: AdminBannersPage,
});

function AdminBannersPage() {
  const { data: bannerList, isLoading, error } = useAdminBanners();
  const banners = Array.isArray(bannerList) ? bannerList : [];

  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();
  const toggleActiveMutation = useToggleBannerActive();
  const deleteBannerImageMutation = useDeleteBannerImage();
  const deleteBannerMutation = useDeleteBanner();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerResponse | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<BannerRequest>({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    displayOrder: 0,
    active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonUrl: "",
      displayOrder: banners.length,
      active: true,
    });
    setSelectedFile(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (banner: BannerResponse) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      buttonText: banner.buttonText || "",
      buttonUrl: banner.buttonUrl || "",
      displayOrder: banner.displayOrder ?? 0,
      active: banner.active ?? true,
    });
    setSelectedFile(null);
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
    if (formData.buttonText && formData.buttonText.trim() && (!formData.buttonUrl || !formData.buttonUrl.trim())) {
      setFormError("Button URL is required when button text is provided.");
      return;
    }

    try {
      if (editingBanner) {
        await updateBannerMutation.mutateAsync({
          id: editingBanner.id,
          data: formData,
          file: selectedFile,
        });
        setSuccessMsg("Banner updated successfully.");
      } else {
        await createBannerMutation.mutateAsync({
          data: formData,
          file: selectedFile,
        });
        setSuccessMsg("Banner created successfully.");
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save banner.");
    }
  };

  const handleDeleteImage = async () => {
    if (!editingBanner) return;
    try {
      const updated = await deleteBannerImageMutation.mutateAsync(editingBanner.id);
      setEditingBanner(updated);
      setSuccessMsg("Banner image removed successfully.");
    } catch (err: any) {
      setFormError(err.message || "Failed to remove image.");
    }
  };

  const handleDelete = async () => {
    if (!deletingBannerId) return;
    try {
      await deleteBannerMutation.mutateAsync(deletingBannerId);
      setDeletingBannerId(null);
      setSuccessMsg("Banner deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete banner.");
    }
  };

  return (
    <AdminLayout
      title="Promotional Banners"
      subtitle="Manage homepage hero banners, promotional slides, and action buttons"
      actions={
        <Button onClick={openCreateModal} className="gap-1.5 text-xs font-medium">
          <Plus className="h-4 w-4" /> Add Banner
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
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive text-sm flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <span>Failed to load banners. Please try again.</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-3">
            <ImageIcon className="h-8 w-8 mx-auto text-slate-400" />
            <p>No banners added yet.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Banner
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Banner Image</TableHead>
                  <TableHead className="text-xs">Title & Subtitle</TableHead>
                  <TableHead className="text-xs">Action Button</TableHead>
                  <TableHead className="text-xs">Display Order</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="h-12 w-20 rounded-md bg-slate-100 dark:bg-slate-800 border overflow-hidden flex items-center justify-center shrink-0">
                        {banner.image ? (
                          <img src={banner.image.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {banner.title}
                      {banner.subtitle && (
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {banner.subtitle}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {banner.buttonText ? (
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          {banner.buttonText} <ExternalLink className="h-3 w-3 text-slate-400" />
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{banner.displayOrder ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={banner.active}
                          onCheckedChange={() =>
                            toggleActiveMutation.mutate({ id: banner.id, active: !banner.active })
                          }
                          disabled={toggleActiveMutation.isPending}
                        />
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            banner.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {banner.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(banner)} className="h-8 w-8 text-slate-600 hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingBannerId(banner.id)} className="h-8 w-8 text-slate-600 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                {editingBanner ? <Pencil className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingBanner ? "Edit Promotional Banner" : "Add Promotional Banner"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Configure hero banner text, action link, and background graphic.
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

              <FormSection title="Banner Content">
                <FormField label="Banner Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. World-Class Quality Pharmaceutical Formulations"
                    maxLength={150}
                    required
                  />
                </FormField>

                <FormField label="Subtitle">
                  <Input
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g. WHO-GMP & ISO Certified Manufacturing"
                    maxLength={200}
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description displayed on hero carousel..."
                    className="min-h-[80px]"
                    maxLength={1000}
                  />
                </FormField>
              </FormSection>

              <FormSection title="Action Button & Visibility">
                <FormGrid cols={2}>
                  <FormField label="Button Text">
                    <Input
                      value={formData.buttonText || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="e.g. Explore Products"
                      maxLength={50}
                    />
                  </FormField>

                  <FormField label="Button URL">
                    <Input
                      value={formData.buttonUrl || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, buttonUrl: e.target.value }))}
                      placeholder="e.g. /products"
                      maxLength={255}
                    />
                  </FormField>
                </FormGrid>

                <FormGrid cols={2}>
                  <FormField label="Display Order">
                    <Input
                      type="number"
                      value={formData.displayOrder ?? 0}
                      onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      min={0}
                    />
                  </FormField>

                  <div className="space-y-1 flex flex-col justify-end">
                    <div className="flex items-center gap-2.5 h-9 pt-1">
                      <Switch
                        id="active-banner-toggle"
                        checked={formData.active ?? true}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
                      />
                      <Label htmlFor="active-banner-toggle" className="text-xs cursor-pointer">
                        Active / Visible
                      </Label>
                    </div>
                  </div>
                </FormGrid>
              </FormSection>

              <FormSection title="Banner Image">
                {editingBanner && editingBanner.image && (
                  <div className="mb-3 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Banner Image:</span>
                    <div className="h-24 w-full rounded-lg border bg-slate-100 dark:bg-slate-800 overflow-hidden relative group">
                      <img src={editingBanner.image.imageUrl} alt="Banner" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                        title="Remove Image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-600 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-900/30">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <Upload className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {selectedFile ? selectedFile.name : "Click to select banner graphic"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Recommended aspect ratio: 16:9 / 21:9</span>
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
                disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                className="text-xs h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm px-5"
              >
                {createBannerMutation.isPending || updateBannerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Banner"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingBannerId)}
        onOpenChange={(open) => !open && setDeletingBannerId(null)}
        title="Delete Banner?"
        description="This banner will be permanently removed from the website. This action cannot be undone."
        confirmLabel="Delete Banner"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteBannerMutation.isPending}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}

