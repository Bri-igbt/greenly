import { Request, Response } from "express";
import { prisma } from "../config/prisma";

// GET USER ADDRESSES
// GET /api/addresses
export const getAddresses = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const addresses = await prisma.address.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({ addresses });
    } catch (error: any) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// ADD ADDRESS
// POST /api/addresses
export const addAddress = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const {
            label,
            address,
            city,
            state,
            zip,
            isDefault,
            lat,
            lng,
        } = req.body;

        // Only address fields are required
        if (
            !label ||
            !address ||
            !city ||
            !state ||
            !zip
        ) {
            return res.status(400).json({
                message:
                    "Please provide all required fields.",
            });
        }

        const currentAddresses =
            await prisma.address.findMany({
                where: {
                    userId: req.user.id,
                },
            });

        let makeDefault = Boolean(isDefault);

        // First address automatically becomes default
        if (currentAddresses.length === 0) {
            makeDefault = true;
        }

        // Remove default from existing addresses
        if (makeDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: req.user.id,
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const createdAddress =
            await prisma.address.create({
                data: {
                    userId: req.user.id,

                    label,
                    address,
                    city,
                    state,
                    zip,

                    isDefault: makeDefault,

                    // GPS is optional
                    lat:
                        lat != null
                            ? Number(lat)
                            : null,

                    lng:
                        lng != null
                            ? Number(lng)
                            : null,
                },
            });

        const addresses =
            await prisma.address.findMany({
                where: {
                    userId: req.user.id,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

        return res.status(201).json({
            addresses,
            address: createdAddress,
        });
    } catch (error: any) {
        console.error(
            "Add Address Error:",
            error
        );

        return res.status(500).json({
            message:
                error?.message ||
                "Failed to add address",
        });
    }
};


// UPDATE ADDRESS
// PUT /api/addresses/:id
export const updateAddress = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const {
            label,
            address,
            city,
            state,
            zip,
            isDefault,
            lat,
            lng,
        } = req.body;

        if (lat == null || lng == null) {
            return res.status(400).json({
                message:
                    "Location coordinates are required. Please allow location access.",
            });
        }

        const existingAddress = await prisma.address.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingAddress) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        if (isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: req.user.id,
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const data: any = {};

        if (label !== undefined) data.label = label;
        if (address !== undefined) data.address = address;
        if (city !== undefined) data.city = city;
        if (state !== undefined) data.state = state;
        if (zip !== undefined) data.zip = zip;
        if (isDefault !== undefined) data.isDefault = isDefault;
        if (lat !== undefined) data.lat = Number(lat);
        if (lng !== undefined) data.lng = Number(lng);

        await prisma.address.update({
            where: {
                id: existingAddress.id,
            },
            data,
        });

        const addresses = await prisma.address.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({
            addresses,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to update address",
            error: error.message,
        });
    }
};

// DELETE ADDRESS
// DELETE /api/addresses/:id
export const deleteAddress = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        const address = await prisma.address.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        await prisma.address.delete({
            where: {
                id: address.id,
            },
        });

        const addresses = await prisma.address.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return res.status(200).json({
            addresses,
        });
    } catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to delete address",
            error: error.message,
        });
    }
};