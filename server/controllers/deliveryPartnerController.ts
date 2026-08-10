import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";

const getParamId = (
    value: string | string[] | undefined
): string | null => {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
};

const generateToken = (id: string) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            id,
            role: "delivery",
        },
        secret,
        {
            expiresIn: "30d",
        }
    );
};

export const loginPartner = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        const normalizedEmail = String(email)
            .trim()
            .toLowerCase();

        const partner =
            await prisma.deliveryPartner.findUnique({
                where: {
                    email: normalizedEmail,
                },
            });

        if (!partner) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (partner.isActive === false) {
            return res.status(403).json({
                message:
                    "Your account has been deactivated",
            });
        }

        const isMatch = await bcrypt.compare(
            String(password),
            partner.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(partner.id);
        const {
            password: _password,
            ...partnerData
        } = partner;

        return res.status(200).json({
            partner: partnerData,
            token,
        });
    } catch (error: any) {
        console.error("Delivery partner login error:", error);

        return res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
};


export const getMyDeliveries = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.partner) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { status } = req.query;

        const where: any = {
            deliveryPartnerId: req.partner.id,
        };

        if (status === "active") {
            where.status = {
                in: [
                    "Assigned",
                    "Packed",
                    "Out for Delivery",
                ],
            };
        } else if (status === "completed") {
            where.status = {
                in: [
                    "Delivered",
                    "Cancelled",
                ],
            };
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            orders,
        });
    } catch (error: any) {
        console.error("Get deliveries error:", error);

        return res.status(500).json({
            message: "Failed to fetch deliveries",
            error: error.message,
        });
    }
};

export const getDeliveryDetail = async (req: Request, res: Response) => {
    try {
        if (!req.partner) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const id = getParamId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Delivery ID is required",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                deliveryPartnerId: req.partner.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Delivery not found",
            });
        }

        return res.status(200).json({
            order,
        });
    } catch (error: any) {
        console.error("Get delivery detail error:", error);

        return res.status(500).json({
            message: "Failed to fetch delivery",
            error: error.message,
        });
    }
};

export const completeDelivery = async (req: Request, res: Response) => {
    try {
        if (!req.partner) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const id = getParamId(req.params.id);
        const { otp } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Delivery ID is required",
            });
        }

        if (!otp) {
            return res.status(400).json({
                message: "Delivery OTP is required",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                deliveryPartnerId: req.partner.id,
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Delivery not found",
            });
        }

        if (
            order.status === "Cancelled" ||
            order.status === "Delivered"
        ) {
            return res.status(400).json({
                message: "Invalid request",
            });
        }

        if (order.deliveryOtp !== String(otp)) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        const history: any[] = Array.isArray(
            order.statusHistory
        )
            ? [...order.statusHistory]
            : [];

        history.push({
            status: "Delivered",
            note: "Delivered by partner",
            timestamp: new Date().toISOString(),
        });

        const updatedOrder =
            await prisma.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status: "Delivered",
                    statusHistory: history,
                    deliveryOtp: "",
                },
            });

        return res.status(200).json({
            order: updatedOrder,
            message: "Delivery completed successfully",
        });
    } catch (error: any) {
        console.error("Complete delivery error:", error);

        return res.status(500).json({
            message: "Failed to complete delivery",
            error: error.message,
        });
    }
};

export const cancelDelivery = async (req: Request, res: Response ) => {
    try {
        if (!req.partner) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const id = getParamId(req.params.id);
        const { reason } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Delivery ID is required",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                deliveryPartnerId: req.partner.id,
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Delivery not found",
            });
        }

        if (order.status === "Delivered") {
            return res.status(400).json({
                message:
                    "Cannot cancel a delivered order",
            });
        }

        if (order.status === "Cancelled") {
            return res.status(400).json({
                message: "Delivery is already cancelled",
            });
        }

        const history: any[] = Array.isArray(
            order.statusHistory
        )
            ? [...order.statusHistory]
            : [];

        history.push({
            status: "Cancelled",
            note: reason || "Delivery cancelled by partner",
            timestamp: new Date().toISOString(),
        });

        const updatedOrder =
            await prisma.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status: "Cancelled",
                    statusHistory: history,
                },
            });

        return res.status(200).json({
            order: updatedOrder,
            message: "Delivery cancelled",
        });
    } catch (error: any) {
        console.error("Cancel delivery error:", error);

        return res.status(500).json({
            message: "Failed to cancel delivery",
            error: error.message,
        });
    }
};

export const updateDeliveryStatus = async (req: Request, res: Response ) => {
    try {
        if (!req.partner) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const id = getParamId(req.params.id);
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Delivery ID is required",
            });
        }

        const allowedStatuses = [
            "Packed",
            "Out for Delivery",
        ];

        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status update",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                deliveryPartnerId: req.partner.id,
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Delivery not found",
            });
        }

        if (
            order.status === "Delivered" ||
            order.status === "Cancelled"
        ) {
            return res.status(400).json({
                message:
                    "Cannot update the status of this delivery",
            });
        }

        const history: any[] = Array.isArray(
            order.statusHistory
        )
            ? [...order.statusHistory]
            : [];

        history.push({
            status,
            note: `Status updated to ${status}`,
            timestamp: new Date().toISOString(),
        });

        const updatedOrder =
            await prisma.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    status,
                    statusHistory: history,
                },
            });

        return res.status(200).json({
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error(
            "Update delivery status error:",
            error
        );

        return res.status(500).json({
            message: "Failed to update delivery status",
            error: error.message,
        });
    }
};

export const updateLocation = async (req: Request, res: Response) => {
    try {
        if (!req.partner) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const id = getParamId(req.params.id);
        const { lat, lng } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Delivery ID is required",
            });
        }

        if (
            lat === undefined ||
            lng === undefined ||
            lat === null ||
            lng === null
        ) {
            return res.status(400).json({
                message:
                    "Latitude and longitude are required",
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lng);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                message:
                    "Latitude and longitude must be valid numbers",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                deliveryPartnerId: req.partner.id,
                status: {
                    in: [
                        "Assigned",
                        "Packed",
                        "Out for Delivery",
                    ],
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                message:
                    "Active delivery not found",
            });
        }

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                liveLocation: {
                    lat: latitude,
                    lng: longitude,
                    updatedAt: new Date().toISOString(),
                },
            },
        });

        return res.status(200).json({
            success: true,
        });
    } catch (error: any) {
        console.error("Update location error:", error);

        return res.status(500).json({
            message: "Failed to update delivery location",
            error: error.message,
        });
    }
};