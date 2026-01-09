"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold text-primary">SkillPro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Começar Agora</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3 animate-fade-in">
            <Link href="/cursos" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Ver Cursos
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Entrar
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full">
                Começar Agora
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
