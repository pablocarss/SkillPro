const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "skillpro",
  secretKey: process.env.MINIO_SECRET_KEY || "skillpro123",
});

const bucketName = process.env.MINIO_BUCKET || "skillpro";

async function initMinIO() {
  try {
    console.log("🔧 Verificando conexão com MinIO...");

    const exists = await minioClient.bucketExists(bucketName);

    if (!exists) {
      console.log(`📦 Criando bucket "${bucketName}"...`);
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`✅ Bucket "${bucketName}" criado com sucesso!`);

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

      console.log("🔓 Configurando política de acesso público...");
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log("✅ Política configurada com sucesso!");
    } else {
      console.log(`✅ Bucket "${bucketName}" já existe!`);
    }

    console.log("\n🎉 MinIO está pronto para uso!");
    console.log(`📍 Console: http://localhost:9001`);
    console.log(`📍 API: http://localhost:9000`);
    console.log(`📍 Bucket: ${bucketName}\n`);

  } catch (error) {
    console.error("❌ Erro ao inicializar MinIO:", error);
    process.exit(1);
  }
}

initMinIO();
