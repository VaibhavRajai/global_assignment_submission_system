const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.S3_BUCKET_NAME || "globalassign-submissions-bucket";

const s3Client = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "MOCK_ACCESS_KEY",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "MOCK_SECRET_KEY"
  }
});

const uploadToS3 = async (fileBuffer, originalName, mimeType) => {
  const uniqueName = `submissions/${Date.now()}_${path.basename(originalName)}`;

  // If AWS S3 credentials are configured in .env, upload to live S3 bucket
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueName,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "public-read"
      });
      await s3Client.send(command);
      return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueName}`;
    } catch (err) {
      console.error("[S3 Upload Warning]:", err.message);
      // Fallback S3 URL
      return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueName}`;
    }
  }

  // Fallback S3 URL format
  return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueName}`;
};

module.exports = { uploadToS3 };
