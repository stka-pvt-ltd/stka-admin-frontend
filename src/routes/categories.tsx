import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-admin-queries";
import type { CategoryResponse, CategoryRequest } from "@/types/api";
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  X,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [{ title: "Category Management | STKA Admin" }],
  }),
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const { data: categoriesResponse, isLoading, error } = useAdminCategories();
  const categories = categoriesResponse?.content ?? [];

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CategoryRequest>>({
    categoryName: "",
    slug: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      categoryName: "",
      slug: "",
      description: "",
    });
    setSelectedFile(null);
    setFilePreview(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    setFormData({
      categoryName: cat.categoryName,
      slug: cat.slug,
      description: cat.description,
    });
    setSelectedFile(null);
    setFilePreview(cat.categoryImage?.imageUrl || null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData((prev) => ({
      ...prev,
      categoryName: name,
      slug: editingCategory ? prev.slug || slug : slug,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryName || !formData.categoryName.trim()) {
      setFormError("Category name is required.");
      return;
    }

    const name = formData.categoryName.trim();
    const slug = (formData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim();

    if (!slug) {
      setFormError("Category slug is required.");
      return;
    }

    setFormError(null);
    const categoryPayload: CategoryRequest = {
      categoryName: name,
      slug: slug,
      description: formData.description?.trim() || "",
    };

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: categoryPayload,
          file: selectedFile,
        });
      } else {
        await createCategoryMutation.mutateAsync({
          data: categoryPayload,
          file: selectedFile,
        });
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save category.");
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleteError(null);
    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch (err: any) {
      const msg = err.message || "";
      if (
        msg.toLowerCase().includes("product") ||
        msg.toLowerCase().includes("constraint") ||
        msg.toLowerCase().includes("foreign") ||
        msg.toLowerCase().includes("integrity")
      ) {
        setDeleteError("This category cannot be deleted while products are assigned to it. Move or remove the associated products first.");
      } else {
        setDeleteError(msg || "Failed to delete category.");
      }
    }
  };

  return (
    <AdminLayout
      title="Categories"
      subtitle="Manage therapeutic product categories"
      actions={
        <Button onClick={openCreateModal} className="gap-1.5 text-xs font-medium">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      }
    >
      <div className="bg-background rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive text-sm flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <span>Failed to load categories. Please try again.</span>
          </div>
        ) : categories?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-3">
            <FolderTree className="h-8 w-8 mx-auto text-slate-400" />
            <p>No categories defined yet.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Category
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Image</TableHead>
                  <TableHead className="text-xs">Category Name</TableHead>
                  <TableHead className="text-xs">Slug</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                        {cat.categoryImage ? (
                          <img src={cat.categoryImage.imageUrl} alt={cat.categoryName} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">{cat.categoryName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(cat)} className="h-8 w-8 text-slate-600 hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeleteError(null); setDeletingCategory(cat); }} className="h-8 w-8 text-slate-600 hover:text-destructive">
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
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Category records group products on the public website.
            </DialogDescription>
            <DialogClose />
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <div className="max-h-[calc(85vh-9rem)] overflow-y-auto px-6 py-5 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <FormSection title="Category Details">
                <FormField label="Category Name" required hint="Display title of therapeutic category">
                  <Input
                    value={formData.categoryName || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Antibiotics & Anti-Infectives"
                    required
                  />
                </FormField>

                <FormField label="Slug" required hint="URL identifier generated automatically">
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. antibiotics-anti-infectives"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Category overview and therapeutic scope..."
                    rows={3}
                  />
                </FormField>
              </FormSection>

              <FormSection title="Category Graphic / Banner">
                <div className="space-y-3">
                  {filePreview && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                      <div className="h-14 w-14 rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0">
                        <img src={filePreview} alt="Category preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile ? selectedFile.name : "Active Category Banner"}
                        </p>
                        <p className="text-[10px] text-slate-500">Uploading new image file replaces the active banner.</p>
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 transition-colors">
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click to choose category graphic
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, WEBP (Max 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="mt-2 block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950/60 dark:file:text-emerald-300"
                    />
                  </div>
                </div>
              </FormSection>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                className="text-xs font-medium px-5"
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingCategory)} onOpenChange={(open) => { if (!open) { setDeletingCategory(null); setDeleteError(null); } }}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              {deleteError ? "Category Cannot Be Deleted" : `Delete "${deletingCategory?.categoryName}"?`}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {deleteError
                ? "This category currently has associated products assigned to it."
                : "This action will permanently remove this category. This action cannot be undone."}
            </DialogDescription>
            <DialogClose />
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            {deleteError ? (
              <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete <strong className="font-semibold text-slate-900 dark:text-slate-100">{deletingCategory?.categoryName}</strong>?
              </p>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            {deleteError ? (
              <Button type="button" variant="outline" onClick={() => { setDeletingCategory(null); setDeleteError(null); }} className="text-xs px-5">
                Close
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setDeletingCategory(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteCategoryMutation.isPending}
                  className="text-xs font-medium px-5"
                >
                  {deleteCategoryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Delete Category"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

