import { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../config/prisma";
import { inngest } from "../inngest";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(stripeSecretKey);

export const stripeWebhook = async (
    request: Request,
    response: Response
) => {
    let event: Stripe.Event;

    // --------------------------------------------------
    // Verify Stripe webhook signature
    // --------------------------------------------------
    if (endpointSecret) {
        const signature = request.headers["stripe-signature"];

        if (!signature) {
            console.error("Missing Stripe signature");

            return response.status(400).json({
                success: false,
                message: "Missing Stripe signature",
            });
        }

        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                signature,
                endpointSecret
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown webhook verification error";

            console.error(
                "⚠️ Webhook signature verification failed:",
                message
            );

            return response.status(400).json({
                success: false,
                message: "Webhook signature verification failed",
            });
        }
    } else {
        console.warn(
            "STRIPE_WEBHOOK_SECRET is not configured. Webhook signature verification is disabled."
        );

        // Only use this if you intentionally want to accept
        // unsigned webhook requests.
        event = request.body as Stripe.Event;
    }

    try {
        // --------------------------------------------------
        // Handle Stripe event
        // --------------------------------------------------
        switch (event.type) {
            // ==================================================
            // PAYMENT SUCCEEDED
            // ==================================================
            case "payment_intent.succeeded": {
                const paymentIntent =
                    event.data.object as Stripe.PaymentIntent;

                const paymentIntentId = paymentIntent.id;

                console.log(
                    `Payment succeeded: ${paymentIntentId}`
                );

                // --------------------------------------------------
                // Find Checkout Session
                // --------------------------------------------------
                const sessions =
                    await stripe.checkout.sessions.list({
                        payment_intent: paymentIntentId,
                        limit: 1,
                    });

                const session = sessions.data[0];

                if (!session) {
                    console.error(
                        `No Checkout Session found for PaymentIntent: ${paymentIntentId}`
                    );

                    return response.status(400).json({
                        success: false,
                        message: "Checkout session not found",
                    });
                }

                const orderId = session.metadata?.orderId;

                if (!orderId) {
                    console.error(
                        `No orderId found in Stripe metadata for PaymentIntent: ${paymentIntentId}`
                    );

                    return response.status(400).json({
                        success: false,
                        message: "orderId missing from Stripe metadata",
                    });
                }

                // --------------------------------------------------
                // Find the order first
                // --------------------------------------------------
                const existingOrder = await prisma.order.findUnique({
                    where: {
                        id: orderId,
                    },
                });

                if (!existingOrder) {
                    console.error(
                        `Order not found: ${orderId}`
                    );

                    return response.status(404).json({
                        success: false,
                        message: "Order not found",
                    });
                }

                // --------------------------------------------------
                // Prevent duplicate stock updates
                // --------------------------------------------------
                if (existingOrder.isPaid) {
                    console.log(
                        `Order ${orderId} has already been marked as paid`
                    );

                    return response.status(200).json({
                        received: true,
                    });
                }

                // --------------------------------------------------
                // Mark order as paid
                // --------------------------------------------------
                const paidOrder = await prisma.order.update({
                    where: {
                        id: orderId,
                    },
                    data: {
                        isPaid: true,
                    },
                });

                console.log(
                    `Order ${orderId} marked as paid`
                );

                // --------------------------------------------------
                // Get order items
                // --------------------------------------------------
                const orderItems = Array.isArray(paidOrder.items)
                    ? paidOrder.items
                    : [];

                // --------------------------------------------------
                // Update product stock
                // --------------------------------------------------
                for (const item of orderItems) {
                    if (
                        !item ||
                        typeof item !== "object" ||
                        !("product" in item) ||
                        !("quantity" in item)
                    ) {
                        console.warn(
                            "Invalid order item:",
                            item
                        );

                        continue;
                    }

                    const productId = String(
                        (item as { product: string }).product
                    );

                    const quantity = Number(
                        (item as { quantity: number }).quantity
                    );

                    if (!productId || !Number.isFinite(quantity)) {
                        console.warn(
                            "Invalid product or quantity:",
                            item
                        );

                        continue;
                    }

                    await prisma.product.update({
                        where: {
                            id: productId,
                        },
                        data: {
                            stock: {
                                decrement: quantity,
                            },
                        },
                    });
                }

                await inngest.send({
                    name: "order/placed",
                    data: {
                        orderId,
                    },
                });

                for (const item of orderItems) {
                    if (
                        !item ||
                        typeof item !== "object" ||
                        !("product" in item)
                    ) {
                        continue;
                    }

                    const productId = String(
                        (item as { product: string }).product
                    );

                    await inngest.send({
                        name: "inventory/stock.updated",
                        data: {
                            productIds: [productId],
                        },
                    });
                }

                break;
            }

            case "payment_intent.canceled": {
                const paymentIntent =
                    event.data.object as Stripe.PaymentIntent;

                const paymentIntentId = paymentIntent.id;

                console.log(
                    `Payment canceled: ${paymentIntentId}`
                );

                const sessions =
                    await stripe.checkout.sessions.list({
                        payment_intent: paymentIntentId,
                        limit: 1,
                    });

                const session = sessions.data[0];

                if (!session) {
                    console.warn(
                        `No Checkout Session found for canceled PaymentIntent: ${paymentIntentId}`
                    );

                    break;
                }

                const orderId = session.metadata?.orderId;

                if (!orderId) {
                    console.warn(
                        `No orderId found for canceled PaymentIntent: ${paymentIntentId}`
                    );

                    break;
                }

                await prisma.order.deleteMany({
                    where: {
                        id: orderId,
                        isPaid: false,
                    },
                });

                console.log(
                    `Unpaid canceled order removed: ${orderId}`
                );

                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent =
                    event.data.object as Stripe.PaymentIntent;

                const paymentIntentId = paymentIntent.id;

                console.log(
                    `Payment failed: ${paymentIntentId}`
                );

                const sessions =
                    await stripe.checkout.sessions.list({
                        payment_intent: paymentIntentId,
                        limit: 1,
                    });

                const session = sessions.data[0];

                if (!session) {
                    console.warn(
                        `No Checkout Session found for failed PaymentIntent: ${paymentIntentId}`
                    );

                    break;
                }

                const orderId = session.metadata?.orderId;

                if (!orderId) {
                    console.warn(
                        `No orderId found for failed PaymentIntent: ${paymentIntentId}`
                    );

                    break;
                }

                await prisma.order.deleteMany({
                    where: {
                        id: orderId,
                        isPaid: false,
                    },
                });

                console.log(
                    `Unpaid failed order removed: ${orderId}`
                );

                break;
            }

            default: {
                console.log(
                    `Unhandled Stripe event type: ${event.type}`
                );

                break;
            }
        }

        return response.status(200).json({
            received: true,
        });
    } catch (error) {
        console.error(
            "Stripe webhook processing error:",
            error
        );

        return response.status(500).json({
            success: false,
            message: "Webhook processing failed",
        });
    }
};

