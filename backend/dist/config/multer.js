import multer from "multer";
export const resumeUpload = multer({
    storage: multer.memoryStorage(), // 🔥 IMPORTANT CHANGE
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }
        cb(null, true);
    },
});
