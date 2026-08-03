require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const bucketName = process.env.AWS_BUCKET_NAME || 'global-assign';
const region = process.env.AWS_REGION || 'us-east-1';

const accessKeyId = process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId,
        secretAccessKey
    },
    followRegionRedirects: true
});

/**
 * Upload file buffer or data to AWS S3
 */
const uploadToS3 = async (fileBuffer, originalName, mimeType = 'application/octet-stream') => {
    const timestamp = Date.now();
    const sanitizedFileName = originalName ? originalName.replace(/\s+/g, '_') : 'assignment_submission.pdf';
    const fileKey = `submissions/${timestamp}_${sanitizedFileName}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: mimeType
    });

    await s3Client.send(command);

    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    const fileHash = '0x' + crypto.createHash('sha256').update(fileBuffer).digest('hex').substring(0, 12).toUpperCase();

    return { fileKey, fileUrl, fileHash, fileName: originalName || sanitizedFileName };
};

/**
 * Generate S3 Presigned URL for viewing/downloading submission files securely
 */
const generatePresignedUrl = async (fileKey, expiresInSeconds = 3600) => {
    if (!fileKey) return null;

    let key = fileKey;
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
        try {
            const urlObj = new URL(fileKey);
            key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        } catch (e) {
            key = fileKey;
        }
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    } catch (error) {
        console.error('Error generating S3 presigned URL:', error);
        return null;
    }
};

module.exports = {
    s3Client,
    uploadToS3,
    generatePresignedUrl
};
