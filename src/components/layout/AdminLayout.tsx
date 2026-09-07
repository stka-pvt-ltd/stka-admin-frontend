import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Building2,
  Award,
  Factory,
  Image as ImageIcon,
  Briefcase,
  Mail,
  LogOut,
  Menu,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface AdminNavGroup {
  title: string;
  items: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
  }[];
}

const navGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Catalog & Content",
    items: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Categories", href: "/categories", icon: FolderTree },
      { title: "Certifications", href: "/certifications", icon: Award },
      { title: "Manufacturing", href: "/manufacturing", icon: Factory },
      { title: "Banners", href: "/banners", icon: ImageIcon },
    ],
  },
  {
    title: "Operations & Enquiries",
    items: [
      { title: "Enquiries", href: "/enquiries", icon: Mail },
      { title: "Careers & Jobs", href: "/jobs", icon: Briefcase },
      { title: "Company Profile", href: "/company", icon: Building2 },
    ],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const renderNavItems = () => (
    <div className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-[#5A6B62]">
            {group.title}
          </h3>
          <nav className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-[#5F9472] text-white shadow-sm font-semibold"
                      : "text-[#5A6B62] hover:bg-[#E8ECE9] hover:text-[#29352F]"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-[#5A6B62]"}`} />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F5] dark:bg-[#19221D] flex flex-col md:flex-row text-[#29352F] dark:text-[#F5F7F5]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 bg-white dark:bg-[#212C26] border-r border-[#DDE5DF] dark:border-[#33433A]">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#DDE5DF] dark:border-[#33433A]">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="STKA Admin" className="h-8 w-auto object-contain shrink-0" />
            <div>
              <span className="font-bold text-base text-[#29352F] dark:text-[#F5F7F5] tracking-tight block leading-none">
                STKA Admin
              </span>
              <span className="text-[10px] text-[#5A6B62] font-medium uppercase tracking-wider">
                Management Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {renderNavItems()}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[#DDE5DF] dark:border-[#33433A] bg-[#F5F7F5] dark:bg-[#19221D]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#E8ECE9] dark:bg-[#2C3932] flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-[#29352F] dark:text-[#F5F7F5]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#29352F] dark:text-[#F5F7F5] truncate">{user?.name || "Admin User"}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-[#5F9472]/40 text-[#5F9472] dark:text-[#8FB59D]">
                    ROLE_ADMIN
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign Out"
              className="text-[#5A6B62] hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header & Drawer */}
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-[#212C26] border-b border-[#DDE5DF] dark:border-[#33433A] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white dark:bg-[#212C26]">
              <div className="h-16 px-6 flex items-center justify-between border-b border-[#DDE5DF]">
                <div className="flex items-center gap-2.5">
                  <img src="/favicon.svg" alt="STKA Admin" className="h-7 w-auto object-contain shrink-0" />
                  <span className="font-bold text-base text-[#29352F]">STKA Admin</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{renderNavItems()}</div>
              <div className="p-4 border-t border-[#DDE5DF] bg-[#F5F7F5] flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-semibold text-[#29352F]">{user?.name || "Admin User"}</p>
                  <p className="text-[#5A6B62] text-[10px]">ROLE_ADMIN</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 text-xs">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="STKA Admin" className="h-6 w-auto object-contain shrink-0" />
            <span className="font-bold text-sm text-[#29352F]">STKA Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Page Top Bar */}
        <header className="sticky top-0 z-20 hidden md:flex h-16 px-8 bg-white/80 dark:bg-[#212C26]/80 backdrop-blur border-b border-[#DDE5DF] dark:border-[#33433A] items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#5A6B62]">
              <Link to="/" className="hover:text-[#29352F] transition-colors">
                Admin
              </Link>
              {title && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-[#29352F] font-medium">{title}</span>
                </>
              )}
            </div>
            {title && <h1 className="text-lg font-bold text-[#29352F] tracking-tight">{title}</h1>}
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="h-4 w-px bg-[#DDE5DF]" />
            <div className="flex items-center gap-1.5 text-xs text-[#5F9472] bg-[#E8ECE9] px-2.5 py-1 rounded-full border border-[#5F9472]/30 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure Admin Portal
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto">
          {/* Mobile Page Header */}
          {title && (
            <div className="md:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE5DF]">
              <div>
                <h1 className="text-xl font-bold text-[#29352F]">{title}</h1>
                {subtitle && <p className="text-xs text-[#5A6B62] mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
