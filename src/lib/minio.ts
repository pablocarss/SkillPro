import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "skillpro",
  secretKey: process.env.MINIO_SECRET_KEY || "skillpro123",
});

const bucketName = process.env.MINIO_BUCKET || "skillpro";

export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      // Set bucket policy to allow public read access
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
  }
}

export async function uploadVideo(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  await ensureBucketExists();

  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const objectName = `videos/${timestamp}-${sanitizedFileName}`;

  await minioClient.putObject(bucketName, objectName, file, {
    "Content-Type": contentType,
  });

  // Return the URL to access the file
  const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
  return url;
}

export async function deleteVideo(videoUrl: string): Promise<void> {
  try {
    // Extract object name from URL
    const urlParts = videoUrl.split(`/${bucketName}/`);
    if (urlParts.length === 2) {
      const objectName = urlParts[1];
      await minioClient.removeObject(bucketName, objectName);
    }
  } catch (error) {
    console.error("Error deleting video:", error);
  }
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "files"
): Promise<string> {
  await ensureBucketExists();

  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const objectName = `${folder}/${timestamp}-${sanitizedFileName}`;

  const metadata: Record<string, string> = {
    "Content-Type": contentType,
  };

  // For PDFs, set Content-Disposition to inline so they open in browser instead of downloading
  if (contentType === "application/pdf") {
    metadata["Content-Disposition"] = "inline";
  }

  await minioClient.putObject(bucketName, objectName, file, metadata);

  // Return the URL to access the file
  const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
  return url;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract object name from URL
    const urlParts = fileUrl.split(`/${bucketName}/`);
    if (urlParts.length === 2) {
      const objectName = urlParts[1];
      await minioClient.removeObject(bucketName, objectName);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export { minioClient, bucketName };
