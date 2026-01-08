"use client";

import { ReactNode } from "react";
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
  Settings,
  LogOut,
  Users,
  UserCog,
  CheckSquare,
  Search,
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
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card/50">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">SkillPro</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", isActive && "bg-primary/10 text-primary")}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{session?.user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <ThemeToggle />
            </div>
            <Button variant="outline" className="w-full" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
