import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  // Create temporary files
  const timestamp = Date.now();
  const tempDir = tmpdir();
  const inputFileName = `cert-input-${timestamp}.docx`;
  const inputPath = join(tempDir, inputFileName);
  // LibreOffice names output file based on input file name
  const outputFileName = inputFileName.replace(".docx", ".pdf");
  const outputPath = join(tempDir, outputFileName);

  try {
    // Write DOCX to temp file
    await writeFile(inputPath, docxBuffer);

    // Convert using LibreOffice (soffice)
    // --headless: run without GUI
    // --convert-to pdf: convert to PDF format
    // --outdir: output directory
    const command = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
    });

    if (stderr) {
      console.log("LibreOffice stderr:", stderr);
    }

    // Wait a bit for file to be written
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Read the generated PDF
    const pdfBuffer = await readFile(outputPath);

    return pdfBuffer;
  } catch (error) {
    console.error("Error converting DOCX to PDF:", error);
    throw new Error("Failed to convert DOCX to PDF");
  } finally {
    // Clean up temporary files
    try {
      await unlink(inputPath).catch(() => {});
      await unlink(outputPath).catch(() => {});
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
}
