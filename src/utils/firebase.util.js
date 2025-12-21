const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - Multer file object
 * @param {string} folder - Folder name in storage (e.g. 'rentals', 'profiles')
 * @returns {Promise<string>} Public URL of the uploaded file
 */
async function uploadImage(file, folder = 'uploads') {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error('No file provided'));
        }

        const fileName = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;
        const fileUpload = bucket.file(fileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
            resumable: false,
        });

        blobStream.on('error', (error) => {
            reject(error);
        });

        blobStream.on('finish', async () => {
            try {
                // Make the file public
                await fileUpload.makePublic();

                // Get the public URL
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(file.buffer);
    });
}

/**
 * Upload multiple images
 * @param {Array} files - Array of multer file objects
 * @param {string} folder - Folder name
 * @returns {Promise<Array<string>>} Array of public URLs
 */
async function uploadMultipleImages(files, folder = 'uploads') {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return [];
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    return Promise.all(uploadPromises);
}

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - Public URL of the image
 */
async function deleteImage(imageUrl) {
    try {
        if (!imageUrl) return;

        // Extract file path from URL
        // URL format: https://storage.googleapis.com/BUCKET_NAME/FOLDER/FILENAME
        const parts = imageUrl.split(`https://storage.googleapis.com/${bucket.name}/`);

        if (parts.length === 2) {
            const filePath = parts[1];
            await bucket.file(filePath).delete();
        }
    } catch (error) {
        console.error('Error deleting image from Firebase:', error);
        // Don't throw error to avoid breaking main flow, just log it
    }
}

module.exports = {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
};
