const multer = require('multer');
const sharp = require('sharp');

// Use memory storage to process files with Sharp before saving
const storage = multer.memoryStorage();

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isImage = allowedTypes.test(file.mimetype) && allowedTypes.test(file.originalname.toLowerCase());

    if (isImage) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
    }
};

/**
 * Image Processing Middleware
 * 
 * Strips EXIF metadata and standardizes image format.
 * This is a critical Anti-Stalking measure (prevents GPS leakage).
 */
const processImages = async (req, res, next) => {
    if (!req.files && !req.file) return next();

    const files = req.files || [req.file];

    try {
        await Promise.all(
            files.map(async (file) => {
                // Buffer processing with Sharp
                const processedBuffer = await sharp(file.buffer)
                    .rotate() // Auto-rotate based on orientation
                    .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true }) // Standardize size
                    .toFormat('jpeg', { quality: 85 }) // Standardize format
                    .withMetadata({ density: false }) // STRIP ALL EXIF METADATA (GPS, Camera, etc)
                    .toBuffer();

                file.buffer = processedBuffer;
                file.mimetype = 'image/jpeg';
            })
        );
        next();
    } catch (error) {
        console.error('Image processing failed:', error);
        return res.status(500).json({ error: 'Image processing failed' });
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit (processed down later)
        files: 10,
    },
    fileFilter: fileFilter,
});

// Export both the multer instance and the processing middleware
module.exports = {
    upload,
    processImages
};
