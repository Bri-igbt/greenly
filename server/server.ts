import "dotenv/config";
import express, {
    NextFunction,
    Request,
    Response,
} from "express";

import cors from "cors";

import authRoutes from "./routes/authRoutes";
import productRouter from "./routes/productRoutes";
import uplaodRouter from "./routes/uploadRoutes";
import orderRouter from "./routes/orderRoutes";

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index";

import addressRouter from "./routes/addressRoutes";
import deliveryPartnerRouter from "./routes/deliveryPartnerRoutes";
import adminRouter from "./routes/adminRoutes";

import { stripeWebhook } from "./controllers/webhook";

const app = express();

const port = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
    "http://localhost:3000",
    "https://greenlygroceries.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("CORS BLOCKED:", origin);

            return callback(
                new Error(
                    `Origin ${origin} not allowed by CORS`
                )
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],

        credentials: true,
    })
);

/*
|--------------------------------------------------------------------------
| Stripe Webhook
|--------------------------------------------------------------------------
*/

app.post(
    "/api/stripe",
    express.raw({
        type: "application/json",
    }),
    stripeWebhook
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Server is Live!",
    });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/products", productRouter);

app.use("/api/upload", uplaodRouter);

app.use("/api/orders", orderRouter);

app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions,
    })
);

app.use("/api/addresses", addressRouter);

app.use("/api/delivery", deliveryPartnerRouter);

app.use("/api/admin", adminRouter);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(
    (
        error: any,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        console.error("SERVER ERROR:", error);

        res.status(error.status || 500).json({
            success: false,
            message:
                error.message ||
                "Internal server error",
        });
    }
);

/*
|--------------------------------------------------------------------------
| Local Development
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(
            `Server is running on http://localhost:${port}`
        );
    });
}

export default app;
