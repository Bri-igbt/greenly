import { Request, Response } from "express";
import { prisma } from "../config/prisma";


// GET
// /api/products/flash-deals
export const getFlashDeals = async (req:Request, res:Response) => {
    const products = await prisma.product.findMany({
        where: {stock: {gt: 0}},
        orderBy: {originalPrice: "desc"}
    })

    const productsWithDiscount = products.map((p: any)=> {
        const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        return {...p, discount}
    })

    res.json({ products: productsWithDiscount.slice(0,8)})
}

// GET
// /api/products
// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            sort,
            organic,
            page = "1",
            limit = "12",
        } = req.query;

        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.max(Number(limit) || 12, 1);
        const skip = (currentPage - 1) * pageLimit;

        const where: any = {};

        // Category filter
        if (
            category &&
            typeof category === "string" &&
            category !== "all"
        ) {
            where.category = category;
        }

        // Search filter
        if (search && typeof search === "string") {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        // Price filter
        if (minPrice || maxPrice) {
            where.price = {};

            if (minPrice) {
                where.price.gte = Number(minPrice);
            }

            if (maxPrice) {
                where.price.lte = Number(maxPrice);
            }
        }

        // Sorting
        let orderBy: any = {
            createdAt: "desc",
        };

        if (sort === "price-low") {
            orderBy = {
                price: "asc",
            };
        } else if (sort === "price-high") {
            orderBy = {
                price: "desc",
            };
        }

        // Get total number of matching products
        const totalProducts = await prisma.product.count({
            where,
        });

        // Get products
        const products = await prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: pageLimit,
        });

        // Calculate discounts
        const productsWithDiscount = products.map((product) => {
            const discount =
                product.originalPrice &&
                product.originalPrice > product.price
                    ? Math.round(
                          ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                      )
                    : 0;

            return {
                ...product,
                discount,
            };
        });

        const totalPages = Math.ceil(
            totalProducts / pageLimit
        );

        return res.status(200).json({
            products: productsWithDiscount,
            page: currentPage,
            limit: pageLimit,
            totalProducts,
            pages: totalPages,
        });
    } catch (error: any) {
        console.error("Get Products Error:", error);

        return res.status(500).json({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};
// GET
// /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({where: { id: req.params.id as string}})

    if(!product){
        res.status(404).json({message: "Product not found"})
        return;
    }

    const discount = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    res.json({product: {...product, discount}})
}

// POST
// /api/products/:id
export const createProduct = async (
    req: Request,
    res: Response
) => {
    try {
        console.log("========== CREATE PRODUCT ==========");
        console.log("Request body:", req.body);

        const product = await prisma.product.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                price: Number(req.body.price),
                originalPrice:
                    req.body.originalPrice !== null &&
                    req.body.originalPrice !== undefined &&
                    req.body.originalPrice !== ""
                        ? Number(req.body.originalPrice)
                        : null,
                image: req.body.image,
                category: req.body.category,
                unit: req.body.unit,
                stock: Number(req.body.stock),
                isOrganic: Boolean(req.body.isOrganic),
            },
        });

        console.log(
            "Product created successfully:",
            product.id
        );

        return res.status(201).json({
            product,
        });

    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to create product",
            error: error.message,
        });
    }
};

// PUT
// /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
    const product = await prisma.product.update({
        where: {id: req.params.id as string},
        data: req.body
    })
    res.json({product})
}

// DELETE
// /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
    await prisma.product.update({
        where: {id: req.params.id as string },
        data: { stock: Number(0)}
    })
    res.json({message: "Product Updated"})
}
