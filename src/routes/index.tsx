import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminProducts,
  useAdminCategories,
  useAdminCertifications,
  useAdminManufacturing,
  useAdminBanners,
  useAdminJobs,
  useAdminEnquiries,
} from "@/hooks/use-admin-queries";
import {
  Package,
  FolderTree,
  Award,
  Factory,
  Image as ImageIcon,
  Briefcase,
  Mail,
  ArrowUpRight,
  Plus,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | STKA Admin" },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data: productsData, isLoading: loadingProducts, refetch: refetchProducts } = useAdminProducts({ pageSize: 1 });
  const { data: categoriesData, isLoading: loadingCategories } = useAdminCategories();
  const { data: certsData, isLoading: loadingCerts } = useAdminCertifications();
  const { data: mfgData, isLoading: loadingMfg } = useAdminManufacturing();
  const { data: bannersData, isLoading: loadingBanners } = useAdminBanners();
  const { data: jobsData, isLoading: loadingJobs } = useAdminJobs();
  const { data: enquiriesData, isLoading: loadingEnquiries, refetch: refetchEnquiries } = useAdminEnquiries({ pageSize: 5 });

  const totalProducts = productsData?.totalElement ?? 0;
  const categoriesList = categoriesData?.content ?? [];
  const totalCategories = categoriesData?.totalElement ?? categoriesList.length;
  const certsList = certsData?.content ?? [];
  const totalCerts = certsData?.totalElement ?? certsList.length;
  const totalMfg = mfgData?.length ?? 0;
  const activeMfg = mfgData?.filter((m) => m.active).length ?? 0;
  const totalBanners = bannersData?.length ?? 0;
  const activeBanners = bannersData?.filter((b) => b.active).length ?? 0;
  const jobsList = jobsData?.content ?? [];
  const totalJobs = jobsData?.totalElement ?? jobsList.length;
  const activeJobs = jobsList.filter((j) => j.active).length;
  const totalEnquiries = enquiriesData?.totalElement ?? 0;
  const recentEnquiries = enquiriesData?.content ?? [];

  const handleRefresh = () => {
    refetchProducts();
    refetchEnquiries();
  };

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Operational overview and system metrics"
      actions={
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Products
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Catalog items</span>
              <Link to="/products" className="text-primary font-medium hover:underline inline-flex items-center">
                Manage <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FolderTree className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{totalCategories}</div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Therapeutic groups</span>
              <Link to="/categories" className="text-primary font-medium hover:underline inline-flex items-center">
                Manage <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enquiries
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mail className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingEnquiries ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{totalEnquiries}</div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Inquiries & applications</span>
              <Link to="/enquiries" className="text-primary font-medium hover:underline inline-flex items-center">
                View all <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Certifications
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCerts ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{totalCerts}</div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Quality accreditations</span>
              <Link to="/certifications" className="text-primary font-medium hover:underline inline-flex items-center">
                Manage <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Quick Operational Actions</CardTitle>
            <CardDescription className="text-xs">Direct access to manage key resources</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <Link to="/products" className="w-full">
              <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2.5">
                <Plus className="h-4 w-4 text-blue-500" /> Add New Pharmaceutical Product
              </Button>
            </Link>

            <Link to="/categories" className="w-full">
              <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2.5">
                <Plus className="h-4 w-4 text-emerald-500" /> Create Product Category
              </Button>
            </Link>

            <Link to="/jobs" className="w-full">
              <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2.5">
                <Briefcase className="h-4 w-4 text-amber-500" /> Post Job Opportunity ({activeJobs} active)
              </Button>
            </Link>

            <Link to="/banners" className="w-full">
              <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2.5">
                <ImageIcon className="h-4 w-4 text-indigo-500" /> Manage Banners ({activeBanners}/{totalBanners} active)
              </Button>
            </Link>

            <Link to="/company" className="w-full">
              <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2.5">
                <FileText className="h-4 w-4 text-purple-500" /> Update Corporate Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Facilities & Operational Content</CardTitle>
              <CardDescription className="text-xs">Status of active public-facing records</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-2">
                  <Factory className="h-4 w-4 text-slate-500" /> Manufacturing Facilities
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {activeMfg} Active
                </Badge>
              </div>
              <p className="text-2xl font-bold">{totalMfg}</p>
              <p className="text-[11px] text-muted-foreground">Production facilities & units listed</p>
              <Link to="/manufacturing" className="text-xs text-primary font-medium hover:underline block pt-1">
                Configure manufacturing records &rarr;
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-500" /> Career Requisitions
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {activeJobs} Open
                </Badge>
              </div>
              <p className="text-2xl font-bold">{totalJobs}</p>
              <p className="text-[11px] text-muted-foreground">Positions listed on Careers page</p>
              <Link to="/jobs" className="text-xs text-primary font-medium hover:underline block pt-1">
                Manage job postings &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Recent Customer Enquiries</CardTitle>
            <CardDescription className="text-xs">Latest communications submitted via public website</CardDescription>
          </div>
          <Link to="/enquiries">
            <Button variant="outline" size="sm" className="text-xs">
              View All Enquiries ({totalEnquiries})
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingEnquiries ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentEnquiries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              No recent enquiries found.
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
                    <TableHead className="text-xs text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium text-xs text-foreground">
                        {enquiry.name}
                        {enquiry.company && (
                          <span className="block text-[10px] text-muted-foreground">{enquiry.company}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {enquiry.email}
                        {enquiry.phone && <span className="block text-[10px]">{enquiry.phone}</span>}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{enquiry.subject || "General Enquiry"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            enquiry.status === "NEW"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : enquiry.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {enquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {enquiry.hasAttachment ? (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <FileText className="h-3 w-3 text-slate-500" /> PDF Attached
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground whitespace-nowrap">
                        {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
