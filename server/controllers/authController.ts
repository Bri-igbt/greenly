import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";

// Generate JWT Token
const generateToken = (id: string): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// Check if user is an admin
const getAdminStatus = (email?: string | null): boolean => {
    if (!email) return false;

    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS
            .split(",")
            .map((email) => email.trim().toLowerCase())
        : [];

    return adminEmails.includes(email.toLowerCase());
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({
                message: "Please provide all fields",
            });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        });

        if (existingUser) {
            res.status(400).json({
                message: "User already exists with this email",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
            },
        });

        const token = generateToken(user.id);

        const { password: _, ...userData } = user;

        res.status(201).json({
            user: {
                ...userData,
                isAdmin: getAdminStatus(user.email),
            },
            token,
        });
    } catch (error) {
        console.error("Register Error:", error);

        res.status(500).json({
        message: "Internal Server Error",
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                message: "Please provide email and password",
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
            },
            include: {
                addresses: true,
            },
        });

        if (!user) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
        res.status(401).json({
            message: "Invalid email or password",
        });
        return;
        }

        const token = generateToken(user.id);

        const { password: _, ...userData } = user;

        res.status(200).json({
        user: {
            ...userData,
            isAdmin: getAdminStatus(user.email),
        },
        token,
        });
    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};