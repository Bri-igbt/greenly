import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import productRouter from "./routes/productRoutes";
import uplaodRouter from "./routes/uploadRoutes";
import orderRouter from "./routes/orderRoutes";
import { serve } from "inngest/express";

import { inngest, functions } from "./inngest/index"
import addressRouter from "./routes/addressRoutes";
import deliveryPartnerRouter from "./routes/deliveryPartnerRoutes";
import adminRouter from "./routes/adminRoutes";

const app = express();

app.use(cors())
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRouter);
app.use("/api/upload", uplaodRouter);
app.use("/api/orders", orderRouter);
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/addresses", addressRouter)
app.use("/api/delivery", deliveryPartnerRouter)
app.use("/api/admin", adminRouter)

//Error Handling
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error(error)
    res.status(500).json({message: error.message})
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});