import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminProducts,
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-admin-queries";
import type { ProductResponse, ProductRequest } from "@/types/api";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [{ title: "Product Management | STKA Admin" }],
  }),
  component: AdminProductsPage,
});

const MAX_IMAGE_COUNT = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const { data: productsData, isLoading, error } = useAdminProducts({ pageNumber: page, pageSize: 20 });
  const { data: categoriesData } = useAdminCategories();
  const categories = categoriesData?.content ?? [];

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ProductRequest>>({
    productName: "",
    slug: "",
    genericName: "",
    brand: "",
    composition: "",
    strength: "",
    dosageForm: "",
    description: "",
    categoryId: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Object URLs for preview clean-up
  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      productName: "",
      slug: "",
      genericName: "",
      brand: "",
      composition: "",
      strength: "",
      dosageForm: "",
      description: "",
      categoryId: categories && categories.length > 0 ? categories[0].id : "",
    });
    setSelectedFiles([]);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: ProductResponse) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      slug: product.slug,
      genericName: product.genericName,
      brand: product.brand,
      composition: product.composition,
      strength: product.strength,
      dosageForm: product.dosageForm,
      description: product.description,
      categoryId: product.categoryId,
    });
    setSelectedFiles([]);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData((prev) => ({
      ...prev,
      productName: name,
      slug: editingProduct ? prev.slug || slug : slug,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    
    // Validate file sizes and types
    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFormError(`File "${file.name}" exceeds the 5MB limit. Please choose a smaller file.`);
        return;
      }
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        setFormError(`File "${file.name}" is not a supported format. Please upload JPG, JPEG, or PNG images.`);
        return;
      }
    }

    const existingCount = editingProduct?.productImages?.length || 0;
    const totalCount = existingCount + selectedFiles.length + newFiles.length;

    if (totalCount > MAX_IMAGE_COUNT) {
      setFormError(`A product can have a maximum of ${MAX_IMAGE_COUNT} images in total.`);
      return;
    }

    setFormError(null);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveStagedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.productName?.trim() ||
      !formData.slug?.trim() ||
      !formData.genericName?.trim() ||
      !formData.brand?.trim() ||
      !formData.composition?.trim() ||
      !formData.strength?.trim() ||
      !formData.dosageForm?.trim() ||
      !formData.description?.trim() ||
      !formData.categoryId
    ) {
      setFormError("Please fill out all required fields before saving.");
      return;
    }

    setFormError(null);

    const productPayload: ProductRequest = {
      productName: formData.productName.trim(),
      slug: formData.slug.trim(),
      genericName: formData.genericName.trim(),
      brand: formData.brand.trim(),
      composition: formData.composition.trim(),
      strength: formData.strength.trim(),
      dosageForm: formData.dosageForm.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId,
    };

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          data: productPayload,
          files: selectedFiles,
        });
      } else {
        await createProductMutation.mutateAsync({
          data: productPayload,
          files: selectedFiles,
        });
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save product.");
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;
    try {
      await deleteProductMutation.mutateAsync(deletingProductId);
      setDeletingProductId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  const filteredProducts = (productsData?.content || []).filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.productName.toLowerCase().includes(term) ||
      p.genericName?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.composition?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage pharmaceutical product portfolio"
      actions={
        <Button onClick={openCreateModal} className="gap-1.5 text-xs font-medium">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, generic, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
        </div>
      </div>

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
            <span>Failed to load products. Please try again.</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-3">
            <Package className="h-8 w-8 mx-auto text-slate-400" />
            <p>No products found in the portfolio.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add First Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Gallery</TableHead>
                  <TableHead className="text-xs">Product Name</TableHead>
                  <TableHead className="text-xs">Generic Name</TableHead>
                  <TableHead className="text-xs">Dosage & Strength</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const images = product.productImages || [];
                  const firstImg = images.length > 0 ? images[0] : null;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {firstImg ? (
                              <img
                                src={firstImg.imageUrl}
                                alt={product.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          {images.length > 1 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                              +{images.length - 1}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {product.productName}
                        {product.brand && (
                          <span className="block text-[10px] text-muted-foreground font-normal">
                            Brand: {product.brand}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{product.genericName || "—"}</TableCell>
                      <TableCell className="text-xs">
                        {product.dosageForm || "—"}
                        {product.strength && <span className="block text-[10px] text-muted-foreground">{product.strength}</span>}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {product.categoryName || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(product)} className="h-8 w-8 text-slate-600 hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingProductId(product.id)}
                            className="h-8 w-8 text-slate-600 hover:text-destructive"
                          >
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                {editingProduct ? <Pencil className="h-4 w-4" /> : <Package className="h-4 w-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingProduct ? "Edit Product" : "Add New Pharmaceutical Product"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in product details and upload product gallery imagery.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="max-h-[calc(85vh-9rem)] overflow-y-auto px-6 py-5 space-y-6">
              {formError && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5 shadow-2xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Identification */}
              <FormSection
                title="Product Identification"
                description="Core product name, URL slug, active ingredient, and brand"
              >
                <FormGrid cols={2}>
                  <FormField label="Product Name" required>
                    <Input
                      value={formData.productName || ""}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Paracetamol 500mg"
                      required
                    />
                  </FormField>

                  <FormField label="Slug (URL Path)" required>
                    <Input
                      value={formData.slug || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. paracetamol-500mg"
                      required
                    />
                  </FormField>
                </FormGrid>

                <FormGrid cols={2}>
                  <FormField label="Generic Name" required>
                    <Input
                      value={formData.genericName || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, genericName: e.target.value }))}
                      placeholder="e.g. Paracetamol API"
                      required
                    />
                  </FormField>

                  <FormField label="Brand Name" required>
                    <Input
                      value={formData.brand || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g. STKA-Para"
                      required
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Section 2: Classification */}
              <FormSection
                title="Classification & Dosage"
                description="Therapeutic category, formulation type, and strength"
              >
                <FormGrid cols={3}>
                  <FormField label="Category" required>
                    <Select
                      value={formData.categoryId || ""}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Dosage Form" required>
                    <Input
                      value={formData.dosageForm || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosageForm: e.target.value }))}
                      placeholder="e.g. Tablet, Syrup"
                      required
                    />
                  </FormField>

                  <FormField label="Strength" required>
                    <Input
                      value={formData.strength || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, strength: e.target.value }))}
                      placeholder="e.g. 500mg, 10mg/ml"
                      required
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              {/* Section 3: Composition & Description */}
              <FormSection
                title="Composition & Details"
                description="Active pharmaceutical ingredients & clinical summary"
              >
                <FormField label="Active Composition" required>
                  <Input
                    value={formData.composition || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, composition: e.target.value }))}
                    placeholder="e.g. Each film coated tablet contains Paracetamol IP 500mg"
                    required
                  />
                </FormField>

                <FormField label="Detailed Description" required>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed pharmaceutical description, indications, storage conditions..."
                    required
                    className="min-h-[90px]"
                  />
                </FormField>
              </FormSection>

              {/* Section 4: Product Images */}
              <FormSection
                title="Product Gallery"
                description={`Upload JPG, JPEG, or PNG images up to 5MB each. Maximum ${MAX_IMAGE_COUNT} images.`}
                badge={`${(editingProduct?.productImages?.length || 0) + selectedFiles.length} / ${MAX_IMAGE_COUNT} Images`}
              >
                {/* Existing Product Images Gallery */}
                {editingProduct?.productImages && editingProduct.productImages.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Existing Product Images ({editingProduct.productImages.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {editingProduct.productImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className="relative group aspect-square rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xs"
                        >
                          <img
                            src={img.imageUrl}
                            alt={`Product Image ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white font-semibold px-2 py-1 bg-slate-900/80 backdrop-blur-xs rounded-md shadow-xs">
                              Image {idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staged New Files Gallery Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Staged New Images to Upload ({selectedFiles.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-xl border border-emerald-500/40 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xs"
                        >
                          <img
                            src={previewUrls[idx]}
                            alt={`Preview ${file.name}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveStagedFile(idx)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-transform active:scale-95 cursor-pointer"
                            title="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/75 backdrop-blur-xs p-1 text-[9px] text-white font-medium truncate text-center">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Box */}
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-600 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-900/30">
                  <Input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <Upload className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Click or Drag & Drop images to upload
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      JPG, JPEG, PNG or WEBP up to 5MB per file
                    </span>
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
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                className="text-xs h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm px-5"
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving Product...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingProductId)}
        onOpenChange={(open) => !open && setDeletingProductId(null)}
        title="Delete product?"
        description="This action will permanently remove this product and its associated information. This cannot be undone."
        confirmLabel="Delete Product"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteProductMutation.isPending}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}

