import express from "express";
import auth from "../middleware/auth";
import multer from "multer";
import cloudinary from "../config/cloudinary";

const uploadRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, 
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

uploadRouter.post(
    "/",
    auth,
    upload.single("image"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "No image file provided",
                });
            }

            const result = await new Promise<any>((resolve, reject) => {
                const uploadStream =
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "grocery-del",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );

                uploadStream.end(req.file!.buffer);
            });

            return res.status(200).json({
                url: result.secure_url,
                public_id: result.public_id,
            });
        } catch (error: any) {
            return res.status(500).json({
                message:
                    error?.message ||
                    "Cloudinary upload failed",
                cloudinaryCode:
                    error?.http_code || null,
            });
        }
    }
);

export default uploadRouter;

