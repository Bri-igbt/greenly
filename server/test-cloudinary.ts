import "dotenv/config";
import cloudinary from "./config/cloudinary";

async function testCloudinary() {
    console.log("========== CLOUDINARY TEST ==========");

    console.log({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key_exists: !!process.env.CLOUDINARY_API_KEY,
        api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
    });

    try {
        const result = await cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            {
                folder: "grocery-del-test",
            }
        );

        console.log("========== UPLOAD SUCCESS ==========");
        console.log({
            public_id: result.public_id,
            secure_url: result.secure_url,
        });
    } catch (error: any) {
        console.log("========== UPLOAD FAILED ==========");

        console.log("Message:", error?.message);
        console.log("HTTP code:", error?.http_code);
        console.log("Name:", error?.name);
        console.log("Error:", error);

        if (error?.response) {
            console.log("Response:", error.response);
        }
    }
}

testCloudinary();