import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminEnquiries,
  useUpdateEnquiryStatus,
  useDeleteEnquiry,
} from "@/hooks/use-admin-queries";
import { adminEnquiriesApi } from "@/services/admin-api";
import type { EnquiryResponse, PaginationParams } from "@/types/api";
import {
  Mail,
  Search,
  Trash2,
  FileText,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Filter,
  User,
  Building,
  Phone,
  Calendar,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/enquiries")({
  head: () => ({
    meta: [{ title: "Customer Enquiries | STKA Admin" }],
  }),
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  const queryParams: PaginationParams & { status?: string; subject?: string; search?: string } = {
    pageNumber: page,
    pageSize: 20,
  };
  if (statusFilter !== "ALL") {
    queryParams.status = statusFilter;
  }
  if (searchTerm) {
    queryParams.search = searchTerm;
  }

  const { data: enquiriesData, isLoading, error } = useAdminEnquiries(queryParams);

  const updateStatusMutation = useUpdateEnquiryStatus();
  const deleteEnquiryMutation = useDeleteEnquiry();

  // Modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryResponse | null>(null);
  const [deletingEnquiryId, setDeletingEnquiryId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownloadAttachment = async (enquiry: EnquiryResponse) => {
    if (!enquiry.id || !enquiry.hasAttachment) return;
    setIsDownloading(enquiry.id);
    try {
      const blob = await adminEnquiriesApi.downloadAttachment(enquiry.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enquiry-attachment-${enquiry.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Failed to download private attachment.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update enquiry status.");
    }
  };

  const handleDelete = async () => {
    if (!deletingEnquiryId) return;
    try {
      await deleteEnquiryMutation.mutateAsync(deletingEnquiryId);
      setDeletingEnquiryId(null);
      if (selectedEnquiry && selectedEnquiry.id === deletingEnquiryId) {
        setSelectedEnquiry(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete enquiry.");
    }
  };

  const enquiriesList = enquiriesData?.content || [];

  return (
    <AdminLayout
      title="Customer Enquiries"
      subtitle="Manage incoming contact forms, product inquiries, partnership requests, and career resumes"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-background p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sender, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter Status:
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="NEW" className="text-xs">NEW</SelectItem>
              <SelectItem value="IN_PROGRESS" className="text-xs">IN PROGRESS</SelectItem>
              <SelectItem value="RESOLVED" className="text-xs">RESOLVED</SelectItem>
              <SelectItem value="CLOSED" className="text-xs">CLOSED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive text-sm flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <span>Failed to load customer enquiries.</span>
          </div>
        ) : enquiriesList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
            <Mail className="h-8 w-8 mx-auto text-slate-400" />
            <p>No customer enquiries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Sender Name</TableHead>
                  <TableHead className="text-xs">Email / Contact</TableHead>
                  <TableHead className="text-xs">Subject / Purpose</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Attachment</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiriesList.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {enquiry.name}
                      {enquiry.company && (
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {enquiry.company}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {enquiry.email}
                      {enquiry.phone && <span className="block text-[10px]">{enquiry.phone}</span>}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{enquiry.subject || "General Inquiry"}</TableCell>
                    <TableCell>
                      <Select
                        value={enquiry.status}
                        onValueChange={(newStatus) => handleStatusChange(enquiry.id, newStatus)}
                      >
                        <SelectTrigger className="h-7 text-[10px] w-[115px] font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW" className="text-xs text-blue-600 font-semibold">NEW</SelectItem>
                          <SelectItem value="IN_PROGRESS" className="text-xs text-amber-600 font-semibold">IN PROGRESS</SelectItem>
                          <SelectItem value="RESOLVED" className="text-xs text-emerald-600 font-semibold">RESOLVED</SelectItem>
                          <SelectItem value="CLOSED" className="text-xs text-slate-600 font-semibold">CLOSED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs">
                      {enquiry.hasAttachment ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadAttachment(enquiry)}
                          disabled={isDownloading === enquiry.id}
                          className="h-7 text-[10px] gap-1 text-slate-700 dark:text-slate-300"
                        >
                          {isDownloading === enquiry.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <FileText className="h-3 w-3 text-red-500" />
                          )}
                          Download PDF
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedEnquiry(enquiry)} className="h-8 w-8 text-slate-600 hover:text-foreground">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingEnquiryId(enquiry.id)} className="h-8 w-8 text-slate-600 hover:text-destructive">
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

      <Dialog open={Boolean(selectedEnquiry)} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" /> Customer Enquiry Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submitted on {selectedEnquiry?.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString() : "—"}
            </DialogDescription>
            <DialogClose />
          </DialogHeader>

          {selectedEnquiry && (
            <div className="max-h-[calc(85vh-9rem)] overflow-y-auto px-6 py-5 space-y-5 text-xs">
              <FormSection title="Sender Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Sender Name</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" /> {selectedEnquiry.name}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Email Address</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> {selectedEnquiry.email}
                    </span>
                  </div>

                  {selectedEnquiry.phone && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Phone Number</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {selectedEnquiry.phone}
                      </span>
                    </div>
                  )}

                  {selectedEnquiry.company && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">Company / Organization</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400" /> {selectedEnquiry.company}
                      </span>
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection title="Message & Purpose">
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject Heading</span>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      {selectedEnquiry.subject || "General Customer Enquiry"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Message Content</span>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 min-h-[120px] whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 text-xs shadow-xs">
                      {selectedEnquiry.message}
                    </div>
                  </div>
                </div>
              </FormSection>

              {selectedEnquiry.hasAttachment && (
                <FormSection title="Attached Document">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          Attached Document.pdf
                        </p>
                        <p className="text-[10px] text-slate-500">Private PDF file accessible only via secure Admin session</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadAttachment(selectedEnquiry)}
                      disabled={isDownloading === selectedEnquiry.id}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      {isDownloading === selectedEnquiry.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download PDF
                    </Button>
                  </div>
                </FormSection>
              )}
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
            <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(null)} className="text-xs px-5">
              Close Detail View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingEnquiryId)}
        onOpenChange={(open) => !open && setDeletingEnquiryId(null)}
        title="Delete Enquiry?"
        description="This enquiry will be permanently removed from the website. This action cannot be undone."
        confirmLabel="Delete Enquiry"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteEnquiryMutation.isPending}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}

