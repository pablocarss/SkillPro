"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  Award,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";

export function CertificateVerifySection() {
  const [hash, setHash] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;

    setIsSearching(true);
    // Pequeno delay para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push(`/verificar/${hash.trim().toUpperCase()}`);
  };

  return (
    <section id="validar-certificado" className="py-12 sm:py-16 lg:py-20 scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 animate-fade-in-up">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300">
              <Shield className="h-3 w-3 mr-1" />
              Verificar Autenticidade
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Verificar Certificado
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Valide a autenticidade de qualquer certificado SkillPro inserindo o código hash único
            </p>
          </div>

          {/* Verification Card */}
          <Card className="border-2 border-blue-200/50 dark:border-blue-800/50 shadow-xl animate-scale-in">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 items-center">
                {/* Form */}
                <div>
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="hash"
                        className="text-sm font-medium text-foreground"
                      >
                        Código Hash do Certificado
                      </label>
                      <div className="relative">
                        <Input
                          id="hash"
                          type="text"
                          placeholder="Ex: A1B2C3D4E5F6..."
                          value={hash}
                          onChange={(e) => setHash(e.target.value.toUpperCase())}
                          className="h-12 pl-4 pr-12 font-mono text-sm uppercase"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        O código hash está localizado no rodapé do certificado
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 text-base group"
                      disabled={!hash.trim() || isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Verificar Certificado
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 border border-green-200/50 dark:border-green-800/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">
                        Certificados Válidos
                      </h4>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Assinatura digital verificada
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Cada certificado possui um código hash único e exclusivo</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Assinatura digital garante a autenticidade do documento</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Verificação instantânea e gratuita para qualquer pessoa</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
