import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <BookOpen className="mx-auto h-24 w-24 text-muted-foreground/50" />
        <h1 className="mt-6 text-3xl font-bold text-foreground">Curso não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          O curso que você está procurando não existe ou foi removido.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/#cursos">
            <Button>Ver Cursos Disponíveis</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Voltar para Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
