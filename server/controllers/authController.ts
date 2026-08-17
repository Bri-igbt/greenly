import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

// =====================================================
// GENERATE JWT TOKEN
// =====================================================

const generateToken = (id: string): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(
        { id },
        secret,
        {
            expiresIn: "30d",
        }
    );
};

// =====================================================
// CHECK ADMIN STATUS
// =====================================================

const getAdminStatus = (
    email?: string | null
): boolean => {
    if (!email) {
        return false;
    }

    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS
              .split(",")
              .map((email) =>
                  email.trim().toLowerCase()
              )
        : [];

    return adminEmails.includes(
        email.toLowerCase()
    );
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

export const register = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        // Validate fields
        if (!name || !email || !password) {
            res.status(400).json({
                message:
                    "Please provide name, email and password",
            });
            return;
        }

        // Validate password
        if (String(password).length < 6) {
            res.status(400).json({
                message:
                    "Password must be at least 6 characters",
            });
            return;
        }

        // Normalize values
        const normalizedEmail = String(email)
            .trim()
            .toLowerCase();

        const normalizedName = String(name).trim();

        // Check existing user
        const existingUser =
            await prisma.user.findUnique({
                where: {
                    email: normalizedEmail,
                },
            });

        if (existingUser) {
            res.status(400).json({
                message:
                    "User already exists with this email",
            });
            return;
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                String(password),
                10
            );

        // Create user
        const user = await prisma.user.create({
            data: {
                name: normalizedName,
                email: normalizedEmail,
                password: hashedPassword,
            },
        });

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const {
            password: _password,
            ...userData
        } = user;

        res.status(201).json({
            user: {
                ...userData,
                isAdmin: getAdminStatus(
                    user.email
                ),
            },
            token,
        });

    } catch (error: any) {
        console.error(
            "================================="
        );

        console.error(
            "REGISTER ERROR:"
        );

        console.error(error);

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "CODE:",
            error?.code
        );

        console.error(
            "META:",
            error?.meta
        );

        console.error(
            "================================="
        );

        res.status(500).json({
            message:
                error?.message ||
                "Internal Server Error",
        });
    }
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

export const login = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            res.status(400).json({
                message:
                    "Please provide email and password",
            });
            return;
        }

        const normalizedEmail = String(email)
            .trim()
            .toLowerCase();

        // Find user
        const user =
            await prisma.user.findUnique({
                where: {
                    email: normalizedEmail,
                },
                include: {
                    addresses: true,
                },
            });

        if (!user) {
            res.status(401).json({
                message:
                    "Invalid email or password",
            });
            return;
        }

        // Compare password
        const isMatch =
            await bcrypt.compare(
                String(password),
                user.password
            );

        if (!isMatch) {
            res.status(401).json({
                message:
                    "Invalid email or password",
            });
            return;
        }

        // Generate token
        const token = generateToken(user.id);

        // Remove password
        const {
            password: _password,
            ...userData
        } = user;

        res.status(200).json({
            user: {
                ...userData,
                isAdmin: getAdminStatus(
                    user.email
                ),
            },
            token,
        });

    } catch (error: any) {
        console.error(
            "================================="
        );

        console.error(
            "LOGIN ERROR:"
        );

        console.error(error);

        console.error(
            "MESSAGE:",
            error?.message
        );

        console.error(
            "CODE:",
            error?.code
        );

        console.error(
            "META:",
            error?.meta
        );

        console.error(
            "================================="
        );

        res.status(500).json({
            message:
                error?.message ||
                "Internal Server Error",
        });
    }
};