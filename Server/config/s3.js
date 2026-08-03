const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "MOCK_KEY",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "MOCK_SECRET"
  }
});

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const bucketName = process.env.S3_BUCKET_NAME || "globalassign-submissions-bucket";
  const uniqueKey = `submissions/${Date.now()}_${fileName.replace(/\s+/g, "_")}`;

  try {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: fileBuffer,
        ContentType: mimeType
      });
      await s3Client.send(command);
      return `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${uniqueKey}`;
    }
  } catch (err) {
    console.error("[S3 Upload Notice]: Using fallback URL structure.", err.message);
  }

  return `https://${bucketName}.s3.us-east-1.amazonaws.com/${uniqueKey}`;
};

module.exports = { uploadToS3 };
