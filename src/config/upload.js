const multer = require('multer');

// Use memory storage for processing files before uploading to Firebase
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

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
        files: 10, // Max 10 files
    },
    fileFilter: fileFilter,
});

module.exports = upload;
