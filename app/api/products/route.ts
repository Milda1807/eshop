import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../lib/db';
import Product, { IProduct } from '../../lib/models/Product'
import mongoose from 'mongoose';


interface ProductPostBody {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    imageUrl?: string;
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const category = searchParams.get('category');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrderParam = searchParams.get('sortOrder');
        const sortOrder = sortOrderParam === 'desc' ? -1 : 1;

        let query: mongoose.FilterQuery<IProduct> = {};
        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort({ [sortBy]: sortOrder as 1 | -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        return NextResponse.json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages,
            currentPage: page,
            data: products,
        }, { status: 200 });

    } catch (error: any) {
        console.error("API GET /api/products chyba:", error);
        return NextResponse.json({
            success: false,
            error: 'Chyba serveru při získávání produktů.',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json() as ProductPostBody;

        const { name, description, price, category, stock, imageUrl } = body;
        if (!name || !description || price === undefined || !category || stock === undefined) {
            return NextResponse.json({
                success: false,
                error: 'Chybějící povinná pole: name, description, price, category, stock.'
            }, { status: 400 });
        }


        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl,
        });
        await newProduct.save();

        return NextResponse.json({ success: true, data: newProduct.toObject() }, { status: 201 });
    } catch (error: any) {
        console.error("API POST /api/products chyba:", error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err: any) => err.message);
            return NextResponse.json({
                success: false,
                error: 'Validační chyba.',
                details: errors
            }, { status: 400 });
        }
        return NextResponse.json({
            success: false,
            error: 'Chyba serveru při vytváření produktu.',
            details: error.message
        }, { status: 500 });
    }
}