"use client";

import { ReactNode, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Award,
  LogOut,
  Users,
  UserCog,
  CheckSquare,
  Search,
  Menu,
  X,
  ChevronLeft,
  Building2,
  Briefcase,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";
  const isEmployee = session?.user?.role === "EMPLOYEE";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fechar sidebar ao navegar em mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/courses", label: "Meus Cursos", icon: BookOpen },
    { href: "/dashboard/catalog", label: "Todos os Cursos", icon: Search },
    { href: "/dashboard/certificates", label: "Certificados", icon: Award },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard Admin", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Gerenciar Cursos", icon: BookOpen },
    { href: "/admin/enrollments", label: "Aprovações", icon: CheckSquare },
    { href: "/admin/students", label: "Alunos", icon: Users },
    { href: "/admin/admins", label: "Administradores", icon: UserCog },
    { href: "/admin/certificate-templates", label: "Templates de Certificado", icon: Award },
    // Área Empresarial
    { href: "/admin/empresarial/empresas", label: "Empresas", icon: Building2 },
    { href: "/admin/empresarial/funcionarios", label: "Funcionários", icon: UsersRound },
    { href: "/admin/empresarial/treinamentos", label: "Treinamentos", icon: Briefcase },
  ];

  const employeeLinks = [
    { href: "/treinamentos", label: "Meus Treinamentos", icon: Briefcase },
    { href: "/treinamentos/certificados", label: "Certificados", icon: Award },
  ];

  const links = isAdmin ? adminLinks : isEmployee ? employeeLinks : studentLinks;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay para mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header da Sidebar */}
          <div className="border-b p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <Link href={isAdmin ? "/admin" : isEmployee ? "/treinamentos" : "/dashboard"} className="flex items-center gap-2">
                <GraduationCap className="h-7 w-7 lg:h-8 lg:w-8 text-primary" />
                <span className="text-xl lg:text-2xl font-bold">SkillPro</span>
              </Link>
              {/* Botão fechar no mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 p-3 lg:p-4 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sm lg:text-base h-10 lg:h-11",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="border-t p-3 lg:p-4 space-y-3">
            <div className="flex items-center gap-2 lg:gap-3">
              <Avatar className="h-9 w-9 lg:h-10 lg:w-10 flex-shrink-0">
                <AvatarFallback className="text-sm">{session?.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="truncate text-sm font-medium">{session?.user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full h-9 lg:h-10 text-sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href={isAdmin ? "/admin" : isEmployee ? "/treinamentos" : "/dashboard"} className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">SkillPro</span>
            </Link>
            <div className="w-9" /> {/* Spacer para centralizar o logo */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
