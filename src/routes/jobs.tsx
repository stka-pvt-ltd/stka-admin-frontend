import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminJobs,
  useCreateJob,
  useUpdateJob,
  useToggleJobActive,
  useDeleteJob,
} from "@/hooks/use-admin-queries";
import type { JobResponse, JobRequest } from "@/types/api";
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormSection, FormGrid, FormField } from "@/components/ui/admin-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [{ title: "Careers & Jobs | STKA Admin" }],
  }),
  component: AdminJobsPage,
});

function AdminJobsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: pageData, isLoading, error } = useAdminJobs({
    pageNumber: page,
    pageSize,
    sortBy: "id",
    sortOrder: "desc",
  });

  const jobs = pageData?.content ?? [];
  const totalPages = pageData?.totalPage ?? 1;

  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const toggleActiveMutation = useToggleJobActive();
  const deleteJobMutation = useDeleteJob();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobResponse | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<JobRequest>({
    title: "",
    department: "",
    location: "",
    employmentType: "FULL_TIME",
    experience: "",
    qualification: "",
    description: "",
    responsibilities: "",
    requirements: "",
    displayOrder: 0,
    active: true,
    applicationDeadline: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      department: "",
      location: "",
      employmentType: "FULL_TIME",
      experience: "",
      qualification: "",
      description: "",
      responsibilities: "",
      requirements: "",
      displayOrder: 0,
      active: true,
      applicationDeadline: "",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (job: JobResponse) => {
    setEditingJob(job);
    setFormData({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      employmentType: job.employmentType || "FULL_TIME",
      experience: job.experience || "",
      qualification: job.qualification || "",
      description: job.description || "",
      responsibilities: job.responsibilities || "",
      requirements: job.requirements || "",
      displayOrder: job.displayOrder ?? 0,
      active: job.active ?? true,
      applicationDeadline: job.applicationDeadline || "",
    });
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
    if (!formData.location.trim()) {
      setFormError("Location is required (max 150 characters).");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (formData.applicationDeadline) {
      const selectedDate = new Date(formData.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setFormError("Application deadline cannot be in the past.");
        return;
      }
    }

    try {
      if (editingJob) {
        await updateJobMutation.mutateAsync({ id: editingJob.id, data: formData });
        setSuccessMsg("Job opening updated successfully.");
      } else {
        await createJobMutation.mutateAsync(formData);
        setSuccessMsg("Job opening created successfully.");
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save job posting.");
    }
  };

  const handleDelete = async () => {
    if (!deletingJobId) return;
    try {
      await deleteJobMutation.mutateAsync(deletingJobId);
      setDeletingJobId(null);
      setSuccessMsg("Job opening deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete job.");
    }
  };

  return (
    <AdminLayout
      title="Job Openings"
      subtitle="Manage career requisitions, qualifications, and hiring requisitions"
      actions={
        <Button onClick={openCreateModal} className="gap-1.5 text-xs font-medium">
          <Plus className="h-4 w-4" /> Post New Job
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
            <span>Failed to load career listings. Please try again.</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs space-y-3">
            <Briefcase className="h-8 w-8 mx-auto text-slate-400" />
            <p>No job openings posted yet.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Post Job
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Job Title</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Experience</TableHead>
                    <TableHead className="text-xs">Deadline</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-semibold text-xs text-foreground">{job.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{job.department || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{job.location}</TableCell>
                      <TableCell className="text-xs font-mono">{job.employmentType}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{job.experience || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{job.applicationDeadline || "Open"}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={job.active}
                            onCheckedChange={() =>
                              toggleActiveMutation.mutate({ id: job.id, active: !job.active })
                            }
                            disabled={toggleActiveMutation.isPending}
                          />
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              job.active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {job.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(job)} className="h-8 w-8 text-slate-600 hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingJobId(job.id)} className="h-8 w-8 text-slate-600 hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                {editingJob ? <Pencil className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingJob ? "Edit Job Opening" : "Post New Job Opening"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in career requisition details and qualifications.
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

              <FormSection title="Requisition Information">
                <FormGrid cols={2}>
                  <FormField label="Job Title" required>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Senior Quality Control Officer"
                      maxLength={150}
                      required
                    />
                  </FormField>

                  <FormField label="Department">
                    <Input
                      value={formData.department || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                      placeholder="e.g. Quality Assurance / Production"
                      maxLength={100}
                    />
                  </FormField>
                </FormGrid>

                <FormGrid cols={2}>
                  <FormField label="Location" required>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Ahmedabad Facility, Gujarat"
                      maxLength={150}
                      required
                    />
                  </FormField>

                  <FormField label="Employment Type" required>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, employmentType: val }))}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME" className="text-xs">FULL TIME</SelectItem>
                        <SelectItem value="PART_TIME" className="text-xs">PART TIME</SelectItem>
                        <SelectItem value="CONTRACT" className="text-xs">CONTRACT</SelectItem>
                        <SelectItem value="INTERNSHIP" className="text-xs">INTERNSHIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </FormGrid>

                <FormGrid cols={2}>
                  <FormField label="Experience Required">
                    <Input
                      value={formData.experience || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g. 3-5 Years in Injectables"
                      maxLength={100}
                    />
                  </FormField>

                  <FormField label="Qualification">
                    <Input
                      value={formData.qualification || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, qualification: e.target.value }))}
                      placeholder="e.g. B.Pharm / M.Sc"
                      maxLength={150}
                    />
                  </FormField>
                </FormGrid>

                <FormGrid cols={2}>
                  <FormField label="Application Deadline">
                    <Input
                      type="date"
                      value={formData.applicationDeadline || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
                    />
                  </FormField>

                  <FormField label="Display Order">
                    <Input
                      type="number"
                      value={formData.displayOrder ?? 0}
                      onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      min={0}
                    />
                  </FormField>
                </FormGrid>

                <div className="flex items-center gap-2.5 pt-1">
                  <Switch
                    id="job-active-switch"
                    checked={formData.active ?? true}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="job-active-switch" className="text-xs cursor-pointer">
                    Active / Accepting Applications
                  </Label>
                </div>
              </FormSection>

              <FormSection title="Job Details">
                <FormField label="Job Description" required>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="General description of role and objectives..."
                    className="min-h-[90px]"
                    required
                  />
                </FormField>

                <FormField label="Key Responsibilities">
                  <Textarea
                    value={formData.responsibilities || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, responsibilities: e.target.value }))}
                    placeholder="Daily tasks, GMP compliance duties..."
                    className="min-h-[80px]"
                  />
                </FormField>

                <FormField label="Requirements & Skills">
                  <Textarea
                    value={formData.requirements || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Technical skills, certifications..."
                    className="min-h-[80px]"
                  />
                </FormField>
              </FormSection>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createJobMutation.isPending || updateJobMutation.isPending}
                className="text-xs h-9 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm px-5"
              >
                {createJobMutation.isPending || updateJobMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Job Opening"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingJobId)}
        onOpenChange={(open) => !open && setDeletingJobId(null)}
        title="Delete Job Opening?"
        description="This job opening will be permanently removed from the website. This action cannot be undone."
        confirmLabel="Delete Job Opening"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleteJobMutation.isPending}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}

