import { z } from "zod";

// Schema para módulo
export const moduleSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

// Schema para aula
export const lessonSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(10, "O conteúdo deve ter pelo menos 10 caracteres")
    .max(10000, "O conteúdo deve ter no máximo 10000 caracteres"),
  videoUrl: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal("")),
});

// Schema para treinamento
export const trainingSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(1000, "A descrição deve ter no máximo 1000 caracteres"),
  level: z.enum(["Básico", "Intermediário", "Avançado"]).optional(),
  duration: z
    .string()
    .max(50, "A duração deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  passingScore: z
    .number()
    .min(0, "A nota de aprovação deve ser no mínimo 0")
    .max(100, "A nota de aprovação deve ser no máximo 100"),
  companyIds: z.array(z.string()).optional(),
});

// Schema para empresa
export const companySchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
});

// Schema para funcionário
export const employeeSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().email("E-mail inválido"),
  companyId: z.string().min(1, "Selecione uma empresa"),
});

// Schema para login
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Schema para registro
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Tipos inferidos
export type ModuleFormData = z.infer<typeof moduleSchema>;
export type LessonFormData = z.infer<typeof lessonSchema>;
export type TrainingFormData = z.infer<typeof trainingSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
