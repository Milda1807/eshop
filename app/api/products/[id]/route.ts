import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Product, { IProduct } from '../../../lib/models/Product';
import mongoose from 'mongoose';

interface ProductPutBody {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    stock?: number;
    imageUrl?: string;
}

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

interface RouteParams {
    params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    if (!isValidObjectId(id)) {
        return NextResponse.json({ success: false, error: 'Neplatné ID produktu.' }, { status: 400 });
    }

    try {
        await connectDB();
        const product = await Product.findById(id).lean();

        if (!product) {
            return NextResponse.json({ success: false, error: 'Produkt nenalezen.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: product }, { status: 200 });
    } catch (error: any) {
        console.error(`API GET /api/products/${id} chyba:`, error);
        return NextResponse.json({
            success: false,
            error: 'Chyba serveru při získávání produktu.',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    if (!isValidObjectId(id)) {
        return NextResponse.json({ success: false, error: 'Neplatné ID produktu.' }, { status: 400 });
    }

    try {
        await connectDB();
        const body = await request.json() as ProductPutBody;

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { ...body },
            {
                new: true,
                runValidators: true,
            }
        ).lean();

        if (!updatedProduct) {
            return NextResponse.json({ success: false, error: 'Produkt nenalezen pro aktualizaci.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });
    } catch (error: any) {
        console.error(`API PUT /api/products/${id} chyba:`, error);
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
            error: 'Chyba serveru při aktualizaci produktu.',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = params;

    if (!isValidObjectId(id)) {
        return NextResponse.json({ success: false, error: 'Neplatné ID produktu.' }, { status: 400 });
    }

    try {
        await connectDB();
        const deletedProduct = await Product.findByIdAndDelete(id).lean();

        if (!deletedProduct) {
            return NextResponse.json({ success: false, error: 'Produkt nenalezen pro smazání.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Produkt úspěšně smazán.' }, { status: 200 });
    } catch (error: any) {
        console.error(`API DELETE /api/products/${id} chyba:`, error);
        return NextResponse.json({
            success: false,
            error: 'Chyba serveru při mazání produktu.',
            details: error.message
        }, { status: 500 });
    }
}