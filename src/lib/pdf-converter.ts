import puppeteer from "puppeteer";
import { PDFDocument, rgb } from "pdf-lib";
import { createHash } from "crypto";

interface CertificateData {
  studentName: string;
  studentCpf: string;
  courseName: string;
  courseDuration: string;
  completionDate: string;
  finalScore: number;
  certificateHash: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Create HTML certificate
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      width: 297mm;
      height: 210mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
    }

    .certificate {
      width: 280mm;
      height: 195mm;
      background: white;
      padding: 30mm;
      border: 15px solid #ffd700;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      position: relative;
      text-align: center;
    }

    .ornament {
      position: absolute;
      width: 100px;
      height: 100px;
      border: 3px solid #ffd700;
      border-radius: 50%;
    }

    .ornament.top-left {
      top: 20px;
      left: 20px;
      border-right: none;
      border-bottom: none;
    }

    .ornament.top-right {
      top: 20px;
      right: 20px;
      border-left: none;
      border-bottom: none;
    }

    .ornament.bottom-left {
      bottom: 20px;
      left: 20px;
      border-right: none;
      border-top: none;
    }

    .ornament.bottom-right {
      bottom: 20px;
      right: 20px;
      border-left: none;
      border-top: none;
    }

    .logo {
      font-size: 14px;
      color: #667eea;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 20px;
    }

    .title {
      font-size: 48px;
      font-weight: bold;
      color: #333;
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    .subtitle {
      font-size: 24px;
      color: #666;
      margin-bottom: 40px;
    }

    .content {
      font-size: 18px;
      line-height: 1.8;
      color: #444;
      margin-bottom: 30px;
      text-align: justify;
      text-align-last: center;
    }

    .student-name {
      font-size: 28px;
      font-weight: bold;
      color: #667eea;
      margin: 0 5px;
    }

    .course-name {
      font-weight: bold;
      color: #764ba2;
      margin: 0 5px;
    }

    .score {
      font-size: 24px;
      font-weight: bold;
      color: #ffd700;
      margin: 20px 0;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
      display: inline-block;
    }

    .date {
      font-size: 16px;
      color: #666;
      margin: 30px 0;
    }

    .signature-line {
      width: 300px;
      border-top: 2px solid #333;
      margin: 50px auto 10px;
    }

    .signature-title {
      font-size: 14px;
      color: #666;
    }

    .hash {
      position: absolute;
      bottom: 15px;
      right: 30px;
      font-size: 10px;
      color: #999;
      font-family: 'Courier New', monospace;
    }

    .verification {
      position: absolute;
      bottom: 15px;
      left: 30px;
      font-size: 10px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="ornament top-left"></div>
    <div class="ornament top-right"></div>
    <div class="ornament bottom-left"></div>
    <div class="ornament bottom-right"></div>

    <div class="logo">SKILLPRO - PLATAFORMA DE EDUCAÇÃO</div>

    <div class="title">Certificado</div>

    <div class="subtitle">de Conclusão de Curso</div>

    <div class="content">
      Certificamos que
      <span class="student-name">${data.studentName}</span>,
      portador(a) do CPF <strong>${data.studentCpf}</strong>,
      concluiu com êxito o curso
      <span class="course-name">"${data.courseName}"</span>
      com carga horária de <strong>${data.courseDuration}</strong>.
    </div>

    <div class="content">
      O aluno demonstrou excelente desempenho durante o curso,
      obtendo aprovação na avaliação final.
    </div>

    <div class="score">
      Nota Final: ${data.finalScore.toFixed(1)}%
    </div>

    <div class="date">
      Emitido em ${data.completionDate}
    </div>

    <div class="signature-line"></div>
    <div class="signature-title">Diretor Acadêmico</div>
    <div class="signature-title">SkillPro Educação</div>

    <div class="verification">
      Verificar autenticidade em: skillpro.com/verificar/${data.certificateHash}
    </div>

    <div class="hash">
      Hash: ${data.certificateHash}
    </div>
  </div>
</body>
</html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export function generateDigitalSignature(data: string, secret: string): string {
  return createHash("sha256")
    .update(data + secret)
    .digest("hex");
}

export function verifyDigitalSignature(
  data: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateDigitalSignature(data, secret);
  return signature === expectedSignature;
}
