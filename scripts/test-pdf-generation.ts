import { generateCertificatePDF } from "../src/lib/pdf-converter";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🧪 Testando geração de PDF...\n");

  const testData = {
    studentName: "João da Silva",
    studentCpf: "123.456.789-00",
    courseName: "Teste de Certificação - React Avançado",
    courseDuration: "20 horas",
    completionDate: new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    finalScore: 95.5,
    certificateHash: "A1B2C3D4E5F6G7H8",
  };

  try {
    console.log("📄 Gerando PDF...");
    const pdfBuffer = await generateCertificatePDF(testData);

    const outputPath = path.join(process.cwd(), "test-certificate.pdf");
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`✅ PDF gerado com sucesso!`);
    console.log(`📁 Arquivo salvo em: ${outputPath}`);
    console.log(`📊 Tamanho: ${(pdfBuffer.length / 1024).toFixed(2)} KB\n`);
  } catch (error) {
    console.error("❌ Erro ao gerar PDF:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
