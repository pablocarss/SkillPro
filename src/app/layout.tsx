import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillPro - Plataforma de Cursos EAD",
  description: "Aprenda novas habilidades com nossos cursos online",
};

// Script to prevent flash of unstyled content (FOUC)
// This runs before React hydrates to apply the correct theme class
const themeScript = `
  (function() {
    function getTheme() {
      try {
        var stored = localStorage.getItem('theme');
        if (stored === 'dark') return 'dark';
        if (stored === 'light') return 'light';
        // If system or not set, check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      } catch (e) {
        return 'light';
      }
    }
    var theme = getTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
