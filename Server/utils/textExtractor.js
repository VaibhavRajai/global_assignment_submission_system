const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const Submission = require('../models/submission.model');

/**
 * Detect file type based on mimeType and fileName
 */
const detectFileType = (mimeType = '', fileName = '') => {
    const mime = mimeType.toLowerCase();
    const name = fileName.toLowerCase();

    if (
        mime.startsWith('image/') ||
        name.endsWith('.png') ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.webp') ||
        name.endsWith('.bmp') ||
        name.endsWith('.tiff')
    ) {
        return 'image';
    }

    if (
        mime === 'application/pdf' ||
        mime.includes('word') ||
        mime.includes('text') ||
        name.endsWith('.pdf') ||
        name.endsWith('.txt') ||
        name.endsWith('.doc') ||
        name.endsWith('.docx')
    ) {
        return 'document';
    }

    return 'document';
};

/**
 * Extract text from document or image buffer
 */
const extractTextFromBuffer = async (fileBuffer, type) => {
    if (!fileBuffer || fileBuffer.length === 0) return '';

    if (type === 'document') {
        try {
            const pdfData = await pdfParse(fileBuffer);
            return pdfData.text ? pdfData.text.trim() : '';
        } catch (pdfErr) {
            // Fallback for text files or unparseable documents
            try {
                return fileBuffer.toString('utf-8').trim();
            } catch (err) {
                return '';
            }
        }
    } else if (type === 'image') {
        try {
            const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng', {
                logger: () => {} // silent logger
            });
            return text ? text.trim() : '';
        } catch (ocrErr) {
            console.error('Tesseract OCR Extraction Error:', ocrErr.message);
            return '';
        }
    }

    return '';
};

/**
 * Background async task to extract text and update submission document in MongoDB
 */
const processSubmissionTextInBackground = async (submissionId, fileBuffer, type) => {
    try {
        const extractedText = await extractTextFromBuffer(fileBuffer, type);
        await Submission.findByIdAndUpdate(submissionId, {
            data: extractedText,
            extractedAt: new Date()
        });
        console.log(`[Background Extraction Complete] Submission ${submissionId} (${type}) text stored (${extractedText.length} chars).`);
    } catch (error) {
        console.error(`[Background Extraction Failed] Submission ${submissionId}:`, error.message);
    }
};

module.exports = {
    detectFileType,
    extractTextFromBuffer,
    processSubmissionTextInBackground
};
