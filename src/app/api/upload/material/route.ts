import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { uploadFile } from "@/lib/minio";

const ALLOWED_TYPES = [
  // Documentos
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Planilhas
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Apresentações
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Compactados
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  // Texto
  "text/plain",
  "text/csv",
  // Imagens (para ebooks com imagens)
  "application/epub+zip",
];

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

function getFileExtension(mimeType: string, fileName: string): string {
  // Primeiro tenta pegar a extensão do nome do arquivo
  const fileExt = fileName.split(".").pop()?.toLowerCase();
  if (fileExt) return fileExt;

  // Fallback para mapeamento de mime types
  const mimeToExt: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/zip": "zip",
    "application/x-rar-compressed": "rar",
    "application/x-7z-compressed": "7z",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/epub+zip": "epub",
  };

  return mimeToExt[mimeType] || "bin";
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validar tipo do arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo nao permitido. Use PDF, Word, Excel, PowerPoint, ZIP ou EPUB." },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O tamanho maximo e 100MB." },
        { status: 400 }
      );
    }

    // Converter para buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Gerar nome único
    const fileExt = getFileExtension(file.type, file.name);
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, "") // Remove extensão
      .replace(/[^a-zA-Z0-9]/g, "_") // Remove caracteres especiais
      .substring(0, 50); // Limita tamanho
    const fileName = `${timestamp}-${safeName}.${fileExt}`;

    // Upload para MinIO
    const url = await uploadFile(buffer, fileName, file.type, "materials");

    return NextResponse.json({
      url,
      fileName: file.name,
      fileType: fileExt,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Error uploading material:", error);
    return NextResponse.json(
      { error: "Failed to upload material" },
      { status: 500 }
    );
  }
}
