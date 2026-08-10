import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcrypt";

const getParamId = (value: string | string[] | undefined): string | null => {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [
            totalOrders,
            totalUsers,
            totalProducts,
            outOfStock,
            totalPartners,
            recentOrders,
        ] = await Promise.all([
            prisma.order.count({
                where: {
                    NOT: [
                        {
                            paymentMethod: "card",
                            isPaid: false,
                        },
                    ],
                },
            }),

            prisma.user.count(),
            prisma.product.count(),
            prisma.product.count({
                where: {
                    stock: 0,
                },
            }),

            prisma.deliveryPartner.count(),

            prisma.order.findMany({
                where: {
                    NOT: [
                        {
                            paymentMethod: "card",
                            isPaid: false,
                        },
                    ],
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 8,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    deliveryPartner: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
            }),
        ]);

        return res.status(200).json({
            totalOrders,
            totalUsers,
            totalProducts,
            outOfStock,
            totalPartners,
            recentOrders,
        });
    } catch (error: any) {
        console.error("Admin stats error:", error);

        return res.status(500).json({
            message: "Failed to fetch admin statistics",
            error: error.message,
        });
    }
};

export const getDeliveryPartners = async (
    req: Request,
    res: Response
) => {
    try {
        const partners = await prisma.deliveryPartner.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            partners,
        });
    } catch (error: any) {
        console.error("Get delivery partners error:", error);

        return res.status(500).json({
            message: "Failed to fetch delivery partners",
            error: error.message,
        });
    }
};

export const createDeliveryPartners = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            vehicleType,
        } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "Please provide all required fields",
            });
        }

        const normalizedEmail = String(email)
            .trim()
            .toLowerCase();

        const existingPartner =
            await prisma.deliveryPartner.findUnique({
                where: {
                    email: normalizedEmail,
                },
            });

        if (existingPartner) {
            return res.status(400).json({
                message:
                    "A delivery partner with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(
            String(password),
            10
        );

        const partner =
            await prisma.deliveryPartner.create({
                data: {
                    name: String(name).trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    phone: String(phone).trim(),
                    vehicleType:
                        vehicleType || "bike",
                },
            });

        const {
            password: _password,
            ...partnerData
        } = partner;

        return res.status(201).json({
            partner: partnerData,
        });
    } catch (error: any) {
        console.error("Create delivery partner error:", error);

        return res.status(500).json({
            message: "Failed to create delivery partner",
            error: error.message,
        });
    }
};

export const updateDeliveryPartners = async (
    req: Request,
    res: Response
) => {
    try {
        const id = getParamId(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Delivery partner ID is required",
            });
        }

        const {
            name,
            phone,
            isActive,
            vehicleType,
        } = req.body;

        const data: {
            name?: string;
            phone?: string;
            isActive?: boolean;
            vehicleType?: string;
        } = {};

        if (name !== undefined) {
            data.name = String(name).trim();
        }

        if (phone !== undefined) {
            data.phone = String(phone).trim();
        }

        if (vehicleType !== undefined) {
            data.vehicleType = String(vehicleType);
        }

        if (isActive !== undefined) {
            data.isActive = Boolean(isActive);
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                message: "No fields provided for update",
            });
        }

        const existingPartner =
            await prisma.deliveryPartner.findUnique({
                where: {
                    id,
                },
            });

        if (!existingPartner) {
            return res.status(404).json({
                message: "Delivery partner not found",
            });
        }

        const partner =
            await prisma.deliveryPartner.update({
                where: {
                    id,
                },
                data,
            });

        const {
            password: _password,
            ...partnerData
        } = partner;

        return res.status(200).json({
            partner: partnerData,
        });
    } catch (error: any) {
        console.error("Update delivery partner error:", error);

        return res.status(500).json({
            message: "Failed to update delivery partner",
            error: error.message,
        });
    }
};

export const assignDeliveryPartner = async (
    req: Request,
    res: Response
) => {
    try {
        const orderId = getParamId(req.params.id);
        const { partnerId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }

        if (!partnerId) {
            return res.status(400).json({
                message: "Delivery partner ID is required",
            });
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const partner =
            await prisma.deliveryPartner.findUnique({
                where: {
                    id: String(partnerId),
                },
            });

        if (!partner) {
            return res.status(404).json({
                message: "Delivery partner not found",
            });
        }

        if (partner.isActive === false) {
            return res.status(400).json({
                message:
                    "This delivery partner is currently inactive",
            });
        }

        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        let status = order.status;

        const history: any[] = Array.isArray(
            order.statusHistory
        )
            ? [...order.statusHistory]
            : [];

        if (
            order.status === "Placed" ||
            order.status === "Confirmed"
        ) {
            status = "Assigned";

            history.push({
                status: "Assigned",
                note: `Assigned to ${partner.name}`,
                timestamp: new Date().toISOString(),
            });
        }

        const updatedOrder =
            await prisma.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    deliveryPartnerId: partner.id,
                    deliveryOtp: otp,
                    status,
                    statusHistory: history,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    deliveryPartner: {
                        select: {
                            name: true,
                            phone: true,
                            email: true,
                            avatar: true,
                            vehicleType: true,
                        },
                    },
                },
            });

        return res.status(200).json({
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error(
            "Assign delivery partner error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to assign delivery partner",
            error: error.message,
        });
    }
};