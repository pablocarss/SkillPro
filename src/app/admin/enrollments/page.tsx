"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Check, X } from "lucide-react";

interface Enrollment {
  id: string;
  status: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
}

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/enrollments");
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar inscrições",
      });
    }
  };

  const handleUpdateStatus = async (enrollmentId: string, status: string) => {
    try {
      const response = await fetch("/api/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, status }),
      });

      if (response.ok) {
        toast({
          title: `Inscrição ${status === "APPROVED" ? "aprovada" : "rejeitada"} com sucesso!`,
        });
        fetchEnrollments();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar inscrição",
      });
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) =>
    filter === "ALL" ? true : enrollment.status === filter
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Aprovações de Inscrições</h1>
        <p className="text-gray-600">Gerencie as inscrições dos alunos nos cursos</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button variant={filter === "PENDING" ? "default" : "outline"} onClick={() => setFilter("PENDING")}>
          Pendentes
        </Button>
        <Button variant={filter === "APPROVED" ? "default" : "outline"} onClick={() => setFilter("APPROVED")}>
          Aprovadas
        </Button>
        <Button variant={filter === "REJECTED" ? "default" : "outline"} onClick={() => setFilter("REJECTED")}>
          Rejeitadas
        </Button>
        <Button variant={filter === "ALL" ? "default" : "outline"} onClick={() => setFilter("ALL")}>
          Todas
        </Button>
      </div>

      <div className="space-y-4">
        {filteredEnrollments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Nenhuma inscrição encontrada.
            </CardContent>
          </Card>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardHeader>
                <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{enrollment.student.name}</p>
                    <p className="text-sm text-gray-600">{enrollment.student.email}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Solicitado em: {new Date(enrollment.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm">
                      Status:{" "}
                      <span
                        className={
                          enrollment.status === "APPROVED"
                            ? "text-green-600"
                            : enrollment.status === "REJECTED"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }
                      >
                        {enrollment.status === "APPROVED"
                          ? "Aprovada"
                          : enrollment.status === "REJECTED"
                            ? "Rejeitada"
                            : "Pendente"}
                      </span>
                    </p>
                  </div>

                  {enrollment.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(enrollment.id, "APPROVED")}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUpdateStatus(enrollment.id, "REJECTED")}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
