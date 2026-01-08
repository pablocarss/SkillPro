import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, cpf, birthDate, phone } = body;

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (!cpf) {
      return NextResponse.json(
        { error: "CPF é obrigatório para emissão de certificados" },
        { status: 400 }
      );
    }

    if (!birthDate) {
      return NextResponse.json(
        { error: "Data de nascimento é obrigatória" },
        { status: 400 }
      );
    }

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "E-mail inválido" },
        { status: 400 }
      );
    }

    // Validar CPF (formato básico)
    const cpfClean = cpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) {
      return NextResponse.json(
        { error: "CPF inválido" },
        { status: 400 }
      );
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar se e-mail já existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    const existingUserByCpf = await prisma.user.findUnique({
      where: { cpf: cpfClean },
    });

    if (existingUserByCpf) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Converter birthDate para DateTime
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json(
        { error: "Data de nascimento inválida" },
        { status: 400 }
      );
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf: cpfClean,
        birthDate: birthDateObj,
        phone: phone || null,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        birthDate: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Cadastro realizado com sucesso!",
      user,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
