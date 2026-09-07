import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminManufacturing,
  useCreateManufacturing,
  useUpdateManufacturing,
  useToggleManufacturingActive,
  useDeleteManufacturingImage,
  useDeleteManufacturing,
} from "@/hooks/use-admin-queries";
import type { ManufacturingResponse, ManufacturingRequest } from "@/types/api";
import {
  Plus,
  Pencil,
  Trash2,
  Factory,
  Loader2,
  AlertCircle,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";

export const Route = createFileRoute("/manufacturing")({
  head: () => ({
    meta: [{ title: "Manufacturing Facilities | STKA Admin" }],
  }),
  component: AdminManufacturingPage,
});

function AdminManufacturingPage() {
  const { data: mfgList, isLoading, error } = useAdminManufacturing();
  const facilities = Array.isArray(mfgList) ? mfgList : [];

  const createMfgMutation = useCreateManufacturing();
  const updateMfgMutation = useUpdateManufacturing();
  const toggleActiveMutation = useToggleManufacturingActive();
  const deleteMfgImageMutation = useDeleteManufacturingImage();
  const deleteMfgMutation = useDeleteManufacturing();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMfg, setEditingMfg] = useState<ManufacturingResponse | null>(null);
  const [deletingMfgId, setDeletingMfgId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ManufacturingRequest>({
    title: "",
    description: "",
    displayOrder: 0,
    active: true,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingMfg(null);
    setFormData({
      title: "",
      description: "",
      displayOrder: facilities.length,
      active: true,
    });
    setSelectedFiles([]);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (mfg: ManufacturingResponse) => {
    setEditingMfg(mfg);
    setFormData({
      title: mfg.title || "",
      description: mfg.description || "",
      displayOrder: mfg.displayOrder ?? 0,
      active: mfg.active ?? true,
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
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    try {
      if (editingMfg) {
        await updateMfgMutation.mutateAsync({
          id: editingMfg.id,
          data: formData,
          files: selectedFiles.length > 0 ? selectedFiles : undefined,
        });
        setSuccessMsg("Manufacturing content updated successfully.");
      } else {
        await createMfgMutation.mutateAsync({
          data: formData,
          files: selectedFiles.length > 0 ? selectedFiles : undefined,
        });
        setSuccessMsg("Manufacturing facility created successfully.");
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save facility record.");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editingMfg) return;
    try {
      const updated = await deleteMfgImageMutation.mutateAsync({
        id: editingMfg.id,
        imageId,
      });
      setEditingMfg(updated);
      setSuccessMsg("Facility image removed successfully.");
    } catch (err: any) {
      setFormError(err.message || "Failed to delete image.");
    }
  };

  const handleDelete = async () => {
    if (!deletingMfgId) return;
    try {
      await deleteMfgMutation.mutateAsync(deletingMfgId);
      setDeletingMfgId(null);
      setSuccessMsg("Manufacturing facility deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete facility.");
    }
  };

  return (
    <AdminLayout
      title="Manufacturing Facilities"
      subtitle="Manage plant infrastructure, sterile formulation units, and facility showcases"
      actions={
        <Button onClick={openCreateModal} className="gap-1.5 text-xs font-medium">
          <Plus className="h-4 w-4" /> Add Facility
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
            <span>Failed to load manufacturing facilities. Please try again.</span>
          </div>
        ) : facilities.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-3">
            <Factory className="h-8 w-8 mx-auto text-slate-400" />
            <p>No manufacturing facilities added yet.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Facility
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Image</TableHead>
                  <TableHead className="text-xs">Facility Title</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Display Order</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities.map((mfg) => {
                  const firstImg = mfg.images && mfg.images.length > 0 ? mfg.images[0] : null;
                  return (
                    <TableRow key={mfg.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 border overflow-hidden flex items-center justify-center shrink-0">
                          {firstImg ? (
                            <img src={firstImg.imageUrl} alt={mfg.title} className="h-full w-full object-cover" />
                          ) : (
                            <Factory className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-foreground">{mfg.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[320px] truncate">
                        {mfg.description || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{mfg.displayOrder ?? 0}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={mfg.active}
                            onCheckedChange={() =>
                              toggleActiveMutation.mutate({ id: mfg.id, active: !mfg.active })
                            }
                            disabled={toggleActiveMutation.isPending}
                          />
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              mfg.active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {mfg.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(mfg)} className="h-8 w-8 text-slate-600 hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingMfgId(mfg.id)} className="h-8 w-8 text-slate-600 hover:text-destructive">
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
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                {editingMfg ? <Pencil className="h-4 w-4" /> : <Factory className="h-4 w-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingMfg ? "Edit Manufacturing Facility" : "Add Manufacturing Facility"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Manage plant infrastructure, specifications, and facility media.
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

              <FormSection title="CONTENT">
                <FormField label="Facility Title / Unit Name" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. High-Capacity Injectables Plant"
                    maxLength={150}
                    required
                  />
                </FormField>

                <FormField label="Description" required>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe manufacturing lines, cleanroom standard, automated packaging..."
                    className="min-h-[100px]"
                    required
                  />
                </FormField>

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
                        id="active-toggle"
                        checked={formData.active ?? true}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
                      />
                      <Label htmlFor="active-toggle" className="text-xs cursor-pointer">
                        Active / Visible
                      </Label>
                    </div>
                  </div>
                </FormGrid>
              </FormSection>

              <FormSection title="MEDIA">
                {editingMfg && editingMfg.images && editingMfg.images.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Uploaded Facility Images:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {editingMfg.images.map((img) => (
                        <div key={img.id} className="h-20 rounded-lg border bg-slate-100 dark:bg-slate-800 overflow-hidden relative group">
                          <img src={img.imageUrl} alt="Facility" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                            title="Remove Image"
                          >
                            <X className="h-3 w-3" />
                          </button>
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
                        : "Click to upload facility photo(s)"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Supports PNG, JPG, WEBP (Max 10 images total)</span>
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
                disabled={createMfgMutation.isPending || updateMfgMutation.isPending}
                className="text-xs h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm px-5"
              >
                {createMfgMutation.isPending || updateMfgMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Facility"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingMfgId)}
        onOpenChange={(open) => !open && setDeletingMfgId(null)}
        title="Delete Manufacturing Entry?"
        description="This content will be permanently removed from the website. This action cannot be undone."
        confirmLabel="Delete Manufacturing Entry"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteMfgMutation.isPending}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
