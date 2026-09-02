import {Request, Response} from 'express'
import { prisma } from '../config/prisma';
import { inngest } from '../inngest';
import Stripe from 'stripe';

// Create user's orders
//POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { items, shippingAddress, paymentMethod } = req.body;

        // Validate order items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "No order items provided",
            });
        }

        // Get all requested products
        const productIds = items.map((item: any) => item.product);

        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
            },
        });

        const productMap: Record<string, (typeof products)[number]> = {};

        products.forEach((product) => {
            productMap[product.id] = product;
        });

        // Check stock
        for (const item of items) {
            const product = productMap[item.product];

            if (!product) {
                return res.status(404).json({
                    message: `Product ${item.product} not found`,
                });
            }

            if ((product.stock ?? 0) < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} is out of stock`,
                });
            }
        }

        // Build order items using DB prices
        const orderItems = items.map((item: any) => {
            const dbProduct = productMap[item.product];

            return {
                product: dbProduct.id,
                name: dbProduct.name,
                image: dbProduct.image,
                price: dbProduct.price,
                quantity: item.quantity,
                unit: dbProduct.unit,
            };
        });

        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const deliveryFee = subtotal > 20 ? 0 : 1.99;
        const tax = Math.round(subtotal * 0.08 * 100) / 100;
        const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

        // Transaction
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: req.user!.id,
                    items: orderItems,
                    shippingAddress,
                    paymentMethod,
                    subtotal,
                    deliveryFee,
                    tax,
                    total,
                    statusHistory: [
                        {
                            status: "Placed",
                            note: "Order placed successfully",
                            timestamp: new Date(),
                        },
                    ],
                },
            });

            // Reduce stock
            for (const item of orderItems) {
                await tx.product.update({
                    where: {
                        id: item.product,
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            return newOrder;
        });

        // TODO: Stripe payment
        if (paymentMethod === "card") {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

            const session = await stripe.checkout.sessions.create({
            success_url: `${req.headers.origin}/orders?clearCart=true`,
            cancel_url: `${req.headers.origin}/checkout`,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Payment Groceries"
                        },
                        unit_amount: Math.round(total * 100)
                    },
                    quantity: 1,
                }
                
            ],
            mode: 'payment',
            metadata: {orderId: order.id}
            });
            return res.json({url: session.url})
        }

        // Send stock update events for each product in the order
        for (const item of orderItems) {
            await inngest.send({ name: "inventory/stock.updated", data: {productIds: item.product}})
        }

        await inngest.send({name: "order/placed", data: { orderId: order.id}})

        return res.status(201).json({
            order,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create order",
            error: error.message,
        });
    }
};

// Get user's orders
// GET /api/orders
export const getUserOrder = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const status = req.query.status as string | undefined;

        const where: any = {
            userId: req.user.id,
            NOT: [
                {
                    paymentMethod: "card",
                    isPaid: false,
                },
            ],
        };

        if (status && status !== "all") {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                deliveryPartner: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({ orders });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get orders
// GET /api/orders
export const getOrder = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { id } = req.params;

        if (Array.isArray(id)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
            include: {
                deliveryPartner: {
                    select: {
                        name: true,
                        phone: true,
                        avatar: true,
                        vehicleType: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json({
            order,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch order",
            error: error.message,
        });
    }
};

// Update order status (admin)
// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, note } = req.body;

        const { id } = req.params;

        if (Array.isArray(id)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const history = Array.isArray(order.statusHistory)
            ? [...(order.statusHistory as any[])]
            : [];

        history.push({
            status,
            note: note || `Order ${status.toLowerCase()}`,
            timestamp: new Date(),
        });

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                statusHistory: history,
            },
        });

        return res.status(200).json({
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to update order status",
            error: error.message,
        });
    }
};

// Get all orders (admin)
// GET /api/orders/all
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                NOT: [
                    {
                        paymentMethod: "card",
                        isPaid: false,
                    },
                ],
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
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get Order Location
// GET /api/orders/:id/location
export const getOrderLocation = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { id } = req.params;

        if (Array.isArray(id)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
            select: {
                liveLocation: true,
                status: true,
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json({
            liveLocation: order.liveLocation,
            status: order.status,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch order location",
            error: error.message,
        });
    }
};